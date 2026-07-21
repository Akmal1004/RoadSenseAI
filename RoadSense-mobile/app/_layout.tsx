import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppStateProvider } from "../src/context/AppStateContext";
import { paperTheme } from "../src/constants/theme";
import { ThemeProvider } from "../src/theme/ThemeProvider";
import { useTheme } from "../src/theme/hooks/useTheme";
import GlobalErrorBoundary from "../src/components/GlobalErrorBoundary";

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn("[RoadSense Startup] Splash preventAutoHideAsync failed", error);
});

export default function RootLayout() {
  useEffect(() => {
    console.info("[RoadSense Startup] Root layout mounted");
    SplashScreen.hideAsync().catch((error) => {
      console.warn("[RoadSense Startup] Splash hideAsync failed", error);
    });
  }, []);

  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedAppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}

function ThemedAppShell() {
  const { isDark } = useTheme();

  return (
    <PaperProvider theme={paperTheme}>
      <AppStateProvider>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AppStateProvider>
    </PaperProvider>
  );
}
