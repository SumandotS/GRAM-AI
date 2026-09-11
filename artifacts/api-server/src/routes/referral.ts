import { Router, type IRouter } from "express";
import { GenerateReferralBody, GenerateReferralResponse } from "@workspace/api-zod";
import { getAssessment } from "../lib/assessment-store";

const router: IRouter = Router();

router.post("/referral/generate", (req, res) => {
  const parsed = GenerateReferralBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Worker name and assessment ID are required." });
  const session = getAssessment(parsed.data.assessmentId);
  if (!session?.intake || !session.result) return res.status(404).json({ error: "Complete the assessment before generating a referral note." });
  const intake = session.intake;
  const result = session.result;
  const redFlagText = result.redFlags.length
    ? result.redFlags.map((flag) => `- ${flag.label}: ${flag.reason}`).join("\n")
    : "None detected by configured rules.";
  const printableText = [
    "GRAM-AI REFERRAL NOTE",
    "Decision-support document — not an official government medical form",
    "",
    `Patient ID: ${intake.patientId}`,
    `Patient name/initials: ${intake.patientName || "Not provided"}`,
    `Age: ${intake.age}`,
    `Sex: ${intake.sex}`,
    `Chief complaint: ${intake.chiefComplaint}`,
    `Symptoms: ${intake.symptoms.join(", ")}`,
    `Duration: ${intake.duration || "Not provided"}`,
    `Relevant history: ${intake.relevantHistory || "Not provided"}`,
    "",
    `Triage category: ${result.triage.replaceAll("_", " ").toUpperCase()}`,
    `Reason: ${result.triageReason}`,
    "",
    "Detected danger signs:",
    redFlagText,
    "",
    `ASHA worker: ${parsed.data.workerName}`,
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    "Disclaimer: GRAM-AI is a decision-support tool and does not replace a qualified healthcare professional.",
    parsed.data.notes ? `Additional notes: ${parsed.data.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return res.json(
    GenerateReferralResponse.parse({
      filename: `gram-ai-referral-${intake.patientId.replace(/[^a-z0-9_-]/gi, "-")}.txt`,
      generatedAt: new Date(),
      printableText,
      disclaimer: "This is a printable prototype note, not an official government medical form.",
    }),
  );
});

export default router;