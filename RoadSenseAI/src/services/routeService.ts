import axios from "axios";
import { mockRoutes } from "../constants/mockData";
import { getPlaceDetails, searchPlaces } from "./searchService";
import { Coordinate, RouteOption, RoutePlan, TravelPreference } from "../types/route";

const ORS_BASE_URL = "https://api.openrouteservice.org";
const orsApiKey = import.meta.env.VITE_ORS_API_KEY?.trim();
const mileage = 15;
const fuelPrice = 100;
const defaultCurrentLocation: Coordinate = { latitude: 13.0827, longitude: 80.2707 };

type PlanInput = {
  source: string;
  destination: string;
  preference: TravelPreference;
  sourceCoordinate?: Coordinate | null;
  destinationCoordinate?: Coordinate | null;
};

export type LocationSearchResult = {
  id: string;
  label: string;
  coordinate: Coordinate;
};

export async function planRoutes(input: PlanInput): Promise<RoutePlan> {
  if (!orsApiKey) {
    return buildMockPlan(input);
  }

  try {
    const [sourceCoordinate, destinationCoordinate] = await Promise.all([
      input.sourceCoordinate ?? geocodeSource(input.source),
      input.destinationCoordinate ?? geocode(input.destination)
    ]);
    const routes = await directions(sourceCoordinate, destinationCoordinate, input.preference);

    return {
      ...input,
      sourceCoordinate,
      destinationCoordinate,
      routes
    };
  } catch (error: any) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error("No internet connection. Please check your network.");
    }
    throw new Error(error instanceof Error ? error.message : "Routes unavailable. Please try again.");
  }
}

async function geocode(location: string): Promise<Coordinate> {
  const parsed = parseCoordinateInput(location);
  if (parsed) {
    return parsed;
  }

  const normalizedLocation = normalizeLocationQuery(location);
  const suggestions = await searchPlaces(normalizedLocation, { locationBias: defaultCurrentLocation });
  const bestSuggestion = suggestions[0];
  if (!bestSuggestion) {
    throw new Error("Location not found. Try a more specific place.");
  }
  const details = await getPlaceDetails(bestSuggestion.placeId);
  return details.coordinate;
}

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  const normalizedQuery = normalizeLocationQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const suggestions = await searchPlaces(normalizedQuery, { locationBias: defaultCurrentLocation });
  const details = await Promise.all(suggestions.slice(0, 6).map((suggestion) => getPlaceDetails(suggestion.placeId)));
  return details.map((place) => ({
    id: place.placeId,
    label: place.name || place.address,
    coordinate: place.coordinate
  }));
}

async function geocodeSource(location: string): Promise<Coordinate> {
  const normalized = location.trim().toLowerCase();
  if (!normalized || normalized === "current location" || normalized === "my location") {
    return defaultCurrentLocation;
  }

  return geocode(location);
}

