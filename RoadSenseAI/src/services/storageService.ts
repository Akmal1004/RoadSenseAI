import { ChatMessage } from "../types/chat";
import { RoutePlan, TravelPreference } from "../types/route";

const keys = {
  recentDestinations: "roadsense:recent-destinations",
  routePlan: "roadsense:route-plan",
  preferences: "roadsense:preferences",
  chat: "roadsense:chat",
  stats: "roadsense:stats"
};

export type LocalTripStats = {
  plannedTrips: number;
  totalDistance: number;
  totalEta: number;
  fuelUsed: number;
  fuelCost: number;
  bestSafetyScore: number;
  lastUpdated?: number;
};

export type UserPreferences = {
  defaultRouteType: TravelPreference;
  vehicleMileage: number;
  fuelPrice: number;
  units: "metric" | "imperial";
};

export const defaultPreferences: UserPreferences = {
  defaultRouteType: "safest",
  vehicleMileage: 15,
  fuelPrice: 100,
  units: "metric"
};

export const defaultTripStats: LocalTripStats = {
  plannedTrips: 0,
  totalDistance: 0,
  totalEta: 0,
  fuelUsed: 0,
  fuelCost: 0,
  bestSafetyScore: 0
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`[RoadSense Storage] Failed to read ${key}; using fallback`, error);
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[RoadSense Storage] Failed to write ${key}`, error);
  }
}

export const storageService = {
  getRecentDestinations: () => readJson<string[]>(keys.recentDestinations, []),
  async addRecentDestination(destination: string) {
    const current = await storageService.getRecentDestinations();
    const next = [destination, ...current.filter((item) => item !== destination)].slice(0, 8);
    await writeJson(keys.recentDestinations, next);
  },
  getRoutePlan: () => readJson<RoutePlan | null>(keys.routePlan, null),
  saveRoutePlan: (plan: RoutePlan | null) => writeJson(keys.routePlan, plan),
  getTripStats: () => readJson<LocalTripStats>(keys.stats, defaultTripStats),
  async recordPlannedTrip(plan: RoutePlan) {
    const current = await storageService.getTripStats();
    const bestRoute = plan.routes[0];
    const next: LocalTripStats = {
      plannedTrips: current.plannedTrips + 1,
      totalDistance: current.totalDistance + bestRoute.distance,
      totalEta: current.totalEta + bestRoute.eta,
      fuelUsed: current.fuelUsed + bestRoute.fuelUsage,
      fuelCost: current.fuelCost + bestRoute.fuelCost,
      bestSafetyScore: Math.max(current.bestSafetyScore, bestRoute.safetyScore),
      lastUpdated: Date.now()
    };
    await writeJson(keys.stats, next);
  },
  getPreferences: () => readJson<UserPreferences>(keys.preferences, defaultPreferences),
  savePreferences: (preferences: UserPreferences) => writeJson(keys.preferences, preferences),
  getChatHistory: () => readJson<ChatMessage[]>(keys.chat, []),
  saveChatHistory: (messages: ChatMessage[]) => writeJson(keys.chat, messages.slice(-40)),
  async clearChatHistory() {
    try {
      localStorage.removeItem(keys.chat);
    } catch (error) {
      console.warn("[RoadSense Storage] Chat clear failed", error);
    }
  }
};
