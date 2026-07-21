# RoadSense

RoadSense is a client-only Expo mobile MVP for AI-powered route planning and trip intelligence. It uses OpenRouteService, Open-Meteo, Gemini, and AsyncStorage directly from the app. There is no backend, no database, and no authentication.

## Stack

- Expo SDK 56
- React Native
- TypeScript
- Expo Router
- React Native Maps
- React Native Paper
- React Native Reanimated
- Expo Linear Gradient
- AsyncStorage
- Axios

## Setup

Use Node.js `20.19.4+`.

```bash
npm install
copy .env.example .env
npm start
```

Add API keys to `.env`:

```env
EXPO_PUBLIC_ORS_API_KEY=your_openrouteservice_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

The app includes local demo route and AI responses when keys are missing, so it can still open quickly during development.

## Structure

```text
app/
  (tabs)/
    home.tsx
    dashboard.tsx
    routes.tsx
    assistant.tsx
    profile.tsx
  components/
  constants/
  context/
  hooks/
  services/
  types/
```

## Features

- Custom floating glass tab bar
- Dark futuristic dashboard UI
- Route planner with safest, fastest, and eco preferences
- OpenRouteService geocoding and alternative routes
- Route scoring with safety, traffic, fuel, and weather factors
- Route comparison modal
- Open-Meteo weather intelligence
- Gemini-powered AI Co-Pilot chat
- Local chat, route, destination, and preference storage
- Mock live hazards and safety analytics for MVP polish

## Run

```bash
npm start
```

Then open in Expo Go or a simulator.
