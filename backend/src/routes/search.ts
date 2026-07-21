import { Request, Response, Router } from "express";
import {
  getPlaceDetails,
  reverseGeocode,
  searchNearbyPlaces,
  searchPlaces
} from "../services/openRouteService";
import { Coordinate } from "../types";

export const searchRouter = Router();

searchRouter.get("/places", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.query || "");
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lon = req.query.lon ? Number(req.query.lon) : undefined;

    const locationBias: Coordinate | null =
      typeof lat === "number" && typeof lon === "number" && !isNaN(lat) && !isNaN(lon)
        ? { latitude: lat, longitude: lon }
        : null;

    const results = await searchPlaces(query, locationBias);
    res.json({ success: true, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search places.";
    res.status(400).json({ success: false, error: message });
  }
});

searchRouter.get("/details", async (req: Request, res: Response): Promise<void> => {
  try {
    const placeId = String(req.query.placeId || "");
    if (!placeId) {
      res.status(400).json({ success: false, error: "placeId query parameter is required." });
      return;
    }

    const details = await getPlaceDetails(placeId);
    res.json({ success: true, data: details });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch place details.";
    res.status(404).json({ success: false, error: message });
  }
});

searchRouter.get("/nearby", async (req: Request, res: Response): Promise<void> => {
  try {
    const query = String(req.query.query || "");
    const category = req.query.category ? String(req.query.category) : undefined;
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ success: false, error: "lat and lon parameters are required." });
      return;
    }

    const results = await searchNearbyPlaces(query, { latitude: lat, longitude: lon }, category);
    res.json({ success: true, data: results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to search nearby places.";
    res.status(400).json({ success: false, error: message });
  }
});

searchRouter.get("/reverse", async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ success: false, error: "lat and lon parameters are required." });
      return;
    }

    const result = await reverseGeocode({ latitude: lat, longitude: lon });
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to reverse geocode coordinate.";
    res.status(400).json({ success: false, error: message });
  }
});
