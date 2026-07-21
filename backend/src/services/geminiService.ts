import axios from "axios";
import { GeminiScope, RoutePlan } from "../types";

const cacheTtlMs = 10 * 60 * 1000;
const responseCache = new Map<string, { expiresAt: number; text: string }>();

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim();
}

function getModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.1-flash-lite";
}

export async function askGemini(prompt: string, scope: GeminiScope = "assistant"): Promise<string> {
  const cacheKey = `${scope}:${hashString(prompt)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const apiKey = getApiKey();
  if (!apiKey) {
    const demo = getDemoResponse(prompt);
    setCached(cacheKey, demo);
    return demo;
  }

  const model = getModel();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  try {
    const { data } = await axios.post(
      endpoint,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are RoadSense AI Co-Pilot. Give concise navigation, route, weather, safety, and fuel guidance. User: ${prompt}`
              }
            ]
          }
        ]
      },
      { timeout: 18000 }
    );

    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I could not generate guidance right now.";
    setCached(cacheKey, result);
    return result;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      throw new Error("AI service is temporarily busy. Please wait a minute and try again.");
    }
    throw new Error("AI service is temporarily unavailable. Please try again shortly.");
  }
}

export async function generateRouteInsights(
  plan: RoutePlan,
  scope: GeminiScope = "home-insights"
): Promise<string[]> {
  const bestRoute = plan.routes[0];
  const prompt = [
    "You are RoadSense AI Co-Pilot.",
    "Return exactly 3 short bullet-style trip insights without markdown bullets.",
    `Source: ${plan.source}`,
    `Destination: ${plan.destination}`,
    `Preference: ${plan.preference}`,
    `Best route: ${bestRoute.name}, ${bestRoute.distance} km, ${bestRoute.eta} minutes, safety ${
      bestRoute.safetyScore
    }/100, fuel ${bestRoute.fuelUsage.toFixed(2)} L.`
  ].join("\n");

  const rawText = await askGemini(prompt, scope);

  return rawText
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function getCached(key: string): string | null {
  const item = responseCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return item.text;
}

function setCached(key: string, text: string) {
  responseCache.set(key, { expiresAt: Date.now() + cacheTtlMs, text });
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `${hash}`;
}

function getDemoResponse(prompt: string): string {
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
