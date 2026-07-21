import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import { useTheme } from "../theme/hooks/useTheme";

type Props = {
  label: string;
  value: string | number;
  icon: string;
};

export default function StatCard({ label, value, icon }: Props) {
  const { theme } = useTheme();

  return (
    <GlassCard style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: theme.chipBackground }]}>
        <MaterialCommunityIcons name={icon as any} size={20} color={theme.primary} />
      </View>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118
  },
  iconWrap: {
    alignItems: "center",
    borderRadius: 16,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  value: {
    fontSize: 24,
    fontWeight: "900",
    marginTop: 14
  },
  label: {
    fontSize: 12,
    marginTop: 4
  }
});
