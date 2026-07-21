import axios from "axios";
import {
  Coordinate,
  LocationResult,
  ORSDirectionsFeature,
  ORSDirectionsResponse,
  ORSFeature,
  PlaceDetails,
  PlaceSuggestion,
  PlanInput,
  RouteOption,
  RoutePlan,
  TravelPreference
} from "../types";

const ORS_BASE_URL = "https://api.openrouteservice.org";
const maxSearchCacheEntries = 50;
const searchCache = new Map<string, PlaceSuggestion[]>();
const detailsCache = new Map<string, PlaceDetails>();
const reverseGeocodeCache = new Map<string, LocationResult>();

const mileage = 15;
const fuelPrice = 100;
const defaultCurrentLocation: Coordinate = { latitude: 13.0827, longitude: 80.2707 };

function getApiKey(): string | undefined {
  return process.env.ORS_API_KEY?.trim();
}

function ensureApiKey(): string {
  const key = getApiKey();
  if (!key) {
    throw new Error("OpenRouteService API key is missing on backend. Set ORS_API_KEY in environment variables.");
  }
  return key;
}

export async function searchPlaces(
  query: string,
  locationBias?: Coordinate | null
): Promise<PlaceSuggestion[]> {
  const apiKey = ensureApiKey();
  const normalizedQuery = normalizeQuery(query);
  if (normalizedQuery.length < 2) return [];

  const cacheKey = `search:${normalizedQuery.toLowerCase()}:${coordinateCacheKey(locationBias)}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const params: Record<string, string | number> = {
    api_key: apiKey,
    text: normalizedQuery,
    size: 8,
    "boundary.country": "IN"
  };

  if (locationBias) {
    params["focus.point.lat"] = locationBias.latitude;
    params["focus.point.lon"] = locationBias.longitude;
  }

  const { data } = await axios
    .get(`${ORS_BASE_URL}/geocode/autocomplete`, { params, timeout: 12000 })
    .catch((error: unknown) => {
      throw friendlySearchError(error);
    });

  const suggestions = rankFeatures((data.features as ORSFeature[]) ?? [], normalizedQuery, locationBias).map(
    (feature): PlaceSuggestion => {
      const details = featureToPlaceDetails(feature, locationBias);
      detailsCache.set(details.placeId, details);
      return {
        id: details.id,
        placeId: details.placeId,
        primaryText: details.name,
        secondaryText: details.address,
        description: details.address,
        category: details.category,
        distanceKm: details.distanceKm
      };
    }
  );

  setSearchCache(cacheKey, suggestions);
  return suggestions;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const cached = detailsCache.get(placeId);
  if (cached) return cached;
  throw new Error("Place details expired or not found. Please search again.");
}

export async function searchNearbyPlaces(
  query: string,
  location: Coordinate,
  category?: string
): Promise<LocationResult[]> {
  const apiKey = ensureApiKey();
  const normalizedQuery = normalizeQuery(query);
  const cacheKey = `nearby:${normalizedQuery.toLowerCase()}:${coordinateCacheKey(location)}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached.map(suggestionToLocationResult);

  const params: Record<string, string | number> = {
    api_key: apiKey,
    text: normalizedQuery,
    size: 10,
    "boundary.country": "IN",
    "focus.point.lat": location.latitude,
    "focus.point.lon": location.longitude
  };

  const { data } = await axios
    .get(`${ORS_BASE_URL}/geocode/search`, { params, timeout: 12000 })
    .catch((error: unknown) => {
      throw friendlySearchError(error);
    });

  const results = rankFeatures((data.features as ORSFeature[]) ?? [], normalizedQuery, location).map(
    (feature): LocationResult => {
      const details = featureToPlaceDetails(feature, location);
      detailsCache.set(details.placeId, details);
      return {
        id: details.id,
        placeId: details.placeId,
        label: details.name,
        address: details.address,
        coordinate: details.coordinate,
        category: category ?? details.category,
        distanceKm: details.distanceKm
      };
    }
  );

  setSearchCache(cacheKey, results.map(locationResultToSuggestion));
  return results;
}

