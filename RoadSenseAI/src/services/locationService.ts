import { Coordinate } from "../types/route";

const defaultCurrentLocation: Coordinate = { latitude: 13.0827, longitude: 80.2707 };

export async function getCurrentLocation(): Promise<Coordinate> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn("[RoadSense Location] Geolocation request failed", error);
        reject(new Error("Location permission denied or unavailable. Search manually instead."));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

export function getDefaultLocation(): Coordinate {
  return defaultCurrentLocation;
}
