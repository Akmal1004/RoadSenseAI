import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "../theme/hooks/useTheme";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export default function GlassCard({ children, style }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.primary }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22
  }
});
