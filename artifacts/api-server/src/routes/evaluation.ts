import { Router, type IRouter } from "express";
import { GetEvaluationMetricsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/evaluation/metrics", (_req, res) => {
  return res.json(
    GetEvaluationMetricsResponse.parse({
      status: "not_performed",
      measured: false,
      message: "Evaluation not yet performed. No clinical metrics are displayed as achieved results.",
      accuracy: null,
      precision: null,
      recall: null,
      f1: null,
    }),
  );
});

export default router;