export async function reverseGeocode(coordinate: Coordinate): Promise<LocationResult> {
  const apiKey = ensureApiKey();
  const cacheKey = coordinateCacheKey(coordinate);
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios
    .get(`${ORS_BASE_URL}/geocode/reverse`, {
      params: {
        api_key: apiKey,
        "point.lat": coordinate.latitude,
        "point.lon": coordinate.longitude,
        size: 1
      },
      timeout: 12000
    })
    .catch((error: unknown) => {
      throw friendlySearchError(error);
    });

  const feature = (data.features as ORSFeature[])?.[0];
  const label =
    feature?.properties?.label ?? `${coordinate.latitude.toFixed(6)},${coordinate.longitude.toFixed(6)}`;
  const result: LocationResult = {
    id: feature?.properties?.id ?? cacheKey,
    placeId: feature?.properties?.id,
    label: feature?.properties?.name ?? label,
    address: label,
    coordinate,
    category: categoryFromFeature(feature)
  };

  reverseGeocodeCache.set(cacheKey, result);
  return result;
}

export async function planRoutes(input: PlanInput): Promise<RoutePlan> {
  const apiKey = getApiKey();
  if (!apiKey) {
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && !error.response) {
      throw new Error("No internet connection to routing service.", { cause: error });
    }
    throw new Error(error instanceof Error ? error.message : "Routes unavailable. Please try again.", {
      cause: error
    });
  }
}

