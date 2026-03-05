export const SCREENING_LOCK_KEY = "thyrosakhi_screening_locked";
export const SYMPTOM_DATA_KEY = "thyrosakhi_symptom_data";

export type SymptomAnswers = {
  fatigue: boolean;
  weight_change: boolean;
  hair_fall: boolean;
  temperature_sensitivity: boolean;
  irregular_cycles: boolean;
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
