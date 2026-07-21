import { useRef, useState } from "react";
import { planRoutes } from "../services/routeService";
import { Coordinate, RoutePlan, TravelPreference } from "../types/route";
import { useAppState } from "../context/AppStateContext";

const ROUTE_PLAN_THROTTLE_MS = 5000;

export function useRoutes() {
  const { setRoutePlan } = useAppState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);
  const lastRequestAtRef = useRef(0);

  async function plan(
    source: string,
    destination: string,
    preference: TravelPreference,
    coordinates?: { source?: Coordinate | null; destination?: Coordinate | null }
  ): Promise<RoutePlan | null> {
    if (inFlightRef.current) return null;

    const now = Date.now();
    if (now - lastRequestAtRef.current < ROUTE_PLAN_THROTTLE_MS) {
      setError("Please wait a few seconds before planning another route.");
      return null;
    }

    inFlightRef.current = true;
    lastRequestAtRef.current = now;
    setLoading(true);
    setError(null);
    await setRoutePlan(null);
    try {
      const routePlan = await planRoutes({
        source,
        destination,
        preference,
        sourceCoordinate: coordinates?.source,
        destinationCoordinate: coordinates?.destination
      });
      await setRoutePlan(routePlan);
      return routePlan;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Routes unavailable.");
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }

  return { plan, loading, error };
}
