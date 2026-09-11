import { Router, type IRouter } from "express";
import { GetSystemStatusResponse } from "@workspace/api-zod";
import { isOllamaAvailable } from "../lib/runtime";

const router: IRouter = Router();

router.get("/system/status", async (_req, res) => {
  const ollama = await isOllamaAvailable();
  const data = GetSystemStatusResponse.parse({
    mode: ollama ? "LOCAL" : "DEMO",
    backend: "connected",
    langgraph: "unavailable",
    ollama: ollama ? "connected" : "not_connected",
    phi3Mini: ollama ? "available" : "not_available",
    chromaDb: "unavailable",
    knowledgeBase: "not_loaded",
    randomForest: "not_trained",
    message: ollama
      ? "Ollama is reachable. Confirm that the configured local model is Phi-3 Mini before clinical use. The current demo orchestration is not a validated LangGraph deployment."
      : "DEMO MODE — Ollama/Phi-3 Mini is not connected.",
  });
  res.json(data);
});

export default router;