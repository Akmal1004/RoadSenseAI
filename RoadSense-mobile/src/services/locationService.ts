import { Coordinate } from "../types/route";

const defaultCurrentLocation: Coordinate = { latitude: 13.0827, longitude: 80.2707 };

export async function getCurrentLocation(): Promise<Coordinate> {
  let Location: typeof import("expo-location");
  try {
    Location = await import("expo-location");
  } catch (error) {
    console.warn("[RoadSense Location] expo-location could not be loaded", error);
    throw new Error("Location is unavailable on this device. Search manually instead.");
  }

  const permission = await Location.requestForegroundPermissionsAsync().catch((error) => {
    console.warn("[RoadSense Location] Permission request failed", error);
    throw new Error("Location permission is unavailable. Search manually instead.");
  });
  if (permission.status !== "granted") {
    throw new Error("Location permission denied. Search will still work, but nearby results may be less relevant.");
  }

  const location = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Location request timed out. Search manually instead.")), 12000);
    })
  ]);

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude
  };
}

export function getDefaultLocation(): Coordinate {
  return defaultCurrentLocation;
}
