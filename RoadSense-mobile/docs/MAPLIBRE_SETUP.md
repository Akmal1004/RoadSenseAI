# MapLibre Route Preview Setup

RoadSense uses **MapLibre + OpenStreetMap** for the embedded route preview. No Google Maps SDK or API key is required for in-app map rendering.

## Install

```bash
npm install @maplibre/maplibre-react-native react-native-svg
npm uninstall react-native-maps
```

`react-native-svg` is used by existing RoadSense UI components and is required for marker icons.

## Expo plugin

`app.json` includes the MapLibre config plugin:

```json
[
  "@maplibre/maplibre-react-native",
  {
    "android": {
      "locationEngine": "default"
    }
  }
]
```

## Map tiles

The preview loads OpenStreetMap-based tiles via:

```
https://demotiles.maplibre.org/style.json
```

## Native rebuild (required)

MapLibre is a **native module** and does not work in Expo Go. Use a development build:

```bash
npx expo prebuild --clean
npx expo run:android
```

In Expo Go, the app shows **"Route preview unavailable."** and route cards still work. The embedded map requires the dev build above.

## What still uses Google (optional, no API key)

The **Open in Google Maps** button on the Routes screen opens the Google Maps app/website for turn-by-turn navigation. This uses a public URL scheme and does **not** require a Google Maps SDK or billing-enabled API key.

## Route data

Routes are fetched from **OpenRouteService** using `EXPO_PUBLIC_ORS_API_KEY`. ORS returns GeoJSON geometry; `src/utils/routeGeoJson.ts` converts coordinates to MapLibre `GeoJSONSource` + `Layer` line features.

## Fallback behavior

If MapLibre fails to load, the app shows **"Route preview unavailable."** and route cards, ETA, distance, safety score, and fuel estimates continue to work.
