import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { Hazard } from "../types/route";
import GlassCard from "./GlassCard";
import { useTheme } from "../theme/hooks/useTheme";

const hazardIcon = {
  Accident: "car-brake-alert",
  "Heavy Rain": "weather-pouring",
  "Lane Closure": "road-variant",
  "Slow Traffic": "traffic-light"
};

const severityColor = {
  high: colors.danger,
  medium: colors.warning,
  low: colors.primary
};

export default function HazardCard({ hazard }: { hazard: Hazard }) {
  const { theme } = useTheme();
  const tone = severityColor[hazard.severity];
  return (
    <GlassCard style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${tone}22` }]}>
        <MaterialCommunityIcons name={hazardIcon[hazard.type] as any} size={22} color={tone} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{hazard.title}</Text>
        <Text style={[styles.location, { color: theme.textSecondary }]}>{hazard.location}</Text>
      </View>
      <View style={[styles.pill, { borderColor: tone }]}>
        <Text style={[styles.pillText, { color: tone }]}>{hazard.severity.toUpperCase()}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    padding: 14
  },
  icon: {
    alignItems: "center",
    borderRadius: 18,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 15,
    fontWeight: "800"
  },
  location: {
    fontSize: 12,
    marginTop: 3
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  pillText: {
    fontSize: 10,
    fontWeight: "900"
  }
});
