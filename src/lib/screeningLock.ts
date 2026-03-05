export const SCREENING_LOCK_KEY = "thyrosakhi_screening_locked";
export const SYMPTOM_DATA_KEY = "thyrosakhi_symptom_data";
export const VOICE_RESULT_KEY = "thyrosakhi_voice_result";
export const NECK_RESULT_KEY = "thyrosakhi_neck_result";

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
