export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type TravelPreference = "safest" | "fastest" | "eco";

export interface PlaceSuggestion {
  id: string;
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
  category?: string;
  distanceKm?: number;
}

export interface PlaceDetails {
  id: string;
  placeId: string;
  name: string;
  address: string;
  coordinate: Coordinate;
  category?: string;
  distanceKm?: number;
}

export interface LocationResult {
  id: string;
  placeId?: string;
  label: string;
  address: string;
  coordinate: Coordinate;
  category?: string;
  distanceKm?: number;
}

export interface RouteOption {
  id: TravelPreference;
  name: string;
  badge: "RECOMMENDED" | "FASTEST" | "ECO";
  safetyScore: number;
  distance: number;
  eta: number;
  fuelUsage: number;
  fuelCost: number;
  trafficStatus: "Clear" | "Moderate" | "Heavy";
  weatherImpact: "Low" | "Medium" | "High";
  score: number;
  coordinates: Coordinate[];
}

export interface RoutePlan {
  source: string;
  destination: string;
  preference: TravelPreference;
  sourceCoordinate: Coordinate;
  destinationCoordinate: Coordinate;
  routes: RouteOption[];
}

export interface PlanInput {
  source: string;
  destination: string;
  preference: TravelPreference;
  sourceCoordinate?: Coordinate | null;
  destinationCoordinate?: Coordinate | null;
}

export type GeminiScope = "assistant" | "home-insights" | "route-analysis";

export interface ORSFeature {
  geometry?: {
    coordinates?: number[];
  };
  properties?: {
    id?: string;
    name?: string;
    label?: string;
    locality?: string;
    region?: string;
    country?: string;
    category?: string;
    layer?: string;
    confidence?: number;
  };
}

export interface ORSDirectionsFeature {
  properties: {
    summary: {
      distance: number;
      duration: number;
    };
  };
  geometry: {
    coordinates: number[][];
  };
}

export interface ORSDirectionsResponse {
  features?: ORSDirectionsFeature[];
}
