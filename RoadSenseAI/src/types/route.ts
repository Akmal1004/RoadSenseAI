export type TravelPreference = "safest" | "fastest" | "eco";

export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type RouteOption = {
  id: string;
  name: string;
  badge: string;
  safetyScore: number;
  distance: number;
  eta: number;
  fuelUsage: number;
  fuelCost: number;
  trafficStatus: string;
  weatherImpact: string;
  score: number;
  coordinates: Coordinate[];
};

export type RoutePlan = {
  source: string;
  destination: string;
  preference: TravelPreference;
  sourceCoordinate: Coordinate;
  destinationCoordinate: Coordinate;
  routes: RouteOption[];
};

export type Hazard = {
  id: string;
  type: "Accident" | "Heavy Rain" | "Lane Closure" | "Slow Traffic";
  title: string;
  location: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
};

export type TripStats = {
  trips: number;
  avgSafety: number;
  savedTime: string;
  fuelSaved: string;
  distanceDriven: string;
  completedTrips: number;
  safetyScore: number;
};
