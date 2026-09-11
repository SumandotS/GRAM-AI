import { Router, type IRouter } from "express";
import { RetrieveEvidenceBody, RetrieveEvidenceResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/rag/retrieve", (req, res) => {
  const parsed = RetrieveEvidenceBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide a retrieval question." });
  return res.json(
    RetrieveEvidenceResponse.parse({
      available: false,
      evidence: [],
      message: "No approved knowledge-base documents are indexed in this environment yet.",
    }),
  );
});

export default router;