async function geocode(location: string): Promise<Coordinate> {
  const parsed = parseCoordinateInput(location);
  if (parsed) return parsed;

  const normalizedLocation = normalizeQuery(location);
  const suggestions = await searchPlaces(normalizedLocation, defaultCurrentLocation);
  const bestSuggestion = suggestions[0];
  if (!bestSuggestion) {
    throw new Error("Location not found. Try a more specific place.");
  }
  const details = await getPlaceDetails(bestSuggestion.placeId);
  return details.coordinate;
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
  const data = await requestDirections(source, destination, true).catch(async (error: unknown) => {
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
    eta: number;
    fuelUsage: number;
    coordinates: Coordinate[];
    safetyScore?: number;
    trafficScore?: number;
    fuelScore?: number;
    score?: number;
  };

  const candidates: Candidate[] = features.map((feature: ORSDirectionsFeature) => {
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

  const etaSorted = [...candidates].sort((a, b) => a.eta - b.eta);
  const n = candidates.length;

  for (const candidate of candidates) {
    const etaRankFast = etaSorted.indexOf(candidate);
    const slowRank = n - 1 - etaRankFast;
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

  const safestCandidate = candidates.reduce(
    (best, c) => (c.safetyScore! > best.safetyScore! ? c : best),
    candidates[0]
  );
  const fastestCandidate = candidates.reduce(
    (best, c) => (c.eta < best.eta ? c : best),
    candidates[0]
  );
  const ecoCandidate = candidates.reduce(
    (best, c) => (c.fuelUsage < best.fuelUsage ? c : best),
    candidates[0]
  );

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
    preference === "safest"
      ? ["safest", "fastest", "eco"]
      : preference === "fastest"
      ? ["fastest", "safest", "eco"]
      : ["eco", "safest", "fastest"];

  return order.map((cat) => toRouteOption(cat));
}

async function requestDirections(
  source: Coordinate,
  destination: Coordinate,
  alternatives: boolean
): Promise<ORSDirectionsResponse> {
  const apiKey = ensureApiKey();
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

  const { data } = await axios.post<ORSDirectionsResponse>(
    `${ORS_BASE_URL}/v2/directions/driving-car/geojson`,
    body,
    {
      headers: { Authorization: apiKey },
      timeout: 22000
    }
  );

  return data;
}

function featureToPlaceDetails(feature: ORSFeature, origin?: Coordinate | null): PlaceDetails {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates)) {
    throw new Error("This place does not include map coordinates.");
  }

  const coordinate = { latitude: coordinates[1], longitude: coordinates[0] };
  const properties = feature.properties ?? {};
  const name = properties.name ?? properties.label ?? "Selected location";
  const address =
    properties.label ??
    [properties.locality, properties.region, properties.country].filter(Boolean).join(", ");

  return {
    id: properties.id ?? `${coordinate.latitude},${coordinate.longitude}`,
    placeId: properties.id ?? `${coordinate.latitude},${coordinate.longitude}`,
    name,
    address,
    coordinate,
    category: categoryFromFeature(feature),
    distanceKm: distanceKm(origin, coordinate)
  };
}

function rankFeatures(features: ORSFeature[], query: string, origin?: Coordinate | null): ORSFeature[] {
  return [...features].sort((a, b) => scoreFeature(b, query, origin) - scoreFeature(a, query, origin));
}

function scoreFeature(feature: ORSFeature, query: string, origin?: Coordinate | null): number {
  const properties = feature.properties ?? {};
  const label = `${properties.name ?? ""} ${properties.label ?? ""}`.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  let score = Number(properties.confidence ?? 0) * 100;

  if ((properties.name ?? "").toLowerCase() === normalizedQuery) score += 120;
  if (label.startsWith(normalizedQuery)) score += 80;
  if (label.includes(normalizedQuery)) score += 45;
  if (/(airport|railway|station|hospital|college|university|metro|bus stand|landmark)/i.test(label))
    score += 24;
  if (properties.layer && ["locality", "region", "county", "macrocounty"].includes(properties.layer))
    score += 18;

  const coordinates = feature.geometry?.coordinates;
  if (origin && Array.isArray(coordinates)) {
    const distance = distanceKm(origin, { latitude: coordinates[1], longitude: coordinates[0] });
    if (typeof distance === "number") score += Math.max(0, 70 - distance);
  }

  return score;
}

function categoryFromFeature(feature?: ORSFeature): string | undefined {
  const properties = feature?.properties;
  return properties?.category ?? properties?.layer;
}

function setSearchCache(key: string, value: PlaceSuggestion[]) {
  if (searchCache.size >= maxSearchCacheEntries) {
    const oldestKey = searchCache.keys().next().value;
    if (oldestKey) searchCache.delete(oldestKey);
  }
  searchCache.set(key, value);
}

function suggestionToLocationResult(suggestion: PlaceSuggestion): LocationResult {
  const details = detailsCache.get(suggestion.placeId);
  return {
    id: suggestion.id,
    placeId: suggestion.placeId,
    label: suggestion.primaryText,
    address: suggestion.secondaryText,
    coordinate: details?.coordinate ?? { latitude: 0, longitude: 0 },
    category: suggestion.category,
    distanceKm: suggestion.distanceKm
  };
}

function locationResultToSuggestion(result: LocationResult): PlaceSuggestion {
  return {
    id: result.id,
    placeId: result.placeId ?? result.id,
    primaryText: result.label,
    secondaryText: result.address,
    description: result.address,
    category: result.category,
    distanceKm: result.distanceKm
  };
}

function friendlySearchError(error: unknown): Error {
  if (axios.isCancel(error)) {
    return new Error("Search was cancelled.");
  }
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return new Error("Location search timed out.");
    }
    if (!error.response) {
      return new Error("No network connection.");
    }
    if (error.response.status === 401 || error.response.status === 403) {
      return new Error("OpenRouteService API key rejected.");
    }
  }
  return new Error("Location search failed.");
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

function coordinateCacheKey(coordinate?: Coordinate | null): string {
  if (!coordinate) return "none";
  return `${coordinate.latitude.toFixed(4)},${coordinate.longitude.toFixed(4)}`;
}

function distanceKm(origin: Coordinate | null | undefined, destination: Coordinate): number | undefined {
  if (!origin) return undefined;
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(destination.latitude - origin.latitude);
  const dLon = degreesToRadians(destination.longitude - origin.longitude);
  const lat1 = degreesToRadians(origin.latitude);
  const lat2 = degreesToRadians(destination.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseCoordinateInput(value: string): Coordinate | null {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function buildMockPlan(input: PlanInput): RoutePlan {
  const mockCoords: Coordinate[] = [
    { latitude: 13.0827, longitude: 80.2707 },
    { latitude: 13.04, longitude: 80.22 },
    { latitude: 12.98, longitude: 80.25 }
  ];
  const routes: RouteOption[] = [
    {
      id: "safest",
      name: "Safest Route",
      badge: "RECOMMENDED",
      safetyScore: 94,
      distance: 24.5,
      eta: 35,
      fuelUsage: 1.63,
      fuelCost: 163,
      trafficStatus: "Moderate",
      weatherImpact: "Low",
      score: 91,
      coordinates: mockCoords
    },
    {
      id: "fastest",
      name: "Fastest Route",
      badge: "FASTEST",
      safetyScore: 82,
      distance: 21.0,
      eta: 28,
      fuelUsage: 1.4,
      fuelCost: 140,
      trafficStatus: "Clear",
      weatherImpact: "Low",
      score: 85,
      coordinates: mockCoords
    },
    {
      id: "eco",
      name: "Eco Route",
      badge: "ECO",
      safetyScore: 88,
      distance: 22.2,
      eta: 31,
      fuelUsage: 1.25,
      fuelCost: 125,
      trafficStatus: "Clear",
      weatherImpact: "Low",
      score: 88,
      coordinates: mockCoords
    }
  ];

  return {
    ...input,
    sourceCoordinate: mockCoords[0],
    destinationCoordinate: mockCoords[mockCoords.length - 1],
    routes
  };
}
