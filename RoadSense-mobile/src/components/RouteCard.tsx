import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { routeColor } from "../constants/routeDisplay";
import { RouteOption } from "../types/route";
import GlassCard from "./GlassCard";
import { useTheme } from "../theme/hooks/useTheme";

export default function RouteCard({ route, active = false, index = 0 }: { route: RouteOption; active?: boolean; index?: number }) {
  const { theme } = useTheme();
  const color = routeColor(route.id, index);

  return (
    <GlassCard style={[styles.card, { borderColor: color }, active && styles.active]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.colorBar, { backgroundColor: color }]} />
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{route.name}</Text>
            <Text style={[styles.score, { color: theme.textSecondary }]}>Route score {route.score}/100</Text>
          </View>
        </View>
        <View style={[styles.badge, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>{route.badge}</Text>
        </View>
      </View>
      {active ? (
        <View style={styles.selectedRow}>
          <MaterialCommunityIcons name="check-circle" size={15} color={color} />
          <Text style={[styles.selectedText, { color }]}>Selected route</Text>
        </View>
      ) : null}
      <View style={styles.grid}>
        <Metric icon="shield-check" label="Safety" value={`${route.safetyScore}`} />
        <Metric icon="map-marker-distance" label="Distance" value={`${route.distance} km`} />
        <Metric icon="clock-outline" label="ETA" value={`${route.eta}m`} />
        <Metric icon="gas-station" label="Fuel" value={`${route.fuelUsage.toFixed(2)} L`} />
        <Metric icon="cash" label="Cost" value={`Rs ${route.fuelCost}`} />
        <Metric icon="weather-cloudy-alert" label="Weather" value={route.weatherImpact} />
      </View>
    </GlassCard>
  );
}

function Metric({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.metric, { backgroundColor: theme.input }]}>
      <MaterialCommunityIcons name={icon as any} size={15} color={theme.primary} />
      <View>
        <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 14
  },
  active: {
    borderWidth: 2
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: 10
  },
  colorBar: {
    borderRadius: 999,
    height: 38,
    width: 5
  },
  name: {
    fontSize: 18,
    fontWeight: "900"
  },
  score: {
    marginTop: 4
  },
  badge: {
    backgroundColor: "rgba(0,212,255,0.14)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900"
  },
  selectedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 12
  },
  selectedText: {
    fontSize: 12,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16
  },
  metric: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    minWidth: "47%",
    padding: 10
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "800"
  },
  metricLabel: {
    fontSize: 11
  }
});
