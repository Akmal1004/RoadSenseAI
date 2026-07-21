import { createContext } from "react";
import { darkTheme, RoadSenseTheme } from "./darkTheme";

export type ThemeName = "dark" | "light";

export type ThemeContextValue = {
  theme: RoadSenseTheme;
  themeName: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  themeName: "dark",
  isDark: true,
  toggleTheme: () => undefined,
  setTheme: () => undefined
});
