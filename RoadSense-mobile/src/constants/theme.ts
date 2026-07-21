import { MD3DarkTheme } from "react-native-paper";
import { colors } from "./colors";

export const paperTheme = {
  ...MD3DarkTheme,
  roundness: 20,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.danger,
    onSurface: colors.text
  }
};

export const spacing = {
  screen: 18,
  card: 18
};
