import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useTheme } from "../theme/hooks/useTheme";

export default function FloatingAIButton({ onPress }: { onPress?: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(1.04, { duration: 900 }), withTiming(1, { duration: 900 })), -1);
  }, [scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Pressable onPress={onPress}>
        <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.button}>
          <MaterialCommunityIcons name="robot-happy-outline" size={19} color="#FFFFFF" />
          <Text style={styles.text}>Ask Your AI Co-Pilot</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    bottom: 100,
    position: "absolute",
    right: 18,
    zIndex: 10
  },
  button: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  }
});
