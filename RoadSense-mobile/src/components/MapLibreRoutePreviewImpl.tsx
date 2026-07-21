import { memo, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, GeoJSONSource, Layer, Map as MapLibreMap, Marker } from "@maplibre/maplibre-react-native";
import { routeLegend } from "../constants/routeDisplay";
import { Coordinate, RoutePlan } from "../types/route";
import { coordinateToLngLat, routeBounds, routeToGeoJsonFeature, RouteLineFeature } from "../utils/routeGeoJson";
import GlassCard from "./GlassCard";
import RouteMapFallback from "./RouteMapFallback";

const mapStyleUrl = "https://demotiles.maplibre.org/style.json";
const selectedRouteColor = "#FACC15";

const routeColors: Record<string, string> = {
  safest: "#22C55E",
  fastest: "#06B6D4",
  eco: "#A855F7"
};

export type MapLibreRoutePreviewProps = {
  plan?: RoutePlan | null;
  compact?: boolean;
  selectedRouteId?: string | null;
  onSelectRoute?: (routeId: string) => void;
};

type PreparedRoute = {
  id: string;
  color: string;
  feature: RouteLineFeature;
};

function MapLibreRoutePreviewImpl({ plan, compact = false, selectedRouteId, onSelectRoute }: MapLibreRoutePreviewProps) {
  const [mapFailed, setMapFailed] = useState(false);
  const routes = useMemo<PreparedRoute[]>(() => {
    return (plan?.routes ?? []).map((route, index) => ({
      id: route.id,
      color: routeColors[route.id] ?? routeLegend[index % routeLegend.length]?.color ?? "#00D4FF",
      feature: routeToGeoJsonFeature(route)
    }));
  }, [plan?.routes]);
  const bounds = useMemo(
    () => routeBounds(plan?.routes ?? [], plan?.sourceCoordinate ?? { latitude: 13.0827, longitude: 80.2707 }),
    [plan?.routes, plan?.sourceCoordinate]
  );
  const canRenderMap = Boolean(
    plan &&
      routes.length &&
      isValidCoordinate(plan.sourceCoordinate) &&
      isValidCoordinate(plan.destinationCoordinate) &&
      !mapFailed
  );

  if (!canRenderMap) {
    return <RouteMapFallback hasPlan={Boolean(plan)} compact={compact} />;
  }

  return (
    <GlassCard style={[styles.card, compact && styles.compact]}>
      <View style={styles.mapShell}>
        <MapLibreMap
          style={styles.map}
          mapStyle={mapStyleUrl}
          logo={false}
          compass={false}
          attribution={false}
          scaleBar={false}
          onDidFailLoadingMap={() => setMapFailed(true)}
        >
          <Camera bounds={bounds} padding={{ top: 42, right: 30, bottom: 78, left: 30 }} duration={0} />
          {routes.map((route) => (
            <RouteLine
              key={route.id}
              route={route}
              hasSelection={Boolean(selectedRouteId)}
              selected={selectedRouteId === route.id}
              onSelectRoute={onSelectRoute}
            />
          ))}
          <RouteMarker coordinate={plan!.sourceCoordinate} color="#22C55E" icon="map-marker" label="Source" />
          <RouteMarker coordinate={plan!.destinationCoordinate} color="#EF4444" icon="flag-checkered" label="Destination" />
        </MapLibreMap>
        <RouteLegend />
      </View>
    </GlassCard>
  );
}

const RouteLine = memo(function RouteLine({
  route,
  hasSelection,
  selected,
  onSelectRoute
}: {
  route: PreparedRoute;
  hasSelection: boolean;
  selected: boolean;
  onSelectRoute?: (routeId: string) => void;
}) {
  const color = selected ? selectedRouteColor : route.color;
  const opacity = hasSelection && !selected ? 0.5 : 1;

  return (
    <GeoJSONSource id={`route-source-${route.id}`} data={route.feature} onPress={() => onSelectRoute?.(route.id)}>
      <Layer
        id={`route-line-${route.id}`}
        type="line"
        source={`route-source-${route.id}`}
        layout={{ "line-cap": "round", "line-join": "round" }}
        paint={{
          "line-color": color,
          "line-opacity": opacity,
          "line-width": selected ? 7 : 4
        }}
      />
    </GeoJSONSource>
  );
});

function RouteMarker({ coordinate, color, icon, label }: { coordinate: Coordinate; color: string; icon: string; label: string }) {
  return (
    <Marker id={`${label}-${coordinate.latitude}-${coordinate.longitude}`} lngLat={coordinateToLngLat(coordinate)} anchor="bottom">
      <View style={styles.markerWrap}>
        <View style={[styles.marker, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon as any} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.markerLabel}>{label}</Text>
      </View>
    </Marker>
  );
}

function RouteLegend() {
  return (
    <View style={styles.legend}>
      {routeLegend.map((item) => (
        <View key={item.id} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function isValidCoordinate(coordinate?: Coordinate | null): coordinate is Coordinate {
  return Boolean(
    coordinate &&
      Number.isFinite(coordinate.latitude) &&
      Number.isFinite(coordinate.longitude) &&
      Math.abs(coordinate.latitude) <= 90 &&
      Math.abs(coordinate.longitude) <= 180
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    height: 230,
    overflow: "hidden",
    padding: 0
  },
  compact: {
    height: 320
  },
  mapShell: {
    backgroundColor: "#030B18",
    flex: 1
  },
  map: {
    flex: 1
  },
  legend: {
    backgroundColor: "rgba(3,11,24,0.88)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    borderWidth: 1,
    bottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    right: 10
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  legendDot: {
    borderRadius: 5,
    height: 10,
    width: 10
  },
  legendText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800"
  },
  markerWrap: {
    alignItems: "center"
  },
  marker: {
    alignItems: "center",
    borderColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  markerLabel: {
    backgroundColor: "rgba(3,11,24,0.86)",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
    overflow: "hidden",
    paddingHorizontal: 6,
    paddingVertical: 3
  }
});

export default memo(MapLibreRoutePreviewImpl);
