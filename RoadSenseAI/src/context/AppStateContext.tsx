import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { storageService, UserPreferences, defaultPreferences } from "../services/storageService";
import { RoutePlan } from "../types/route";

type AppState = {
  routePlan: RoutePlan | null;
  preferences: UserPreferences;
  setRoutePlan: (plan: RoutePlan | null) => Promise<void>;
  setPreferences: (preferences: UserPreferences) => Promise<void>;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [routePlan, updateRoutePlan] = useState<RoutePlan | null>(null);
  const [preferences, updatePreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    let mounted = true;

    async function restoreState() {
      try {
        const [savedRoutePlan, savedPreferences] = await Promise.all([
          storageService.getRoutePlan(),
          storageService.getPreferences()
        ]);
        if (!mounted) return;
        updateRoutePlan(savedRoutePlan);
        updatePreferences(savedPreferences);
        console.info("[RoadSense Startup] App state restored");
      } catch (error) {
        console.warn("[RoadSense Startup] App state restore failed; using defaults", error);
      }
    }

    restoreState();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AppState>(
    () => ({
      routePlan,
      preferences,
      async setRoutePlan(plan) {
        updateRoutePlan(plan);
        await storageService.saveRoutePlan(plan).catch((error) => {
          console.warn("[RoadSense Storage] Route plan save failed", error);
        });
        if (!plan) return;
        await storageService.addRecentDestination(plan.destination).catch((error) => {
          console.warn("[RoadSense Storage] Recent destination save failed", error);
        });
        await storageService.recordPlannedTrip(plan).catch((error) => {
          console.warn("[RoadSense Storage] Trip stats save failed", error);
        });
      },
      async setPreferences(next) {
        updatePreferences(next);
        await storageService.savePreferences(next).catch((error) => {
          console.warn("[RoadSense Storage] Preferences save failed", error);
        });
      }
    }),
    [routePlan, preferences]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}
