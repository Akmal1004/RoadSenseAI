import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";

type Props = {
  hasPlan: boolean;
  compact?: boolean;
};

export default function RouteMapFallback({ hasPlan, compact = false }: Props) {
  return (
    <GlassCard style={[styles.card, compact && styles.compact]}>
      <View style={styles.placeholder}>
        <MaterialCommunityIcons name="map-search-outline" size={38} color="#00D4FF" />
        <Text style={styles.placeholderText}>
          {hasPlan ? "Route preview unavailable." : "Enter a destination to see AI-optimized route options."}
        </Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    height: 230,
    overflow: "hidden",
    padding: 0
  },
  compact: {
    height: 320
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#030B18",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 22
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  }
});
