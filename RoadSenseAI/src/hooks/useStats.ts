import { useEffect, useState } from "react";
import { defaultTripStats, LocalTripStats, storageService } from "../services/storageService";

export function useStats() {
  const [stats, setStats] = useState<LocalTripStats>(defaultTripStats);

  function reloadStats() {
    storageService.getTripStats().then(setStats);
  }

  useEffect(() => {
    reloadStats();

    // Reload stats when page is visible again (similar to focus effect)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reloadStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", reloadStats);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", reloadStats);
    };
  }, []);

  return {
    raw: stats,
    trips: stats.plannedTrips,
    avgSafety: stats.plannedTrips ? stats.bestSafetyScore : 0,
    savedTime: stats.plannedTrips ? `${Math.max(0, Math.round(stats.totalEta * 0.08))}m` : "0m",
    fuelSaved: `Rs ${Math.round(stats.fuelCost * 0.08)}`,
    distanceDriven: `${stats.totalDistance.toFixed(1)} km`,
    completedTrips: stats.plannedTrips,
    safetyScore: stats.plannedTrips ? stats.bestSafetyScore : 0,
    fuelUsed: `${stats.fuelUsed.toFixed(2)} L`,
    totalFuelCost: `Rs ${Math.round(stats.fuelCost)}`,
    reloadStats
  };
}
