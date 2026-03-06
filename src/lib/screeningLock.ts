export const SCREENING_LOCK_KEY = "thyrosakhi_screening_locked";
export const SYMPTOM_DATA_KEY = "thyrosakhi_symptom_data";
export const VOICE_RESULT_KEY = "thyrosakhi_voice_result";
export const NECK_RESULT_KEY = "thyrosakhi_neck_result";
export const HISTORY_KEY = "thyrosakhi_history";

export type SymptomAnswers = {
  fatigue: boolean;
  weight_change: boolean;
  hair_fall: boolean;
  temperature_sensitivity: boolean;
  irregular_cycles: boolean;
};

export type VoiceTestResult = {
  average_pitch: number;
  pitch_variation: number;
  energy: number;
  duration: number;
  risk_score: number;
  risk_level: string;
};

export type NeckTestResult = {
  neck_score: number;
  swelling_level: string;
  message: string;
};

const hasWindow = () => typeof window !== "undefined";

export const isScreeningLocked = (): boolean => {
  if (!hasWindow()) {
    return false;
  }

  return window.localStorage.getItem(SCREENING_LOCK_KEY) === "true";
};

export const setScreeningLocked = (locked: boolean) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(SCREENING_LOCK_KEY, locked ? "true" : "false");
};

export const saveSymptomAnswers = (answers: SymptomAnswers) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(SYMPTOM_DATA_KEY, JSON.stringify(answers));
};

export const getSymptomAnswers = (): SymptomAnswers | null => {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(SYMPTOM_DATA_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SymptomAnswers;
  } catch {
    return null;
  }
};

export const saveVoiceResult = (result: VoiceTestResult) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(VOICE_RESULT_KEY, JSON.stringify(result));
};

export const getVoiceResult = (): VoiceTestResult | null => {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(VOICE_RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as VoiceTestResult;
  } catch {
    return null;
  }
};

export const saveNeckResult = (result: NeckTestResult) => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(NECK_RESULT_KEY, JSON.stringify(result));
};

export const getNeckResult = (): NeckTestResult | null => {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(NECK_RESULT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as NeckTestResult;
  } catch {
    return null;
  }
};

export const getScreeningCompletion = () => {
  const symptoms = getSymptomAnswers();
  const voice = getVoiceResult();
  const neck = getNeckResult();

  return {
    hasSymptoms: Boolean(symptoms),
    hasVoice: Boolean(voice),
    hasNeck: Boolean(neck),
    isComplete: Boolean(symptoms && voice && neck),
  };
};

export type ScreeningRoute = "/symptom-assistant" | "/voice-test" | "/neck-scan" | "/risk-score";

export const getNextScreeningRoute = (): ScreeningRoute => {
  const completion = getScreeningCompletion();

  if (!completion.hasSymptoms) {
    return "/symptom-assistant";
  }

  if (!completion.hasVoice) {
    return "/voice-test";
  }

  if (!completion.hasNeck) {
    return "/neck-scan";
  }

  return "/risk-score";
};

export const resetScreeningData = () => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(SYMPTOM_DATA_KEY);
  window.localStorage.removeItem(VOICE_RESULT_KEY);
  window.localStorage.removeItem(NECK_RESULT_KEY);
  window.localStorage.removeItem(SCREENING_LOCK_KEY);
};

// History types and functions
export type HistoryEntry = {
  date: string;
  score: number;
  riskLevel: "low" | "medium" | "high";
  symptomAnswers: SymptomAnswers;
  voiceResult: VoiceTestResult;
  neckResult: NeckTestResult;
};

export const getHistory = (): HistoryEntry[] => {
  if (!hasWindow()) {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
};

export const saveToHistory = (entry: HistoryEntry) => {
  if (!hasWindow()) {
    return;
  }

  const history = getHistory();
  // Add new entry at the beginning
  history.unshift(entry);
  // Keep only the last 20 entries
  const trimmedHistory = history.slice(0, 20);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
};

export const calculateHealthScore = (
  symptomAnswers: SymptomAnswers,
  voiceResult: VoiceTestResult,
  neckResult: NeckTestResult
): { score: number; riskLevel: "low" | "medium" | "high" } => {
  const symptomScore =
    Number(symptomAnswers.fatigue) +
    Number(symptomAnswers.weight_change) +
    Number(symptomAnswers.hair_fall) +
    Number(symptomAnswers.temperature_sensitivity) +
    Number(symptomAnswers.irregular_cycles);

  const voiceRisk = Math.min(Math.max(voiceResult.risk_score, 0), 3);
  const neckRisk = Math.min(Math.max(neckResult.neck_score ?? 0, 0), 0.5);

  const normalizedRisk =
    (voiceRisk / 3) * 0.4 +
    (symptomScore / 5) * 0.4 +
    (neckRisk / 0.5) * 0.2;

  const healthScore = Math.round((1 - normalizedRisk) * 100);
  const score = Math.min(100, Math.max(0, healthScore));
  const riskLevel = score >= 70 ? "low" : score >= 40 ? "medium" : "high";

  return { score, riskLevel };
};

export const saveCurrentScreeningToHistory = () => {
  const symptomAnswers = getSymptomAnswers();
  const voiceResult = getVoiceResult();
  const neckResult = getNeckResult();

  if (!symptomAnswers || !voiceResult || !neckResult) {
    return;
  }

  const { score, riskLevel } = calculateHealthScore(symptomAnswers, voiceResult, neckResult);

  const entry: HistoryEntry = {
    date: new Date().toISOString(),
    score,
    riskLevel,
    symptomAnswers,
    voiceResult,
    neckResult,
  };

  saveToHistory(entry);
};

export const clearHistory = () => {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.removeItem(HISTORY_KEY);
};
