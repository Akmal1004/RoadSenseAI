import { Request, Response, Router } from "express";
import { planRoutes } from "../services/openRouteService";
import { PlanInput } from "../types";

export const routesRouter = Router();

routesRouter.post("/plan", async (req: Request, res: Response): Promise<void> => {
  try {
    const { source, destination, preference, sourceCoordinate, destinationCoordinate } = req.body;

    if (!source || !destination) {
      res.status(400).json({ success: false, error: "source and destination are required fields." });
      return;
    }

    const input: PlanInput = {
      source: String(source),
      destination: String(destination),
      preference: preference || "safest",
      sourceCoordinate: sourceCoordinate ?? null,
      destinationCoordinate: destinationCoordinate ?? null
    };

    const plan = await planRoutes(input);
    res.json({ success: true, data: plan });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to plan routes.";
    res.status(400).json({ success: false, error: message });
  }
});
