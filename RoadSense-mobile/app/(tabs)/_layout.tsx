import { Tabs } from "expo-router";
import FloatingTabBar from "../../src/components/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="routes" options={{ title: "Routes" }} />
      <Tabs.Screen name="assistant" options={{ title: "Assistant" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
