import { Coordinate, RouteOption } from "../types/route";

export type LngLat = [longitude: number, latitude: number];

export type RouteLineFeature = {
  type: "Feature";
  properties: {
    id: string;
    name: string;
  };
  geometry: {
    type: "LineString";
    coordinates: LngLat[];
  };
};

export function coordinateToLngLat(coordinate: Coordinate): LngLat {
  return [coordinate.longitude, coordinate.latitude];
}

export function orsCoordinatesToGeoJson(coordinates: LngLat[]): RouteLineFeature["geometry"] {
  return {
    type: "LineString",
    coordinates: coordinates.filter(isValidLngLat)
  };
}

export function routeToGeoJsonFeature(route: RouteOption): RouteLineFeature {
  return {
    type: "Feature",
    properties: {
      id: route.id,
      name: route.name
    },
    geometry: orsCoordinatesToGeoJson(route.coordinates.map(coordinateToLngLat))
  };
}

export function routeBounds(routes: RouteOption[], fallback: Coordinate): [number, number, number, number] {
  const coordinates = routes.flatMap((route) => route.coordinates);
  if (!coordinates.length) {
    return [
      fallback.longitude - 0.04,
      fallback.latitude - 0.04,
      fallback.longitude + 0.04,
      fallback.latitude + 0.04
    ];
  }

  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const west = Math.min(...longitudes);
  const east = Math.max(...longitudes);
  const south = Math.min(...latitudes);
  const north = Math.max(...latitudes);
  const padding = 0.01;

  return [west - padding, south - padding, east + padding, north + padding];
}

function isValidLngLat(coordinate: LngLat): boolean {
  return (
    Number.isFinite(coordinate[0]) &&
    Number.isFinite(coordinate[1]) &&
    Math.abs(coordinate[0]) <= 180 &&
    Math.abs(coordinate[1]) <= 90
  );
}