async function directions(
  source: Coordinate,
  destination: Coordinate,
  preference: TravelPreference
): Promise<RouteOption[]> {
  const data = await requestDirections(source, destination, true).catch(async (error: any) => {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      return requestDirections(source, destination, false);
    }
    throw error;
  });

  const features = data.features ?? [];
  if (!features.length) {
    throw new Error("Routes unavailable. No route options were found.");
  }

  type Candidate = {
    distance: number;
    eta: number; // minutes
    fuelUsage: number; // liters (derived)
    coordinates: Coordinate[];
    safetyScore?: number;
    trafficScore?: number;
    fuelScore?: number;
    score?: number;
  };

  const candidates: Candidate[] = features.map((feature: any) => {
    const summary = feature.properties.summary;
    const distance = Number(summary.distance);
    const eta = Number(summary.duration) / 60;
    const fuelUsage = distance / mileage;

    return {
      distance,
      eta,
      fuelUsage,
      coordinates: feature.geometry.coordinates.map(([longitude, latitude]: number[]) => ({
        latitude,
        longitude
      }))
    };
  });

  const etaSorted = [...candidates].sort((a, b) => a.eta - b.eta); // fastest first
  const n = candidates.length;

  for (const candidate of candidates) {
    const etaRankFast = etaSorted.indexOf(candidate);
    const slowRank = (n - 1) - etaRankFast;
    const safety = Math.max(78, 96 - slowRank * 6);
    const traffic = Math.max(72, 94 - candidate.eta / 2);
    const fuel = Math.max(70, 100 - candidate.fuelUsage * 8);
    const weather = 88;
    const score = Math.round(0.5 * safety + 0.2 * traffic + 0.2 * fuel + 0.1 * weather);

    candidate.safetyScore = Math.round(safety);
    candidate.trafficScore = Math.round(traffic);
    candidate.fuelScore = Math.round(fuel);
    candidate.score = score;
  }

  const safestCandidate = candidates.reduce((best, c) => (c.safetyScore! > best.safetyScore! ? c : best), candidates[0]);
  const fastestCandidate = candidates.reduce((best, c) => (c.eta < best.eta ? c : best), candidates[0]);
  const ecoCandidate = candidates.reduce((best, c) => (c.fuelUsage < best.fuelUsage ? c : best), candidates[0]);

  function toRouteOption(category: TravelPreference): RouteOption {
    const pick =
      category === "safest" ? safestCandidate : category === "fastest" ? fastestCandidate : ecoCandidate;

    const trafficStatus = category === "safest" ? "Moderate" : "Clear";
    const weatherImpact = category === "fastest" ? "Medium" : "Low";
    const badge = category === "safest" ? "RECOMMENDED" : category === "fastest" ? "FASTEST" : "ECO";
    const name = category === "safest" ? "Safest Route" : category === "fastest" ? "Fastest Route" : "Eco Route";

    return {
      id: category,
      name,
      badge,
      safetyScore: pick.safetyScore!,
      distance: round(pick.distance),
      eta: Math.round(pick.eta),
      fuelUsage: round(pick.fuelUsage),
      fuelCost: Math.round(pick.fuelUsage * fuelPrice),
      trafficStatus,
      weatherImpact,
      score: pick.score!,
      coordinates: pick.coordinates
    };
  }

  const order: Array<TravelPreference> =
    preference === "safest" ? ["safest", "fastest", "eco"] : preference === "fastest" ? ["fastest", "safest", "eco"] : ["eco", "safest", "fastest"];

  return order.map((cat) => toRouteOption(cat));
}

async function requestDirections(
  source: Coordinate,
  destination: Coordinate,
  alternatives: boolean
): Promise<any> {
  const body: Record<string, unknown> = {
    coordinates: [
      [source.longitude, source.latitude],
      [destination.longitude, destination.latitude]
    ],
    instructions: false,
    units: "km"
  };

  if (alternatives) {
    body.alternative_routes = { target_count: 3, weight_factor: 1.6, share_factor: 0.6 };
  }

  const { data } = await axios.post(
    `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
    body,
    {
      headers: { Authorization: orsApiKey },
      timeout: 22000
    }
  );

  return data;
}

function buildMockPlan(input: PlanInput): RoutePlan {
  const routes = sortRoutes(mockRoutes, input.preference);
  return {
    ...input,
    sourceCoordinate: routes[0].coordinates[0],
    destinationCoordinate: routes[0].coordinates[routes[0].coordinates.length - 1],
    routes
  };
}

function sortRoutes(routes: RouteOption[], preference: TravelPreference): RouteOption[] {
  const sorted = [...routes];
  if (preference === "fastest") sorted.sort((a, b) => a.eta - b.eta);
  if (preference === "eco") sorted.sort((a, b) => a.fuelUsage - b.fuelUsage);
  if (preference === "safest") sorted.sort((a, b) => b.safetyScore - a.safetyScore);
  return sorted;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeLocationQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function parseCoordinateInput(value: string): Coordinate | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }

  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}
