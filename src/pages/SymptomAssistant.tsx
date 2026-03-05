import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Mic, Volume2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  saveSymptomAnswers,
  setScreeningLocked,
  type SymptomAnswers,
} from "@/lib/screeningLock";

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

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type QuestionItem = {
  key: keyof SymptomAnswers;
  text: string;
};

type AssistantStage = "safety" | "symptoms" | "locked" | "stopped" | "completed";

const INTRO_MESSAGE =
  "Hello. Before we begin the thyroid screening, I need to ask a few quick health questions.";
const SAFETY_QUESTION = "Do you currently have cold or cough?";
const YES_NO_INSTRUCTION = "Please answer only in Yes or No.";
const COLD_COUGH_WARNING =
  "Voice-based thyroid screening may not be accurate during cold or cough. Please return once your symptoms are gone.";
const LOCK_MESSAGE = "Screening is temporarily unavailable until your cold or cough is resolved.";
const FALLBACK_MESSAGE = "I didn't catch that. Please say Yes or No.";
const FINAL_UNCLEAR_MESSAGE = "We are unable to understand your response. Please try again later.";
const MAX_RETRIES = 2;

const symptomQuestions: QuestionItem[] = [
  { key: "fatigue", text: "Do you often feel unexplained fatigue?" },
  { key: "weight_change", text: "Have you experienced sudden weight gain or weight loss?" },
  { key: "hair_fall", text: "Are you experiencing unusual hair fall?" },
  { key: "temperature_sensitivity", text: "Do you feel unusually sensitive to cold or heat?" },
  { key: "irregular_cycles", text: "Do you have irregular menstrual cycles?" },
];

