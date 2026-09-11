type RedFlag = {
  id: string;
  label: string;
  reason: string;
  action: string;
};

type SafetyInput = {
  age: number;
  symptoms: string[];
  clarificationAnswers: Record<string, string>;
};

const rules: Array<{
  id: string;
  labels: string[];
  reason: string;
}> = [
  {
    id: "convulsions",
    labels: ["convulsions", "seizure", "fits"],
    reason: "Convulsions can indicate a serious condition requiring immediate assessment.",
  },
  {
    id: "unconsciousness",
    labels: ["unconsciousness", "unconscious", "not waking", "unresponsive"],
    reason: "Reduced consciousness is a danger sign.",
  },
  {
    id: "lethargy",
    labels: ["lethargy", "very sleepy", "difficult to wake"],
    reason: "Marked lethargy can indicate severe illness.",
  },
  {
    id: "breathing",
    labels: ["very fast breathing", "difficulty breathing", "fast breathing", "breathing difficulty"],
    reason: "Breathing difficulty or very fast breathing can become life-threatening.",
  },
  {
    id: "feeding",
    labels: ["unable to drink", "unable to breastfeed", "not able to drink", "not feeding"],
    reason: "Inability to drink or breastfeed is a danger sign.",
  },
  {
    id: "dehydration",
    labels: ["severe dehydration", "very dehydrated", "sunken eyes with lethargy"],
    reason: "Possible severe dehydration needs urgent facility assessment.",
  },
];

function normalizedText(input: SafetyInput) {
  return [
    ...input.symptoms,
    ...Object.values(input.clarificationAnswers),
  ]
    .join(" ")
    .toLowerCase()
    .trim();
}

export function detectRedFlags(input: SafetyInput): RedFlag[] {
  const text = normalizedText(input);
  return rules
    .filter((rule) => rule.labels.some((label) => text.includes(label)))
    .map((rule) => ({
      id: rule.id,
      label: rule.id === "breathing" ? "Breathing difficulty or very fast breathing" : rule.labels[0][0].toUpperCase() + rule.labels[0].slice(1),
      reason: rule.reason,
      action: "Immediate referral to an appropriate higher-level health facility.",
    }));
}