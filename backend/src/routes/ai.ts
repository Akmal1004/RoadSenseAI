import { Request, Response, Router } from "express";
import { askGemini, generateRouteInsights } from "../services/geminiService";

export const aiRouter = Router();

aiRouter.post("/ask", async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, scope } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, error: "prompt is a required body parameter." });
      return;
    }

    const answer = await askGemini(String(prompt), scope || "assistant");
    res.json({ success: true, data: { text: answer } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI service request failed.";
    res.status(400).json({ success: false, error: message });
  }
});

aiRouter.post("/insights", async (req: Request, res: Response): Promise<void> => {
  try {
    const { plan, scope } = req.body;
    if (!plan || !plan.routes || !plan.routes.length) {
      res.status(400).json({ success: false, error: "Valid route plan is required for insights." });
      return;
    }

    const insights = await generateRouteInsights(plan, scope || "home-insights");
    res.json({ success: true, data: { insights } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate route insights.";
    res.status(400).json({ success: false, error: message });
  }
});