const SymptomAssistant = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recognizedText, setRecognizedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [readyToListen, setReadyToListen] = useState(false);
  const [stage, setStage] = useState<AssistantStage>("safety");
  const [symptomIndex, setSymptomIndex] = useState(0);

  const [symptomAnswers, setSymptomAnswers] = useState<Record<keyof SymptomAnswers, boolean | null>>({
    fatigue: null,
    weight_change: null,
    hair_fall: null,
    temperature_sensitivity: null,
    irregular_cycles: null,
  });

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const retryRef = useRef(0);
  const messageIdRef = useRef(0);
  const startedRef = useRef(false);

  const recognitionLanguage = useMemo(() => (language === "te" ? "te-IN" : "en-US"), [language]);

  const addAssistantMessage = useCallback((text: string) => {
    messageIdRef.current += 1;
    setMessages((prev) => [...prev, { id: messageIdRef.current, role: "assistant", text }]);
  }, []);

  const addUserMessage = useCallback((text: string) => {
    messageIdRef.current += 1;
    setMessages((prev) => [...prev, { id: messageIdRef.current, role: "user", text }]);
  }, []);

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
    retryRef.current = 0;
    setRetryCount(0);
  };

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      addAssistantMessage(text);

      if (!("speechSynthesis" in window)) {
        onEnd?.();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = recognitionLanguage;
      utterance.rate = 0.95;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [addAssistantMessage, recognitionLanguage]
  );

  const askQuestionAndListen = useCallback(
    (text: string) => {
      speak(`${text} ${YES_NO_INSTRUCTION}`, () => {
        setReadyToListen(true);
      });
    },
    [speak]
  );

  const stopConversation = useCallback((nextStage: AssistantStage) => {
    setStage(nextStage);
    recognitionRef.current?.stop();
    setIsListening(false);
    setReadyToListen(false);
  }, []);

  const handleUnclearResponse = useCallback(() => {
    const nextRetry = retryRef.current + 1;
    retryRef.current = nextRetry;
    setRetryCount(nextRetry);

    if (nextRetry <= MAX_RETRIES) {
      speak(FALLBACK_MESSAGE, () => {
        setReadyToListen(true);
      });
      return;
    }

    speak(FINAL_UNCLEAR_MESSAGE);
    stopConversation("stopped");
  }, [speak, stopConversation]);

  const startListening = useCallback(() => {
    if (!readyToListen || isSpeaking || isListening) {
      return;
    }

    if (stage === "locked" || stage === "stopped" || stage === "completed") {
      return;
    }

    const RecognitionConstructor = getRecognitionConstructor();
    if (!RecognitionConstructor) {
      speak("Speech recognition is not supported in this browser.");
      stopConversation("stopped");
      return;
    }

    setReadyToListen(false);

    const recognition = new RecognitionConstructor();
    let hasResult = false;
    recognitionRef.current = recognition;
    recognition.lang = recognitionLanguage;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      hasResult = true;
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      setRecognizedText(transcript);
      addUserMessage(transcript || "...");

      const answer = detectYesNo(transcript);
      if (answer === null) {
        handleUnclearResponse();
        return;
      }

      resetRetryCounter();

      if (stage === "safety") {
        if (answer) {
          setScreeningLocked(true);
          stopConversation("locked");
          speak(COLD_COUGH_WARNING, () => {
            speak(LOCK_MESSAGE);
          });
          return;
        }

        setScreeningLocked(false);
        setStage("symptoms");
        setSymptomIndex(0);
        askQuestionAndListen(symptomQuestions[0].text);
        return;
      }

      if (stage === "symptoms") {
        const currentQuestion = symptomQuestions[symptomIndex];
        if (!currentQuestion) {
          return;
        }

        setSymptomAnswers((prev) => ({
          ...prev,
          [currentQuestion.key]: answer,
        }));

        const nextIndex = symptomIndex + 1;
        if (nextIndex >= symptomQuestions.length) {
          const finalized: SymptomAnswers = {
            fatigue: currentQuestion.key === "fatigue" ? answer : symptomAnswers.fatigue === true,
            weight_change:
              currentQuestion.key === "weight_change" ? answer : symptomAnswers.weight_change === true,
            hair_fall: currentQuestion.key === "hair_fall" ? answer : symptomAnswers.hair_fall === true,
            temperature_sensitivity:
              currentQuestion.key === "temperature_sensitivity"
                ? answer
                : symptomAnswers.temperature_sensitivity === true,
            irregular_cycles:
              currentQuestion.key === "irregular_cycles" ? answer : symptomAnswers.irregular_cycles === true,
          };

          saveSymptomAnswers(finalized);
          setStage("completed");
          stopConversation("completed");
          navigate("/voice-test", { replace: true });
          return;
        }

        setSymptomIndex(nextIndex);
        askQuestionAndListen(symptomQuestions[nextIndex].text);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        speak("Microphone permission denied. Please allow microphone access.");
        stopConversation("stopped");
        return;
      }

      if (event.error === "no-speech") {
        handleUnclearResponse();
        return;
      }

      speak("Unable to recognize speech. Please try again later.");
      stopConversation("stopped");
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!hasResult) {
        handleUnclearResponse();
      }
    };

    try {
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      speak("Could not start microphone listening. Please try again.");
      stopConversation("stopped");
    }
  }, [
    addUserMessage,
    askQuestionAndListen,
    handleUnclearResponse,
    isListening,
    isSpeaking,
    navigate,
    readyToListen,
    recognitionLanguage,
    speak,
    stage,
    stopConversation,
    symptomAnswers.fatigue,
    symptomAnswers.hair_fall,
    symptomAnswers.irregular_cycles,
    symptomAnswers.temperature_sensitivity,
    symptomAnswers.weight_change,
    symptomIndex,
  ]);

  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      speak(INTRO_MESSAGE, () => {
        speak(YES_NO_INSTRUCTION, () => {
          askQuestionAndListen(SAFETY_QUESTION);
        });
      });
    }
  }, [askQuestionAndListen, speak]);

  useEffect(() => {
    startListening();
  }, [startListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-md mx-auto space-y-4">
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Symptom Assistant</p>
            <p className="text-sm text-muted-foreground">AI voice health assistant</p>
          </div>
          <Volume2 className="w-5 h-5 text-muted-foreground ml-auto" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 h-[65vh] overflow-y-auto space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
                  message.role === "assistant"
                    ? "bg-muted text-foreground rounded-bl-md"
                    : "bg-primary text-primary-foreground rounded-br-md"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {recognizedText && (
            <div className="text-xs text-muted-foreground text-center">Recognized: {recognizedText}</div>
          )}

          {retryCount > 0 && stage !== "stopped" && stage !== "locked" && (
            <div className="text-xs text-warning text-center">Retry {retryCount}/{MAX_RETRIES}</div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isListening ? "bg-success/20 animate-pulse" : "bg-muted"
            }`}
          >
            <Mic className={`w-6 h-6 ${isListening ? "text-success" : "text-muted-foreground"}`} />
          </div>
          <p className="text-sm text-muted-foreground">
            {isListening
              ? "Listening..."
              : isSpeaking
              ? "Assistant speaking..."
              : stage === "locked"
              ? "Screening locked"
              : stage === "stopped"
              ? "Conversation stopped"
              : "Waiting..."}
          </p>
        </div>

        {stage === "locked" && (
          <button
            type="button"
            onClick={() => navigate("/home", { replace: true })}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Return to Home
          </button>
        )}
      </div>
    </div>
  );
};

export default SymptomAssistant;
