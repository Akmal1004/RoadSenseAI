import axios from "axios";
import { RoutePlan } from "../types/route";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const model = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
const GEMINI_THROTTLE_MS = 3000; // Lowered throttle slightly for web user responsiveness
const CACHE_TTL_MS = 10 * 60 * 1000;
export const AI_RATE_LIMIT_MESSAGE = "AI service is temporarily busy. Please wait a minute and try again.";
export const AI_THROTTLE_MESSAGE = "Please wait a few seconds before asking AI again.";

export type GeminiScope = "assistant" | "home-insights" | "route-analysis";

export type GeminiTextResponse = {
  text: string;
  model: string;
  cached: boolean;
};

type GeminiRequestContext = {
  screen: string;
  reason: string;
};

export type AIServiceErrorCode = "rate_limited" | "throttled" | "bad_request" | "forbidden" | "unavailable";

export class AIServiceError extends Error {
  code: AIServiceErrorCode;
  status?: number;

  constructor(message: string, code: AIServiceErrorCode, status?: number) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.status = status;
  }
}

const responseCache = new Map<string, { expiresAt: number; response: GeminiTextResponse }>();
const loggedErrorKeys = new Set<string>();
let lastNetworkRequestAt = 0;
let activeRequest: { scope: GeminiScope; controller: AbortController } | null = null;

export async function askRoadSenseAI(prompt: string, scope: GeminiScope = "assistant"): Promise<string> {
  const response = await generateGeminiText({
    prompt: `You are RoadSense AI Co-Pilot. Give concise navigation, route, weather, safety, and fuel guidance. User: ${prompt}`,
    scope,
    context: { screen: "Assistant", reason: "user_message" }
  });
  return response.text;
}

export async function generateRouteInsights(plan: RoutePlan, scope: GeminiScope = "home-insights"): Promise<string[]> {
  const bestRoute = plan.routes[0];
  const response = await generateGeminiText({
    scope,
    context: { screen: "Home", reason: "route_analysis" },
    prompt: [
      "You are RoadSense AI Co-Pilot.",
      "Return exactly 3 short bullet-style trip insights without markdown bullets.",
      `Source: ${plan.source}`,
      `Destination: ${plan.destination}`,
      `Preference: ${plan.preference}`,
      `Best route: ${bestRoute.name}, ${bestRoute.distance} km, ${bestRoute.eta} minutes, safety ${bestRoute.safetyScore}/100, fuel ${bestRoute.fuelUsage.toFixed(2)} L.`
    ].join("\n")
  });

  return response.text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function cancelGeminiRequest(scope?: GeminiScope) {
  if (!activeRequest) return;
  if (!scope || activeRequest.scope === scope) {
    activeRequest.controller.abort();
    activeRequest = null;
  }
}

async function generateGeminiText({
  prompt,
  scope,
  context
}: {
  prompt: string;
  scope: GeminiScope;
  context: GeminiRequestContext;
}): Promise<GeminiTextResponse> {
  const cacheKey = createCacheKey(scope, prompt);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    logGeminiRequest(context, "hit");
    return cached;
  }

  logGeminiRequest(context, "miss");

  if (!apiKey) {
    const response = { text: demoResponse(prompt), model: "demo", cached: false };
    setCachedResponse(cacheKey, response);
    return response;
  }

  guardScope(scope);
  const controller = new AbortController();
  activeRequest = { scope, controller };

  try {
    const { data } = await axios.post(
      `${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      { signal: controller.signal, timeout: 18000 }
    );
    const response = {
      text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I could not generate a trip insight right now.",
      model,
      cached: false
    };
    setCachedResponse(cacheKey, response);
    return response;
  } catch (error) {
    throw normalizeGeminiError(error);
  } finally {
    if (activeRequest?.controller === controller) {
      activeRequest = null;
    }
  }
}

function guardScope(scope: GeminiScope) {
  if (activeRequest) {
    throw new AIServiceError("AI is already working on that request.", "throttled");
  }

  const now = Date.now();
  if (now - lastNetworkRequestAt < GEMINI_THROTTLE_MS) {
    throw new AIServiceError(AI_THROTTLE_MESSAGE, "throttled");
  }

  lastNetworkRequestAt = now;
}

function normalizeGeminiError(error: any): AIServiceError {
  if (axios.isCancel(error)) {
    return new AIServiceError("AI request was cancelled.", "unavailable");
  }

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  const responseMessage = axios.isAxiosError(error) ? error.response?.data?.error?.message : undefined;

  if (status === 429) {
    logErrorOnce("429", responseMessage ?? AI_RATE_LIMIT_MESSAGE);
    return new AIServiceError(AI_RATE_LIMIT_MESSAGE, "rate_limited", status);
  }
  if (status === 400) {
    logErrorOnce("400", responseMessage ?? "Bad Gemini request.");
    return new AIServiceError("AI service could not process this request.", "bad_request", status);
  }
  if (status === 403) {
    logErrorOnce("403", responseMessage ?? "Gemini API key is not allowed.");
    return new AIServiceError("AI service is not enabled for this app.", "forbidden", status);
  }

  logErrorOnce(status ? `${status}` : "network", responseMessage ?? "Gemini request failed.");
  return new AIServiceError("AI service is temporarily unavailable. Please try again shortly.", "unavailable", status);
}

function logErrorOnce(key: string, message: string) {
  if (loggedErrorKeys.has(key)) return;
  loggedErrorKeys.add(key);
  console.warn(`[RoadSense AI] ${message}`);
}

function getCachedResponse(cacheKey: string): GeminiTextResponse | null {
  const cached = responseCache.get(cacheKey);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    responseCache.delete(cacheKey);
    return null;
  }

  return { ...cached.response, cached: true };
}

function setCachedResponse(cacheKey: string, response: GeminiTextResponse) {
  responseCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    response: { ...response, cached: false }
  });
}

function createCacheKey(scope: GeminiScope, prompt: string): string {
  return `${scope}:${hashString(prompt)}`;
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return `${hash}`;
}

function logGeminiRequest(context: GeminiRequestContext, cacheStatus: "hit" | "miss") {
  console.info(
    `[RoadSense AI] ${new Date().toISOString()} screen=${context.screen} reason=${context.reason} cache=${cacheStatus}`
  );
}

function demoResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("weather")) {
    return "Weather impact looks moderate. Keep a little extra braking distance and prefer the safest route if rain probability rises.";
  }
  if (lower.includes("fuel")) {
    return "The eco route is the better pick for fuel savings. It may add a few minutes, but reduces stop-and-go driving.";
  }
  if (lower.includes("traffic")) {
    return "Traffic is usually heavier near junctions and toll points. Leaving 15 minutes earlier should protect your ETA.";
  }
  return "I recommend the safest route first: it balances ETA, smoother traffic, fuel use, and weather impact for a calmer trip.";
}
