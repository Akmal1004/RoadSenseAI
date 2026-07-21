import { LinearGradient } from "expo-linear-gradient";
import { PropsWithChildren } from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/hooks/useTheme";

type Props = PropsWithChildren<{
  label: string;
  icon?: string;
  loading?: boolean;
  loadingLabel?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export default function GradientButton({ label, icon = "star-four-points", loading, loadingLabel = "Planning...", onPress, style }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={onPress} disabled={loading} style={style}>
      <LinearGradient colors={[theme.primary, theme.secondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <MaterialCommunityIcons name={(loading ? "loading" : icon) as any} size={20} color="#FFFFFF" />
        <Text style={styles.label}>{loading ? loadingLabel : label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 20
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  }
});
