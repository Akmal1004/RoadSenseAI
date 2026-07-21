import axios from "axios";
import { Coordinate } from "../types/route";
import { LocationResult, PlaceDetails, PlaceSuggestion } from "../types/search";

const ORS_BASE_URL = "https://api.openrouteservice.org";
const apiKey = import.meta.env.VITE_ORS_API_KEY?.trim();
const maxSearchCacheEntries = 20;
const searchCache = new Map<string, PlaceSuggestion[]>();
const detailsCache = new Map<string, PlaceDetails>();
const reverseGeocodeCache = new Map<string, LocationResult>();

type SearchOptions = {
  locationBias?: Coordinate | null;
  signal?: AbortSignal;
};

type NearbyOptions = {
  location: Coordinate;
  query: string;
  category?: string;
  signal?: AbortSignal;
};

export async function searchPlaces(query: string, options: SearchOptions = {}): Promise<PlaceSuggestion[]> {
  ensureApiKey();
  const normalizedQuery = normalizeQuery(query);
  if (normalizedQuery.length < 2) return [];

  const cacheKey = `search:${normalizedQuery.toLowerCase()}:${coordinateCacheKey(options.locationBias)}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${ORS_BASE_URL}/geocode/autocomplete`, {
    params: buildSearchParams(normalizedQuery, options.locationBias, 8),
    signal: options.signal,
    timeout: 12000
  }).catch((error: any) => {
    throw friendlySearchError(error);
  });

  const suggestions = rankFeatures(data.features ?? [], normalizedQuery, options.locationBias).map((feature): PlaceSuggestion => {
    const details = featureToPlaceDetails(feature, options.locationBias);
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
  });

  setSearchCache(cacheKey, suggestions);
  return suggestions;
}

export async function getPlaceDetails(placeId: string, _signal?: AbortSignal): Promise<PlaceDetails> {
  const cached = detailsCache.get(placeId);
  if (cached) return cached;
  throw new Error("Place details expired. Search for the location again.");
}

export async function searchNearbyPlaces(options: NearbyOptions): Promise<LocationResult[]> {
  ensureApiKey();
  const normalizedQuery = normalizeQuery(options.query);
  const cacheKey = `nearby:${normalizedQuery.toLowerCase()}:${coordinateCacheKey(options.location)}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached.map(suggestionToLocationResult);

  const { data } = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
    params: buildSearchParams(normalizedQuery, options.location, 10),
    signal: options.signal,
    timeout: 12000
  }).catch((error: any) => {
    throw friendlySearchError(error);
  });

  const results = rankFeatures(data.features ?? [], normalizedQuery, options.location).map((feature): LocationResult => {
    const details = featureToPlaceDetails(feature, options.location);
    detailsCache.set(details.placeId, details);
    return {
      id: details.id,
      placeId: details.placeId,
      label: details.name,
      address: details.address,
      coordinate: details.coordinate,
      category: options.category ?? details.category,
      distanceKm: details.distanceKm
    };
  });

  setSearchCache(cacheKey, results.map(locationResultToSuggestion));
  return results;
}

export async function reverseGeocode(coordinate: Coordinate, signal?: AbortSignal): Promise<LocationResult> {
  ensureApiKey();
  const cacheKey = coordinateCacheKey(coordinate);
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${ORS_BASE_URL}/geocode/reverse`, {
    params: {
      api_key: apiKey,
      "point.lat": coordinate.latitude,
      "point.lon": coordinate.longitude,
      size: 1
    },
    signal,
    timeout: 12000
  }).catch((error: any) => {
    throw friendlySearchError(error);
  });

  const feature = data.features?.[0];
  const label = feature?.properties?.label ?? `${coordinate.latitude.toFixed(6)},${coordinate.longitude.toFixed(6)}`;
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

function buildSearchParams(query: string, locationBias: Coordinate | null | undefined, size: number) {
  const params: Record<string, string | number> = {
    api_key: apiKey as string,
    text: query,
    size,
    "boundary.country": "IN"
  };

  if (locationBias) {
    params["focus.point.lat"] = locationBias.latitude;
    params["focus.point.lon"] = locationBias.longitude;
  }

  return params;
}

function featureToPlaceDetails(feature: any, origin?: Coordinate | null): PlaceDetails {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates)) {
    throw new Error("This place does not include map coordinates. Try another result.");
  }

  const coordinate = { latitude: coordinates[1], longitude: coordinates[0] };
  const properties = feature.properties ?? {};
  const name = properties.name ?? properties.label ?? "Selected location";
  const address = properties.label ?? [properties.locality, properties.region, properties.country].filter(Boolean).join(", ");

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

function rankFeatures(features: any[], query: string, origin?: Coordinate | null): any[] {
  return [...features].sort((a, b) => scoreFeature(b, query, origin) - scoreFeature(a, query, origin));
}

function scoreFeature(feature: any, query: string, origin?: Coordinate | null): number {
  const properties = feature.properties ?? {};
  const label = `${properties.name ?? ""} ${properties.label ?? ""}`.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  let score = Number(properties.confidence ?? 0) * 100;

  if ((properties.name ?? "").toLowerCase() === normalizedQuery) score += 120;
  if (label.startsWith(normalizedQuery)) score += 80;
  if (label.includes(normalizedQuery)) score += 45;
  if (/(airport|railway|station|hospital|college|university|metro|bus stand|landmark)/i.test(label)) score += 24;
  if (["locality", "region", "county", "macrocounty"].includes(properties.layer)) score += 18;

  const coordinates = feature.geometry?.coordinates;
  if (origin && Array.isArray(coordinates)) {
    const distance = distanceKm(origin, { latitude: coordinates[1], longitude: coordinates[0] });
    if (typeof distance === "number") score += Math.max(0, 70 - distance);
  }

  return score;
}

function categoryFromFeature(feature: any): string | undefined {
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

function ensureApiKey() {
  if (!apiKey) {
    throw new Error("OpenRouteService API key is missing. Add VITE_ORS_API_KEY to your environment.");
  }
}

function friendlySearchError(error: any): Error {
  if (axios.isCancel(error)) {
    return new Error("Search was cancelled.");
  }
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return new Error("Location search timed out. Please try again.");
    }
    if (!error.response) {
      return new Error("No internet connection. Please check your network.");
    }
    if (error.response.status === 401 || error.response.status === 403) {
      return new Error("OpenRouteService rejected the search request. Check your API key.");
    }
    if (error.response.status >= 500) {
      return new Error("OpenRouteService search is temporarily unavailable. Please try again soon.");
    }
  }
  return new Error("Location search failed. Please try again.");
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
