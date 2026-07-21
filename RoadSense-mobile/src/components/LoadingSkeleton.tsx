import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/hooks/useTheme";

type Props = {
  label?: string;
  rows?: number;
};

export default function LoadingSkeleton({ label = "Searching locations...", rows = 3 }: Props) {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 650, useNativeDriver: true })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      {Array.from({ length: rows }).map((_, index) => (
        <Animated.View key={index} style={[styles.row, { backgroundColor: theme.input, opacity }]}>
          <View style={[styles.dot, { backgroundColor: theme.chipBackground }]} />
          <View style={styles.lines}>
            <View style={[styles.line, { backgroundColor: theme.border, width: "75%" }]} />
            <View style={[styles.line, { backgroundColor: theme.border, width: "48%" }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 10, marginTop: 14 },
  label: { fontSize: 13, fontWeight: "700" },
  row: { alignItems: "center", borderRadius: 16, flexDirection: "row", gap: 12, minHeight: 62, padding: 12 },
  dot: { borderRadius: 15, height: 30, width: 30 },
  lines: { flex: 1, gap: 8 },
  line: { borderRadius: 999, height: 9 }
});
