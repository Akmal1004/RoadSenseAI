import { Hazard, RouteOption, TripStats } from "../types/route";

export const recentDestinations = ["Home", "Work", "Airport", "College", "Hospital"];

export const aiInsights = [
  "Heavy traffic detected on OMR.",
  "Alternative route saves 12 minutes.",
  "Weather may increase ETA by 8 minutes.",
  "Fuel-efficient route available."
];

export const hazards: Hazard[] = [
  { id: "h1", type: "Accident", title: "Accident", location: "Guindy Flyover", severity: "high", timestamp: "8 min ago" },
  { id: "h2", type: "Heavy Rain", title: "Heavy Rain", location: "Velachery Main Road", severity: "medium", timestamp: "14 min ago" },
  { id: "h3", type: "Lane Closure", title: "Lane Closure", location: "OMR Toll Plaza", severity: "medium", timestamp: "21 min ago" },
  { id: "h4", type: "Slow Traffic", title: "Slow Traffic", location: "Kathipara Junction", severity: "low", timestamp: "28 min ago" }
];

export const weeklyStats: TripStats = {
  trips: 14,
  avgSafety: 92,
  savedTime: "48m",
  fuelSaved: "Rs 1020",
  distanceDriven: "286 km",
  completedTrips: 42,
  safetyScore: 92
};

export const mockRoutes: RouteOption[] = [
  {
    id: "safest",
    name: "Safest Route",
    badge: "RECOMMENDED",
    safetyScore: 96,
    distance: 18.4,
    eta: 34,
    fuelUsage: 1.23,
    fuelCost: 123,
    trafficStatus: "Moderate",
    weatherImpact: "Low",
    score: 91,
    coordinates: [
      { latitude: 13.0827, longitude: 80.2707 },
      { latitude: 13.0358, longitude: 80.2445 },
      { latitude: 12.9941, longitude: 80.1709 }
    ]
  },
  {
    id: "fastest",
    name: "Fastest Route",
    badge: "FASTEST",
    safetyScore: 86,
    distance: 17.2,
    eta: 29,
    fuelUsage: 1.15,
    fuelCost: 115,
    trafficStatus: "Clear",
    weatherImpact: "Medium",
    score: 87,
    coordinates: [
      { latitude: 13.0827, longitude: 80.2707 },
      { latitude: 13.0501, longitude: 80.2189 },
      { latitude: 12.9941, longitude: 80.1709 }
    ]
  },
  {
    id: "eco",
    name: "Eco Route",
    badge: "ECO",
    safetyScore: 90,
    distance: 16.8,
    eta: 37,
    fuelUsage: 1.12,
    fuelCost: 112,
    trafficStatus: "Light",
    weatherImpact: "Low",
    score: 89,
    coordinates: [
      { latitude: 13.0827, longitude: 80.2707 },
      { latitude: 13.0209, longitude: 80.2381 },
      { latitude: 12.9941, longitude: 80.1709 }
    ]
  }
];
