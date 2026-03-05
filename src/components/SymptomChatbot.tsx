import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

interface SpeechRecognitionEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEvent {
  error: SpeechRecognitionErrorCode;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

type ThyroidAnswers = {
  fatigue: boolean | null;
  weight_change: boolean | null;
  hair_fall: boolean | null;
  temperature_sensitivity: boolean | null;
  irregular_cycles: boolean | null;
};

type ChatState = {
  coldOrCough: boolean | null;
  thyroid: ThyroidAnswers;
};

type SymptomChatbotProps = {
  onAnalysisAvailabilityChange?: (isEnabled: boolean) => void;
};

const symptomQuestions = [
  "Do you feel unexplained fatigue?",
  "Have you experienced sudden weight gain or weight loss?",
  "Are you experiencing hair fall?",
  "Do you feel unusually sensitive to cold or heat?",
  "Do you have irregular menstrual cycles?",
];

const symptomAnswerKeys: Array<keyof ThyroidAnswers> = [
  "fatigue",
  "weight_change",
  "hair_fall",
  "temperature_sensitivity",
  "irregular_cycles",
];

const languageOptions = [
  { label: "English (US)", value: "en-US" },
  { label: "English (India)", value: "en-IN" },
  { label: "Hindi", value: "hi-IN" },
];

const COLD_COUGH_QUESTION = "Do you currently have cold or cough?";
const COLD_COUGH_WARNING =
  "Voice analysis may not be accurate during cold or cough. Please return once symptoms resolve.";
const UNCLEAR_RESPONSE_MESSAGE = "I didn't catch that. Please say Yes or No.";
const RETRY_EXHAUSTED_MESSAGE =
  "We are unable to understand your response. Please try again later.";
const MAX_RETRIES_PER_QUESTION = 2;

const SymptomChatbot = ({ onAnalysisAvailabilityChange }: SymptomChatbotProps) => {
  const [chatState, setChatState] = useState<ChatState>({
    coldOrCough: null,
    thyroid: {
      fatigue: null,
      weight_change: null,
      hair_fall: null,
      temperature_sensitivity: null,
      irregular_cycles: null,
    },
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isChatStopped, setIsChatStopped] = useState(false);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const retryCountRef = useRef(0);

  const coldOrCoughAnswered = chatState.coldOrCough !== null;
  const blockedByColdOrCough = chatState.coldOrCough === true;
  const canAskThyroidQuestions = chatState.coldOrCough === false;
  const completedThyroidQuestions = questionIndex >= symptomQuestions.length;

  const currentQuestionText = useMemo(() => {
    if (!coldOrCoughAnswered) {
      return COLD_COUGH_QUESTION;
    }

    if (canAskThyroidQuestions && !completedThyroidQuestions) {
      return symptomQuestions[questionIndex] ?? "";
    }

    return "";
  }, [coldOrCoughAnswered, canAskThyroidQuestions, completedThyroidQuestions, questionIndex]);

  const symptomScore = useMemo(() => {
    const values = Object.values(chatState.thyroid);
    return values.reduce((count, value) => (value ? count + 1 : count), 0);
  }, [chatState.thyroid]);

  const speakText = useCallback(
    (text: string, onEndCallback?: () => void) => {
      if (!("speechSynthesis" in window)) {
        onEndCallback?.();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLanguage;
      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onEndCallback?.();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [speechLanguage]
  );

  const getRecognitionConstructor = (): BrowserSpeechRecognitionConstructor | null => {
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
  };

  const detectYesNo = (spokenText: string): boolean | null => {
    const response = spokenText.toLowerCase().trim();
    const hasYes =
      response.includes("yes") || response.includes("yeah") || response.includes("yup");
    const hasNo = response.includes("no") || response.includes("nope") || response.includes("not");

    if (hasYes && hasNo) {
      return null;
    }

    if (hasYes) {
      return true;
    }

    if (hasNo) {
      return false;
    }

    return null;
  };

  const resetRetryCounter = () => {
    setRetryCount(0);
    retryCountRef.current = 0;
  };

  const handleColdCoughAnswer = (answer: boolean) => {
    setSubmitError(null);
    setBackendMessage(null);
    setMicError(null);
    setChatState((previous) => ({ ...previous, coldOrCough: answer }));
    resetRetryCounter();

    if (answer) {
      onAnalysisAvailabilityChange?.(false);
      setQuestionIndex(0);
      recognitionRef.current?.stop();
      setListening(false);
      speakText(COLD_COUGH_WARNING);
      return;
    }

    onAnalysisAvailabilityChange?.(true);
  };

  const handleThyroidAnswer = (answer: boolean) => {
    const currentKey = symptomAnswerKeys[questionIndex];
    if (!currentKey) {
      return;
    }

    setSubmitError(null);
    setBackendMessage(null);
    setMicError(null);

    setChatState((previous) => ({
      ...previous,
      thyroid: {
        ...previous.thyroid,
        [currentKey]: answer,
      },
    }));

    resetRetryCounter();
    setQuestionIndex((index) => index + 1);
  };

  const startListeningForAnswer = useCallback(() => {
    if (listening || isChatStopped) {
      return;
    }

    if (blockedByColdOrCough) {
      setMicError("Chatbot is stopped because cold or cough is present.");
      return;
    }

    if (isSpeaking) {
      return;
    }

    setMicError(null);

    const RecognitionConstructor = getRecognitionConstructor();
    if (!RecognitionConstructor) {
      setMicError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new RecognitionConstructor();
    recognitionRef.current = recognition;
    recognition.lang = speechLanguage;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      setRecognizedText(transcript);

      const answer = detectYesNo(transcript);
      if (answer === null) {
        const nextRetry = retryCountRef.current + 1;
        retryCountRef.current = nextRetry;
        setRetryCount(nextRetry);

        if (nextRetry <= MAX_RETRIES_PER_QUESTION) {
          setMicError(UNCLEAR_RESPONSE_MESSAGE);
          recognitionRef.current?.stop();
          setListening(false);
          speakText(UNCLEAR_RESPONSE_MESSAGE, () => {
            if (!isChatStopped && !blockedByColdOrCough) {
              startListeningForAnswer();
            }
          });
          return;
        }

        recognitionRef.current?.stop();
        setListening(false);
        setIsChatStopped(true);
        setMicError(RETRY_EXHAUSTED_MESSAGE);
        speakText(RETRY_EXHAUSTED_MESSAGE);
        return;
      }

      resetRetryCounter();

      if (!coldOrCoughAnswered) {
        handleColdCoughAnswer(answer);
        return;
      }

      if (canAskThyroidQuestions && !completedThyroidQuestions) {
        handleThyroidAnswer(answer);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setMicError("Microphone permission denied. Please allow microphone access.");
        return;
      }

      if (event.error === "no-speech") {
        setMicError("No speech detected. Please try again.");
        return;
      }

      setMicError("Unable to recognize speech. Please try again.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      setListening(true);
      recognition.start();
    } catch {
      setListening(false);
      setMicError("Could not start microphone listening. Please try again.");
    }
  }, [
    blockedByColdOrCough,
    canAskThyroidQuestions,
    coldOrCoughAnswered,
    completedThyroidQuestions,
    isChatStopped,
    isSpeaking,
    listening,
    speechLanguage,
    speakText,
  ]);

  const submitSymptoms = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setBackendMessage(null);

    try {
      const response = await fetch("/calculate-risk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voice_score: 0,
          symptom_score: symptomScore,
          neck_score: 0,
          symptoms: {
            cold_or_cough: chatState.coldOrCough,
            fatigue: chatState.thyroid.fatigue === true,
            weight_change: chatState.thyroid.weight_change === true,
            hair_fall: chatState.thyroid.hair_fall === true,
            temperature_sensitivity: chatState.thyroid.temperature_sensitivity === true,
            irregular_cycles: chatState.thyroid.irregular_cycles === true,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to submit symptom data");
      }

      setBackendMessage("Symptom data submitted successfully.");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit symptom data");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!currentQuestionText || blockedByColdOrCough || isChatStopped) {
      return;
    }

    speakText(currentQuestionText, () => {
      startListeningForAnswer();
    });
  }, [blockedByColdOrCough, currentQuestionText, isChatStopped, speakText, startListeningForAnswer]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const currentQuestion = canAskThyroidQuestions ? symptomQuestions[questionIndex] : null;

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4 space-y-4">
      <p className="font-semibold text-foreground">Symptom Chatbot</p>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Language</p>
        <select
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          value={speechLanguage}
          onChange={(event) => setSpeechLanguage(event.target.value)}
          disabled={listening || isSpeaking || isChatStopped}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {!coldOrCoughAnswered && (
        <div className="space-y-3">
          <p className="text-sm text-foreground">{COLD_COUGH_QUESTION}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              onClick={() => handleColdCoughAnswer(true)}
              disabled={isChatStopped}
            >
              Yes
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
              onClick={() => handleColdCoughAnswer(false)}
              disabled={isChatStopped}
            >
              No
            </button>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary/10 text-foreground text-sm disabled:opacity-60"
            onClick={startListeningForAnswer}
            disabled={listening || isSpeaking || isChatStopped}
          >
            {isSpeaking ? "Speaking question..." : listening ? "Listening..." : "Speak answer"}
          </button>
        </div>
      )}

      {blockedByColdOrCough && (
        <div className="rounded-lg bg-warning/10 text-warning p-3 text-sm">{COLD_COUGH_WARNING}</div>
      )}

      {isChatStopped && !blockedByColdOrCough && (
        <div className="rounded-lg bg-warning/10 text-warning p-3 text-sm">{RETRY_EXHAUSTED_MESSAGE}</div>
      )}

      {canAskThyroidQuestions && currentQuestion && !isChatStopped && (
        <div className="space-y-3">
          <p className="text-sm text-foreground">{currentQuestion}</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm"
              onClick={() => handleThyroidAnswer(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm"
              onClick={() => handleThyroidAnswer(false)}
            >
              No
            </button>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary/10 text-foreground text-sm disabled:opacity-60"
            onClick={startListeningForAnswer}
            disabled={listening || isSpeaking || isChatStopped}
          >
            {isSpeaking ? "Speaking question..." : listening ? "Listening..." : "Speak answer"}
          </button>
        </div>
      )}

      {recognizedText && <p className="text-sm text-muted-foreground">Recognized: {recognizedText}</p>}
      {retryCount > 0 && !isChatStopped && (
        <p className="text-xs text-muted-foreground">Retry: {retryCount}/{MAX_RETRIES_PER_QUESTION}</p>
      )}
      {micError && <p className="text-sm text-danger">{micError}</p>}

      {canAskThyroidQuestions && completedThyroidQuestions && !isChatStopped && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">All symptom questions completed.</p>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-60"
            onClick={submitSymptoms}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit symptoms"}
          </button>
        </div>
      )}

      {backendMessage && <p className="text-sm text-success">{backendMessage}</p>}
      {submitError && <p className="text-sm text-danger">{submitError}</p>}
    </div>
  );
};

export default SymptomChatbot;
