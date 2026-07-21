import { useEffect, useMemo, useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GlassCard from "../../src/components/GlassCard";
import GradientButton from "../../src/components/GradientButton";
import MapLibreRoutePreview from "../../src/components/MapLibreRoutePreview";
import RouteCard from "../../src/components/RouteCard";
import { colors } from "../../src/constants/colors";
import { spacing } from "../../src/constants/theme";
import { useAppState } from "../../src/context/AppStateContext";
import { useTheme } from "../../src/theme/hooks/useTheme";

export default function RoutesScreen() {
  const { theme } = useTheme();
  const { routePlan } = useAppState();
  const [compareOpen, setCompareOpen] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const selectedRoute = useMemo(
    () => routePlan?.routes.find((route) => route.id === selectedRouteId) ?? routePlan?.routes[0],
    [routePlan, selectedRouteId]
  );

  useEffect(() => {
    if (routePlan?.routes[0]) {
      setSelectedRouteId(routePlan.routes[0].id);
    } else {
      setSelectedRouteId(null);
    }
  }, [routePlan]);

  async function openGoogleMaps() {
    if (!routePlan || !selectedRoute) return;
    const origin = `${routePlan.sourceCoordinate.latitude},${routePlan.sourceCoordinate.longitude}`;
    const destination = `${routePlan.destinationCoordinate.latitude},${routePlan.destinationCoordinate.longitude}`;
    const waypoints = selectedRoute.coordinates
      .slice(1, -1)
      .filter((_, index, points) => index === 0 || index === points.length - 1)
      .map((point) => `${point.latitude},${point.longitude}`)
      .join("|");
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ""}`;
    await Linking.openURL(url);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Routes</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Visualize and compare AI-ranked routes.</Text>
        <MapLibreRoutePreview
          plan={routePlan}
          compact
          selectedRouteId={selectedRoute?.id}
          onSelectRoute={setSelectedRouteId}
        />

        <View style={styles.headerRow}>
          <Text style={[styles.section, { color: theme.text }]}>Route Options</Text>
          <Pressable style={[styles.compare, { backgroundColor: theme.secondary }]} onPress={() => setCompareOpen(true)}>
            <MaterialCommunityIcons name="compare-horizontal" color="#FFFFFF" size={16} />
            <Text style={styles.compareText}>Compare</Text>
          </Pressable>
        </View>

        {routePlan?.routes.map((route, index) => (
          <Pressable key={route.id} onPress={() => setSelectedRouteId(route.id)}>
            <RouteCard route={route} active={selectedRoute?.id === route.id} index={index} />
          </Pressable>
        )) ?? (
          <GlassCard>
            <Text style={[styles.empty, { color: theme.textSecondary }]}>Plan a trip from Home to unlock route visualization.</Text>
          </GlassCard>
        )}
      </ScrollView>
      <View style={styles.sticky}>
        <GradientButton label="Start Navigation" icon="navigation-variant" onPress={() => routePlan && setNavigationOpen(true)} />
      </View>
      <Modal visible={compareOpen} transparent animationType="slide" onRequestClose={() => setCompareOpen(false)}>
        <View style={[styles.modalWrap, { backgroundColor: theme.modalOverlay }]}>
          <GlassCard style={[styles.modal, { backgroundColor: theme.surface }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.section, { color: theme.text }]}>Route Comparison</Text>
              <Pressable onPress={() => setCompareOpen(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            {routePlan?.routes.map((route) => (
              <View key={route.id} style={[styles.compareRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.compareName, { color: theme.text }]}>{route.name}</Text>
                <Text style={[styles.compareMetric, { color: theme.textSecondary }]}>{route.eta}m</Text>
                <Text style={[styles.compareMetric, { color: theme.textSecondary }]}>{route.distance} km</Text>
                <Text style={[styles.compareMetric, { color: theme.textSecondary }]}>{route.score}/100</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      </Modal>
      <Modal visible={navigationOpen} animationType="slide" onRequestClose={() => setNavigationOpen(false)}>
        <View style={[styles.navRoot, { backgroundColor: theme.background }]}>
          <View style={styles.navHeader}>
            <Pressable onPress={() => setNavigationOpen(false)} style={[styles.navIcon, { backgroundColor: theme.iconButton }]}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
            <View style={styles.navTitleWrap}>
              <Text style={[styles.navTitle, { color: theme.text }]}>Navigation Preview</Text>
              <Text style={[styles.navSubtitle, { color: theme.textSecondary }]}>{selectedRoute?.name ?? "Choose a route"}</Text>
            </View>
          </View>
          <MapLibreRoutePreview
            plan={routePlan}
            compact
            selectedRouteId={selectedRoute?.id}
            onSelectRoute={setSelectedRouteId}
          />
          <GlassCard style={styles.navCard}>
            <Text style={[styles.navRoute, { color: theme.text }]}>{selectedRoute?.name}</Text>
            <Text style={[styles.rowText, { color: theme.textSecondary }]}>Destination: {routePlan?.destination}</Text>
            <Text style={[styles.rowText, { color: theme.textSecondary }]}>ETA: {selectedRoute?.eta} minutes</Text>
            <Text style={[styles.rowText, { color: theme.textSecondary }]}>Distance: {selectedRoute?.distance} km</Text>
            <Text style={[styles.rowText, { color: theme.textSecondary }]}>Fuel estimate: {selectedRoute?.fuelUsage.toFixed(2)} L</Text>
            <GradientButton label="Open in Google Maps" icon="google-maps" onPress={openGoogleMaps} style={styles.mapsButton} />
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: spacing.screen, paddingBottom: 166, paddingTop: 34 },
  title: { fontSize: 34, fontWeight: "900" },
  subtitle: { marginBottom: 20, marginTop: 6 },
  section: { fontSize: 20, fontWeight: "900" },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 12, marginTop: 22 },
  compare: { alignItems: "center", borderRadius: 999, flexDirection: "row", gap: 6, paddingHorizontal: 14, paddingVertical: 9 },
  compareText: { color: "#FFFFFF", fontWeight: "900" },
  empty: { lineHeight: 22, textAlign: "center" },
  sticky: { bottom: 104, left: 18, position: "absolute", right: 18 },
  modalWrap: { flex: 1, justifyContent: "flex-end", padding: 18 },
  modal: { marginBottom: 90 },
  compareRow: { alignItems: "center", borderBottomWidth: 1, flexDirection: "row", gap: 8, paddingVertical: 13 },
  compareName: { flex: 1, fontWeight: "800" },
  compareMetric: { width: 58 },
  navRoot: { flex: 1, padding: spacing.screen, paddingTop: 44 },
  navHeader: { alignItems: "center", flexDirection: "row", gap: 12, marginBottom: 16 },
  navIcon: { alignItems: "center", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  navTitleWrap: { flex: 1 },
  navTitle: { fontSize: 24, fontWeight: "900" },
  navSubtitle: { marginTop: 2 },
  navCard: { marginTop: 16 },
  navRoute: { fontSize: 20, fontWeight: "900", marginBottom: 8 },
  rowText: { fontSize: 14, lineHeight: 24 },
  mapsButton: { marginTop: 16 }
});
