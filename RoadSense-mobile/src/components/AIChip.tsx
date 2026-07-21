import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../theme/hooks/useTheme";

export default function AIChip({ label, onPress }: { label: string; onPress?: () => void }) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: theme.chipBackground, borderColor: theme.chipBorder }]}>
      <Text style={[styles.text, { color: theme.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  text: {
    fontSize: 12,
    fontWeight: "700"
  }
});
