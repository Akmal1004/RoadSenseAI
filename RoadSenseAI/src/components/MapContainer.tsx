import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RoutePlan } from "../types/route";

interface MapContainerProps {
  plan: RoutePlan | null;
  selectedRouteId: string | null;
  onSelectRoute?: (routeId: string) => void;
}

const mapStyleUrl = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export default function MapContainer({ plan, selectedRouteId, onSelectRoute }: MapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use default coordinates (Chennai) if no plan is available
    const initialCenter: [number, number] = plan
      ? [plan.sourceCoordinate.longitude, plan.sourceCoordinate.latitude]
      : [80.2707, 13.0827];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyleUrl,
      center: initialCenter,
      zoom: plan ? 11 : 12,
      attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearMapElements() {
    const map = mapRef.current;
    if (!map) return;

    // Remove Markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Remove Polyline Layers and Sources
    const style = map.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith("route-layer-")) {
          map.removeLayer(layer.id);
        }
      });
    }

    if (style && style.sources) {
      Object.keys(style.sources).forEach((sourceId) => {
        if (sourceId.startsWith("route-source-")) {
          map.removeSource(sourceId);
        }
      });
    }
  }

  // Update Map layers when plan or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clean up existing routes & markers
    clearMapElements();

    if (!plan || !plan.routes || plan.routes.length === 0) {
      // Put a default marker at current/default center if no route is loaded
      map.flyTo({ center: [80.2707, 13.0827], zoom: 11 });
      return;
    }

    // Add Source & Destination Markers
    const startMarker = new maplibregl.Marker({ color: "#22c55e" })
      .setLngLat([plan.sourceCoordinate.longitude, plan.sourceCoordinate.latitude])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML("<strong style='color:#030712;'>Source Location</strong>"))
      .addTo(map);

    const endMarker = new maplibregl.Marker({ color: "#ef4444" })
      .setLngLat([plan.destinationCoordinate.longitude, plan.destinationCoordinate.latitude])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML("<strong style='color:#030712;'>Destination Location</strong>"))
      .addTo(map);

    markersRef.current.push(startMarker, endMarker);

    // Draw Route Lines
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

    plan.routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      const geojson = {
        type: "Feature" as const,
        properties: { id: route.id },
        geometry: {
          type: "LineString" as const,
          coordinates: route.coordinates.map((c) => {
            if (c.latitude < minLat) minLat = c.latitude;
            if (c.latitude > maxLat) maxLat = c.latitude;
            if (c.longitude < minLng) minLng = c.longitude;
            if (c.longitude > maxLng) maxLng = c.longitude;
            return [c.longitude, c.latitude];
          })
        }
      };

      map.addSource(sourceId, {
        type: "geojson",
        data: geojson
      });

      const routeColor = route.id === "safest" ? "#10b981" : route.id === "fastest" ? "#3b82f6" : "#f59e0b";

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": isSelected ? routeColor : "#6b7280",
          "line-width": isSelected ? 6 : 3,
          "line-opacity": isSelected ? 0.9 : 0.4
        }
      });

      // Add click handler to route line
      map.on("click", layerId, () => {
        if (onSelectRoute) {
          onSelectRoute(route.id);
        }
      });

      // Cursor change on hover over route lines
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Fit map bounds to contain all routes
    if (minLat !== 90 && maxLat !== -90 && minLng !== 180 && maxLng !== -180) {
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          duration: 1200
        }
      );
    }
  }, [plan, selectedRouteId, mapLoaded, onSelectRoute]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      
      {/* Visual Floating Legends overlay */}
      <div style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        background: "rgba(3, 7, 18, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--border-radius-md)",
        padding: "10px 14px",
        display: "flex",
        gap: "12px",
        zIndex: 5
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" }} />
          <span>Safest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#06b6d4" }} />
          <span>Fastest</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700 }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#a855f7" }} />
          <span>Eco</span>
        </div>
        {selectedRouteId && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#FACC15" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FACC15" }} />
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
}
