import { ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlassCard from "../../src/components/GlassCard";
import StatCard from "../../src/components/StatCard";
import { colors } from "../../src/constants/colors";
import { routeColor } from "../../src/constants/routeDisplay";
import { spacing } from "../../src/constants/theme";
import { useAppState } from "../../src/context/AppStateContext";
import { useStats } from "../../src/hooks/useStats";
import { useWeather } from "../../src/hooks/useWeather";
import { useTheme } from "../../src/theme/hooks/useTheme";

export default function DashboardScreen() {
  const { theme } = useTheme();
  const stats = useStats();
  const { routePlan } = useAppState();
  const weather = useWeather(routePlan?.sourceCoordinate);
  const bestRoute = routePlan?.routes[0];
  const fallbackSafetyAnalytics = [
    { id: "safest", label: "Safest", score: 0, color: colors.routeByType.safest },
    { id: "fastest", label: "Fastest", score: 0, color: colors.routeByType.fastest },
    { id: "eco", label: "Eco", score: 0, color: colors.routeByType.eco }
  ];
  const safetyAnalytics = fallbackSafetyAnalytics.map((fallback, index) => {
    const route = routePlan?.routes[index];
    return route
      ? {
          id: route.id,
          label: route.name.replace(" Route", ""),
          score: route.safetyScore,
          color: routeColor(route.id, index)
        }
      : fallback;
  });

  return (
    <ScrollView style={[styles.root, { backgroundColor: theme.background }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: theme.text }]}>Dashboard</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Trip intelligence center</Text>

      <View style={styles.grid}>
        <StatCard label="Distance Driven" value={stats.distanceDriven} icon="speedometer" />
        <StatCard label="Trips Completed" value={stats.completedTrips} icon="check-decagram" />
      </View>
      <View style={styles.grid}>
        <StatCard label="Fuel Saved" value={stats.fuelSaved} icon="leaf" />
        <StatCard label="Safety Score" value={stats.safetyScore} icon="shield-star" />
      </View>

      <Section title="Driving Insights" />
      <GlassCard>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Active destination: {routePlan?.destination ?? "No route planned yet"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Best route: {bestRoute?.name ?? "Plan a route to calculate"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Current ETA: {bestRoute ? `${bestRoute.eta} minutes` : "Unavailable"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Estimated fuel: {bestRoute ? `${bestRoute.fuelUsage.toFixed(2)} L` : "Unavailable"}</Text>
      </GlassCard>

      <Section title="Live Hazards Feed" />
      <GlassCard>
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="shield-check-outline" size={24} color={theme.success} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No current hazards reported</Text>
          <Text style={[styles.rowText, { color: theme.textSecondary }]}>Traffic incident feeds are not connected in this MVP.</Text>
        </View>
      </GlassCard>

      <Section title="Weather Intelligence" />
      <GlassCard>
        <Text style={[styles.big, { color: theme.text }]}>{weather ? `${weather.temperature}°C` : "29°C"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Conditions: {weather?.conditions ?? "Partly cloudy"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Visibility: {weather?.visibility ?? "Good"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Rain Chance: {weather?.rainProbability ?? 22}%</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Road Condition: {weather?.roadCondition ?? "Normal road grip"}</Text>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Weather Impact Score: {weather?.impactScore ?? 24}/100</Text>
      </GlassCard>

      <Section title="Safety Analytics" />
      <GlassCard>
        <Text style={[styles.rowText, { color: theme.textSecondary }]}>Routes compared: {routePlan?.routes.length ?? 0}</Text>
        <View style={styles.circleRow}>
          {safetyAnalytics.map((item) => (
            <View key={item.id} style={styles.circleWrap}>
              <View style={[styles.safetyCircle, { borderColor: item.color }]}>
                <Text style={[styles.circleScore, { color: theme.text }]}>{item.score || "--"}</Text>
                <Text style={[styles.circleUnit, { color: theme.textSecondary }]}>/100</Text>
              </View>
              <Text style={[styles.circleLabel, { color: theme.textSecondary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </ScrollView>
  );
}

function Section({ title }: { title: string }) {
  const { theme } = useTheme();
  return <Text style={[styles.section, { color: theme.text }]}>{title}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.screen, paddingBottom: 128, paddingTop: 34 },
  title: { fontSize: 34, fontWeight: "900" },
  subtitle: { marginBottom: 22, marginTop: 6 },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  section: { fontSize: 20, fontWeight: "900", marginBottom: 12, marginTop: 24 },
  rowText: { fontSize: 14, lineHeight: 24 },
  emptyState: { alignItems: "center", gap: 8, paddingVertical: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "900" },
  big: { fontSize: 36, fontWeight: "900", marginBottom: 8 },
  circleRow: { flexDirection: "row", gap: 12, justifyContent: "space-between", marginTop: 18 },
  circleWrap: { alignItems: "center", flex: 1, gap: 8 },
  safetyCircle: { alignItems: "center", borderRadius: 999, borderWidth: 5, height: 92, justifyContent: "center", width: 92 },
  circleScore: { fontSize: 26, fontWeight: "900" },
  circleUnit: { fontSize: 11, fontWeight: "800", marginTop: -2 },
  circleLabel: { fontSize: 12, fontWeight: "800", textAlign: "center" }
});
