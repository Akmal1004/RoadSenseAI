import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RoutePlan, RouteOption, Coordinate } from "../types/route";

interface MapContainerProps {
  plan: RoutePlan | null;
  selectedRouteId: string | null;
  onSelectRoute?: (routeId: string) => void;
}

const mapStyleUrl = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const routeColors: Record<string, string> = {
  safest: "#22c55e",
  fastest: "#06b6d4",
  eco: "#a855f7"
};

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
  }, []);

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
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML("<strong style='color:#030712;'>Destination</strong>"))
      .addTo(map);

    markersRef.current = [startMarker, endMarker];

    // Compute route bounds to zoom
    const lats: number[] = [plan.sourceCoordinate.latitude, plan.destinationCoordinate.latitude];
    const lngs: number[] = [plan.sourceCoordinate.longitude, plan.destinationCoordinate.longitude];

    // Add Route Polyline sources and layers
    plan.routes.forEach((route) => {
      const isSelected = selectedRouteId === route.id;
      const color = isSelected ? "#FACC15" : routeColors[route.id] || "#3b82f6";
      const opacity = selectedRouteId ? (isSelected ? 0.95 : 0.4) : 0.8;
      const weight = isSelected ? 6 : 4;

      const coordinates = route.coordinates.map((c) => {
        lats.push(c.latitude);
        lngs.push(c.longitude);
        return [c.longitude, c.latitude];
      });

      const sourceId = `route-source-${route.id}`;
      const layerId = `route-layer-${route.id}`;

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates
          }
        }
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": color,
          "line-width": weight,
          "line-opacity": opacity
        }
      });

      // Add click handler to route layer
      map.on("click", layerId, () => {
        if (onSelectRoute) onSelectRoute(route.id);
      });

      // Change cursor on hovering route lines
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    // Zoom map to fit the route bounds
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

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
  }, [plan, selectedRouteId, mapLoaded]);

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
