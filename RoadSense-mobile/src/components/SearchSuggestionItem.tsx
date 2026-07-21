import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/hooks/useTheme";

type Props = {
  title: string;
  subtitle?: string;
  category?: string;
  distanceKm?: number;
  icon?: string;
  onPress: () => void;
};

export default function SearchSuggestionItem({
  title,
  subtitle,
  category,
  distanceKm,
  icon = "map-marker-outline",
  onPress
}: Props) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.root, { borderBottomColor: theme.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.chipBackground }]}>
        <MaterialCommunityIcons name={icon as any} size={19} color={theme.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={2}>{subtitle}</Text> : null}
        {typeof distanceKm === "number" ? <Text style={[styles.distance, { color: theme.textSecondary }]}>{distanceKm} km away</Text> : null}
        {category ? <Text style={[styles.category, { color: theme.primary }]} numberOfLines={1}>{category}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 12, paddingVertical: 12 },
  iconWrap: { alignItems: "center", borderRadius: 16, height: 38, justifyContent: "center", width: 38 },
  copy: { flex: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  subtitle: { fontSize: 12, lineHeight: 18, marginTop: 3 },
  distance: { fontSize: 12, fontWeight: "700", marginTop: 4 },
  category: { fontSize: 11, fontWeight: "800", marginTop: 4, textTransform: "capitalize" }
});
