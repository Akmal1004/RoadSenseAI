import { memo } from "react";
import { isMapLibreNativeAvailable } from "../utils/mapLibreNative";
import type { MapLibreRoutePreviewProps } from "./MapLibreRoutePreviewImpl";
import RouteMapFallback from "./RouteMapFallback";

function MapLibreRoutePreview(props: MapLibreRoutePreviewProps) {
  if (!isMapLibreNativeAvailable()) {
    return <RouteMapFallback hasPlan={Boolean(props.plan)} compact={props.compact} />;
  }

  const MapLibreRoutePreviewImpl = require("./MapLibreRoutePreviewImpl").default;
  return <MapLibreRoutePreviewImpl {...props} />;
}

export type { MapLibreRoutePreviewProps };
export default memo(MapLibreRoutePreview);
