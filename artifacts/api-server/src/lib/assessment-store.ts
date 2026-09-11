export type StoredIntake = {
  assessmentId: string;
  patientId: string;
  patientName?: string;
  age: number;
  sex: "female" | "male" | "other" | "not_said";
  chiefComplaint: string;
  symptoms: string[];
  otherSymptoms?: string;
  duration?: string;
  relevantHistory?: string;
  location?: string;
};

export type StoredResult = {
  assessmentId: string;
  triage: "manage_locally" | "routine_referral" | "urgent_referral";
  triageReason: string;
  possibleConditions: Array<{
    name: string;
    probability: number;
    basis: string;
  }>;
  evidence: Array<{
    source: string;
    page: number;
    section: string;
    passage: string;
  }>;
  redFlags: Array<{
    id: string;
    label: string;
    reason: string;
    action: string;
  }>;
  modelMode: "DEMO" | "LOCAL";
  uncertainty: string;
  disclaimer: string;
};

export type AssessmentSession = {
  assessmentId: string;
  createdAt: Date;
  workerName: string;
  status: "started" | "intake_saved" | "clarification_ready" | "analyzed";
  intake?: StoredIntake;
  clarificationAnswers: Record<string, string>;
  result?: StoredResult;
};

const sessions = new Map<string, AssessmentSession>();

export function createAssessment(workerName: string): AssessmentSession {
  const assessmentId = `assessment-${crypto.randomUUID()}`;
  const session: AssessmentSession = {
    assessmentId,
    createdAt: new Date(),
    workerName,
    status: "started",
    clarificationAnswers: {},
  };
  sessions.set(assessmentId, session);
  return session;
}

export function getAssessment(assessmentId: string) {
  return sessions.get(assessmentId);
}

export function saveIntake(intake: StoredIntake) {
  const session = sessions.get(intake.assessmentId);
  if (!session) return undefined;
  session.intake = intake;
  session.status = "intake_saved";
  return session;
}

export function saveClarification(
  assessmentId: string,
  answers: Record<string, string>,
) {
  const session = sessions.get(assessmentId);
  if (!session) return undefined;
  session.clarificationAnswers = answers;
  session.status = "clarification_ready";
  return session;
}

export function saveResult(assessmentId: string, result: StoredResult) {
  const session = sessions.get(assessmentId);
  if (!session) return undefined;
  session.result = result;
  session.status = "analyzed";
  return session;
}