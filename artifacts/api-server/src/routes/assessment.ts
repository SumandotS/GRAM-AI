import { Router, type IRouter } from "express";
import {
  AnalyzeAssessmentBody,
  AnalyzeAssessmentResponse,
  CheckRedFlagsBody,
  CheckRedFlagsResponse,
  StartAssessmentBody,
  StartAssessmentResponse,
  SubmitClarificationBody,
  SubmitClarificationResponse,
  SubmitIntakeBody,
  SubmitIntakeResponse,
} from "@workspace/api-zod";
import {
  createAssessment,
  getAssessment,
  saveClarification,
  saveIntake,
  saveResult,
} from "../lib/assessment-store";
import { detectRedFlags } from "../lib/safety";
import { isOllamaAvailable } from "../lib/runtime";

const router: IRouter = Router();
const DISCLAIMER =
  "GRAM-AI is a decision-support tool and does not replace a qualified healthcare professional.";

function badRequest(res: Parameters<IRouter["post"]>[1] extends never ? never : any, message: string) {
  return res.status(400).json({ error: message });
}

router.post("/assessment/start", (req, res) => {
  const parsed = StartAssessmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide the ASHA worker's name." });
  const session = createAssessment(parsed.data.workerName);
  return res.json(
    StartAssessmentResponse.parse({
      assessmentId: session.assessmentId,
      createdAt: session.createdAt,
      status: session.status,
    }),
  );
});

router.post("/assessment/intake", (req, res) => {
  const parsed = SubmitIntakeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please check the patient information and symptom fields." });
  const session = saveIntake(parsed.data);
  if (!session) return res.status(404).json({ error: "Assessment session not found. Please start a new assessment." });
  return res.json(
    SubmitIntakeResponse.parse({
      assessmentId: parsed.data.assessmentId,
      accepted: true,
      nextStep: "clarification",
      message: "Patient information saved for this assessment.",
    }),
  );
});

router.post("/assessment/clarify", (req, res) => {
  const parsed = SubmitClarificationBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide clarification details." });
  const session = getAssessment(parsed.data.assessmentId);
  if (!session) return res.status(404).json({ error: "Assessment session not found. Please start a new assessment." });

  const questions = [
    {
      id: "breathing",
      prompt: "Is the patient having difficulty breathing or breathing much faster than usual?",
      options: ["Yes", "No", "Not sure"],
    },
    {
      id: "drinking",
      prompt: "Is the patient able to drink or breastfeed normally?",
      options: ["Yes", "No", "Not sure"],
    },
    {
      id: "alertness",
      prompt: "Is the patient awake and responding normally?",
      options: ["Yes", "No", "Not sure"],
    },
  ];

  if (parsed.data.mode === "answers") {
    saveClarification(parsed.data.assessmentId, parsed.data.answers ?? {});
  }

  return res.json(
    SubmitClarificationResponse.parse({
      assessmentId: parsed.data.assessmentId,
      questions,
      answersSaved: parsed.data.mode === "answers",
    }),
  );
});

router.post("/red-flags/check", (req, res) => {
  const parsed = CheckRedFlagsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Unable to check danger signs from the provided information." });
  return res.json(
    CheckRedFlagsResponse.parse({
      hasRedFlags: detectRedFlags(parsed.data).length > 0,
      flags: detectRedFlags(parsed.data),
    }),
  );
});

router.post("/assessment/analyze", async (req, res) => {
  const parsed = AnalyzeAssessmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Assessment ID is required." });
  const session = getAssessment(parsed.data.assessmentId);
  if (!session?.intake) return res.status(404).json({ error: "Patient information was not found. Please complete intake first." });

  const redFlags = detectRedFlags({
    age: session.intake.age,
    symptoms: [...session.intake.symptoms, session.intake.otherSymptoms ?? ""],
    clarificationAnswers: session.clarificationAnswers,
  });
  const mode = (await isOllamaAvailable()) ? "LOCAL" : "DEMO";
  const triage = redFlags.length > 0 ? "urgent_referral" : "manage_locally";
  const triageReason =
    redFlags.length > 0
      ? `Danger sign detected: ${redFlags[0].label}.`
      : "No configured danger sign was detected by the deterministic safety check. Continue clinical assessment and follow local protocol.";
  const result = AnalyzeAssessmentResponse.parse({
    assessmentId: session.assessmentId,
    triage,
    triageReason,
    possibleConditions: [],
    evidence: [],
    redFlags,
    modelMode: mode,
    uncertainty:
      mode === "DEMO"
        ? "No local LLM, Random Forest model, or indexed protocol documents are connected. This demo result is limited to configured safety rules and must not be treated as a diagnosis."
        : "Model output is not a diagnosis. Confirm findings against current local protocol and qualified clinical judgment.",
    disclaimer: DISCLAIMER,
  });
  saveResult(session.assessmentId, result);
  return res.json(result);
});

export default router;