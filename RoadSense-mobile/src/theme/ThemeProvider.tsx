import AsyncStorage from "@react-native-async-storage/async-storage";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { darkTheme } from "./darkTheme";
import { lightTheme } from "./lightTheme";
import { ThemeContext, ThemeName } from "./ThemeContext";

const storageKey = "roadsense_theme";

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeName, updateThemeName] = useState<ThemeName>("dark");

  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem(storageKey);
        if (mounted && (savedTheme === "dark" || savedTheme === "light")) {
          updateThemeName(savedTheme);
        }
        console.info("[RoadSense Startup] Theme loaded");
      } catch (error) {
        console.warn("[RoadSense Startup] Theme load failed; using dark theme", error);
      }
    }

    loadTheme();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      theme: themeName === "dark" ? darkTheme : lightTheme,
      themeName,
      isDark: themeName === "dark",
      toggleTheme() {
        const nextTheme = themeName === "dark" ? "light" : "dark";
        updateThemeName(nextTheme);
        AsyncStorage.setItem(storageKey, nextTheme).catch((error) => {
          console.warn("[RoadSense Storage] Theme save failed", error);
        });
      },
      setTheme(nextTheme: ThemeName) {
        updateThemeName(nextTheme);
        AsyncStorage.setItem(storageKey, nextTheme).catch((error) => {
          console.warn("[RoadSense Storage] Theme save failed", error);
        });
      }
    }),
    [themeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
