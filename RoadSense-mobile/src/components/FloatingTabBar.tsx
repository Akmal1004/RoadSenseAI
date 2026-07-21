import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../theme/hooks/useTheme";

const icons: Record<string, string> = {
  home: "home-variant-outline",
  dashboard: "view-dashboard-outline",
  routes: "map-marker-path",
  assistant: "robot-happy-outline",
  profile: "account-cog-outline"
};

type FloatingTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, { options: { title?: string } }>;
  navigation: {
    navigate: (name: string) => void;
  };
};

export default function FloatingTabBar({ state, descriptors, navigation }: FloatingTabBarProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.shell}>
      <View style={[styles.bar, { backgroundColor: theme.tabBar, borderColor: theme.border, shadowColor: theme.primary }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;
          return (
            <Pressable
              key={route.key}
              style={styles.item}
              onPress={() => navigation.navigate(route.name)}
            >
              {focused ? (
                <Animated.View entering={FadeIn.duration(180)} style={[styles.activeWrap, { shadowColor: theme.primary }]}>
                  <LinearGradient colors={[theme.primary, theme.secondary]} style={styles.active}>
                    <MaterialCommunityIcons name={icons[route.name] as any} size={19} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>
              ) : (
                <MaterialCommunityIcons name={icons[route.name] as any} size={21} color={theme.textSecondary} />
              )}
              <Text style={[styles.label, { color: focused ? theme.text : theme.textSecondary }]} numberOfLines={1}>
                {String(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    bottom: 18,
    left: 16,
    position: "absolute",
    right: 16
  },
  bar: {
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    height: 74,
    paddingHorizontal: 8,
    shadowOpacity: 0.22,
    shadowRadius: 24
  },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 4
  },
  activeWrap: {
    shadowOpacity: 0.7,
    shadowRadius: 14
  },
  active: {
    alignItems: "center",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 42
  },
  label: {
    fontSize: 10,
    fontWeight: "700"
  }
});
