import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Mic, Play, Volume2 } from "lucide-react";
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

type QuestionKey = keyof SymptomAnswers;

type AssistantStage = "waiting" | "safety" | "symptoms" | "locked" | "stopped" | "completed";

const MAX_RETRIES = 3;

const SYMPTOM_QUESTION_KEYS: QuestionKey[] = [
  "fatigue",
  "weight_change",
  "hair_fall",
  "temperature_sensitivity",
  "irregular_cycles",
];

const SymptomAssistant = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recognizedText, setRecognizedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [readyToListen, setReadyToListen] = useState(false);
  const [stage, setStage] = useState<AssistantStage>("waiting");
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
  
  // Keep refs in sync with state for use in callbacks
  const stageRef = useRef(stage);
  const symptomIndexRef = useRef(symptomIndex);
  const symptomAnswersRef = useRef(symptomAnswers);
  
  useEffect(() => { stageRef.current = stage; }, [stage]);
  useEffect(() => { symptomIndexRef.current = symptomIndex; }, [symptomIndex]);
  useEffect(() => { symptomAnswersRef.current = symptomAnswers; }, [symptomAnswers]);
  const startedRef = useRef(false);

  // Use English-India for speech recognition (better accent handling), but user's language for speech synthesis
  const speechLang = useMemo(() => (language === "te" ? "te-IN" : "en-US"), [language]);
  // Use user's language for recognition - te-IN for Telugu, en-US for English
  const recognitionLang = useMemo(() => (language === "te" ? "te-IN" : "en-US"), [language]);

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
    
    // Log for debugging
    console.log("[SymptomAssistant] Raw input:", `"${spokenText}"`);
    console.log("[SymptomAssistant] Normalized input:", `"${response}"`);
    console.log("[SymptomAssistant] Language:", language);
    
    // Empty input
    if (!response || response.length === 0) {
      console.log("[SymptomAssistant] Empty input");
      return null;
    }
    
    // ================== TELUGU PATTERNS ==================
    // Telugu yes: అవును (avunu), హా (ha), ఔను (aunu), ఉన్నాయి (unnayi)
    // Telugu no: లేదు (ledu), కాదు (kaadu), లేవు (levu), లే (le)
    const teluguYesPatterns = [
      "అవును", "ఔను", "హా", "హాన్", "ఉన్నాయి", "ఉంది", "అవునవును", "ఆ",
      // Romanized variations that might be recognized
      "avunu", "aunu", "ha", "haa", "haan", "unnayi", "undi", "aa", "avnu"
    ];
    const teluguNoPatterns = [
      "లేదు", "కాదు", "లేవు", "లే", "నహీ", "కాదుకాదు",
      // Romanized variations
      "ledu", "ledhu", "kaadu", "kadu", "levu", "le", "nahi", "ledule"
    ];
    
    // Check Telugu exact matches first
    if (teluguYesPatterns.some(p => response === p.toLowerCase() || response.includes(p.toLowerCase()))) {
      console.log("[SymptomAssistant] TELUGU YES MATCH:", response);
      return true;
    }
    if (teluguNoPatterns.some(p => response === p.toLowerCase() || response.includes(p.toLowerCase()))) {
      console.log("[SymptomAssistant] TELUGU NO MATCH:", response);
      return false;
    }
    
    // ================== ENGLISH PATTERNS ==================
    // VERY SHORT responses - likely "yes" or "no" misheard
    if (response.length <= 3) {
      // Check for yes-like sounds
      if (/^(y|ye|yes|ya|yea|s|es|ys)$/i.test(response)) {
        console.log("[SymptomAssistant] SHORT YES MATCH:", response);
        return true;
      }
      // Check for no-like sounds
      if (/^(n|no|na|nah)$/i.test(response)) {
        console.log("[SymptomAssistant] SHORT NO MATCH:", response);
        return false;
      }
    }
    
    // EXACT MATCHES - highest priority
    const exactYes = ["yes", "yeah", "yup", "yep", "ya", "yah", "yea", "ye", "ha", "haan", "avunu", "uh huh", "mm hmm", "sure", "okay", "ok", "yep", "yup"];
    const exactNo = ["no", "nope", "nah", "nahi", "ledu", "kadu", "kaadu", "na", "naa"];
    
    if (exactYes.includes(response)) {
      console.log("[SymptomAssistant] EXACT YES MATCH");
      return true;
    }
    if (exactNo.includes(response)) {
      console.log("[SymptomAssistant] EXACT NO MATCH");
      return false;
    }
    
    // Check if response STARTS WITH yes/no (e.g., "yes please", "no thanks")
    const startsWithYes = /^(yes|yeah|yup|yep|yea|ye|ya|yah|sure|ok|okay|ha|haan|avunu|uh|mm)\b/i.test(response);
    const startsWithNo = /^(no|nope|nah|na|nahi|ledu|kadu|kaadu|not)\b/i.test(response);
    
    if (startsWithYes && !startsWithNo) {
      console.log("[SymptomAssistant] STARTS WITH YES");
      return true;
    }
    if (startsWithNo && !startsWithYes) {
      console.log("[SymptomAssistant] STARTS WITH NO");
      return false;
    }
    
    // Check for yes/no as whole words using word boundary regex
    const yesRegex = /\b(yes|yeah|yup|yep|yea|ye|ya|yah|yass|yess|yesh|sure|okay|ok|correct|right|true|haan|ha|haa|avunu|avaunu|avnu|undi|aye|i do|i did|i have|i am|mm hmm|uh huh|definitely|absolutely|certainly|of course|affirmative)\b/i;
    const noRegex = /\b(no|nope|nah|na|never|negative|wrong|false|nahi|nahin|ledu|ledhu|kadu|kaadu|i don't|i dont|i didn't|not really|none|neither|i do not)\b/i;
    
    const hasYes = yesRegex.test(response);
    const hasNo = noRegex.test(response);
    
    console.log("[SymptomAssistant] Regex hasYes:", hasYes, "hasNo:", hasNo);

    // If both match, unclear response
    if (hasYes && hasNo) {
      console.log("[SymptomAssistant] BOTH YES AND NO - UNCLEAR");
      return null;
    }

    if (hasYes) {
      console.log("[SymptomAssistant] YES DETECTED");
      return true;
    }

    if (hasNo) {
      console.log("[SymptomAssistant] NO DETECTED");
      return false;
    }

    // Last resort: check for any affirmative/negative substrings
    const looseYes = ["yes", "yea", "ye", "ok", "sure", "right", "ya"];
    const looseNo = ["no", "not", "na"];
    
    const hasLooseYes = looseYes.some(p => response.includes(p));
    const hasLooseNo = looseNo.some(p => response.includes(p));
    
    if (hasLooseYes && !hasLooseNo) {
      console.log("[SymptomAssistant] LOOSE YES MATCH");
      return true;
    }
    if (hasLooseNo && !hasLooseYes) {
      console.log("[SymptomAssistant] LOOSE NO MATCH");
      return false;
    }

    console.log("[SymptomAssistant] NO MATCH FOUND");
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

      const doSpeak = () => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang;
        utterance.rate = 0.95;

        // Try to find a voice matching the language
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find((v) => v.lang.startsWith(speechLang.slice(0, 2)));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          onEnd?.();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          onEnd?.(); // Fix: call onEnd on error to prevent conversation from getting stuck
        };

        window.speechSynthesis.speak(utterance);
      };

      // Check if voices are loaded (Chrome loads voices asynchronously)
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        // Wait for voices to load
        window.speechSynthesis.onvoiceschanged = () => {
          doSpeak();
          window.speechSynthesis.onvoiceschanged = null;
        };
        // Fallback if onvoiceschanged never fires
        setTimeout(() => {
          if (!window.speechSynthesis.getVoices().length) {
            doSpeak(); // Try anyway
          }
        }, 100);
      }
    },
    [addAssistantMessage, speechLang]
  );

  const askQuestionAndListen = useCallback(
    (text: string) => {
      // Reset retry counter when asking a new question
      retryRef.current = 0;
      setRetryCount(0);
      console.log("[SymptomAssistant] Asking question:", text);
      speak(`${text} ${t("assistant.yesNoInstruction")}`, () => {
        setReadyToListen(true);
      });
    },
    [speak, t]
  );

  const stopConversation = useCallback((nextStage: AssistantStage) => {
    setStage(nextStage);
    stageRef.current = nextStage;
    recognitionRef.current?.stop();
    setIsListening(false);
    setReadyToListen(false);
  }, []);

  // Handle manual button taps for Yes/No
  const handleManualAnswer = useCallback((answer: boolean) => {
    // Stop any ongoing speech recognition
    recognitionRef.current?.stop();
    setIsListening(false);
    setReadyToListen(false);
    
    // Add user message
    addUserMessage(answer ? "Yes" : "No");
    resetRetryCounter();
    
    const currentStage = stageRef.current;
    const currentSymptomIndex = symptomIndexRef.current;
    const currentSymptomAnswers = symptomAnswersRef.current;

    if (currentStage === "safety") {
      if (answer) {
        setScreeningLocked(true);
        stopConversation("locked");
        speak(t("assistant.coldCoughWarning"), () => {
          speak(t("assistant.lockMessage"));
        });
        return;
      }

      setScreeningLocked(false);
      setStage("symptoms");
      stageRef.current = "symptoms";
      setSymptomIndex(0);
      symptomIndexRef.current = 0;
      askQuestionAndListen(t(`assistant.question.${SYMPTOM_QUESTION_KEYS[0]}`));
      return;
    }

    if (currentStage === "symptoms") {
      const currentQuestionKey = SYMPTOM_QUESTION_KEYS[currentSymptomIndex];
      if (!currentQuestionKey) {
        return;
      }

      const newAnswers = {
        ...currentSymptomAnswers,
        [currentQuestionKey]: answer,
      };
      setSymptomAnswers(newAnswers);
      symptomAnswersRef.current = newAnswers;

      const nextIndex = currentSymptomIndex + 1;
      if (nextIndex >= SYMPTOM_QUESTION_KEYS.length) {
        const finalized: SymptomAnswers = {
          fatigue: currentQuestionKey === "fatigue" ? answer : newAnswers.fatigue === true,
          weight_change: currentQuestionKey === "weight_change" ? answer : newAnswers.weight_change === true,
          hair_fall: currentQuestionKey === "hair_fall" ? answer : newAnswers.hair_fall === true,
          temperature_sensitivity: currentQuestionKey === "temperature_sensitivity" ? answer : newAnswers.temperature_sensitivity === true,
          irregular_cycles: currentQuestionKey === "irregular_cycles" ? answer : newAnswers.irregular_cycles === true,
        };

        saveSymptomAnswers(finalized);
        setStage("completed");
        stopConversation("completed");
        navigate("/voice-test", { replace: true });
        return;
      }

      setSymptomIndex(nextIndex);
      symptomIndexRef.current = nextIndex;
      askQuestionAndListen(t(`assistant.question.${SYMPTOM_QUESTION_KEYS[nextIndex]}`));
    }
  }, [addUserMessage, askQuestionAndListen, navigate, speak, stopConversation, t]);

  const handleUnclearResponse = useCallback(() => {
    const nextRetry = retryRef.current + 1;
    retryRef.current = nextRetry;
    setRetryCount(nextRetry);

    if (nextRetry <= MAX_RETRIES) {
      speak(t("assistant.fallbackMessage"), () => {
        setReadyToListen(true);
      });
      return;
    }

    speak(t("assistant.finalUnclearMessage"));
    stopConversation("stopped");
  }, [speak, stopConversation, t]);

  const startListening = useCallback(() => {
    if (!readyToListen || isSpeaking || isListening) {
      return;
    }

    if (stage === "waiting" || stage === "locked" || stage === "stopped" || stage === "completed") {
      return;
    }

    const RecognitionConstructor = getRecognitionConstructor();
    if (!RecognitionConstructor) {
      speak(t("assistant.speechNotSupported"));
      stopConversation("stopped");
      return;
    }

    setReadyToListen(false);

    const recognition = new RecognitionConstructor();
    let hasResult = false;
    recognitionRef.current = recognition;
    recognition.lang = recognitionLang;
    recognition.interimResults = false; // Only final results
    recognition.continuous = false;
    recognition.maxAlternatives = 5; // Get more alternatives for better matching
    
    console.log("[SymptomAssistant] Starting speech recognition, stage:", stageRef.current, "symptomIndex:", symptomIndexRef.current);

    recognition.onresult = (event) => {
      hasResult = true;
      
      // Collect all transcripts from all alternatives
      const alternatives: string[] = [];
      const results = event.results[0];
      
      // Type assertion for speech recognition results
      for (let i = 0; i < results.length; i++) {
        const alt = (results[i] as { transcript: string })?.transcript?.trim();
        if (alt) alternatives.push(alt);
      }
      
      console.log("[SymptomAssistant] Speech recognition alternatives:", alternatives);
      
      const transcript = alternatives[0] || "";
      setRecognizedText(transcript);
      addUserMessage(transcript || "...");

      // Check all alternatives for yes/no
      let answer: boolean | null = null;
      for (const alt of alternatives) {
        console.log("[SymptomAssistant] Checking alternative:", alt);
        answer = detectYesNo(alt);
        if (answer !== null) {
          console.log("[SymptomAssistant] Found answer:", answer, "from alternative:", alt);
          break;
        }
      }
      
      // If no match found, try combining all alternatives
      if (answer === null) {
        const combined = alternatives.join(" ");
        console.log("[SymptomAssistant] Trying combined alternatives:", combined);
        answer = detectYesNo(combined);
      }
      
      console.log("[SymptomAssistant] Final answer:", answer);
      
      if (answer === null) {
        handleUnclearResponse();
        return;
      }

      resetRetryCounter();
      
      // Use refs to get current values (not stale closure values)
      const currentStage = stageRef.current;
      const currentSymptomIndex = symptomIndexRef.current;
      const currentSymptomAnswers = symptomAnswersRef.current;

      if (currentStage === "safety") {
        if (answer) {
          setScreeningLocked(true);
          stopConversation("locked");
          speak(t("assistant.coldCoughWarning"), () => {
            speak(t("assistant.lockMessage"));
          });
          return;
        }

        setScreeningLocked(false);
        setStage("symptoms");
        stageRef.current = "symptoms";
        setSymptomIndex(0);
        symptomIndexRef.current = 0;
        askQuestionAndListen(t(`assistant.question.${SYMPTOM_QUESTION_KEYS[0]}`));
        return;
      }

      if (currentStage === "symptoms") {
        const currentQuestionKey = SYMPTOM_QUESTION_KEYS[currentSymptomIndex];
        if (!currentQuestionKey) {
          return;
        }

        const newAnswers = {
          ...currentSymptomAnswers,
          [currentQuestionKey]: answer,
        };
        setSymptomAnswers(newAnswers);
        symptomAnswersRef.current = newAnswers;

        const nextIndex = currentSymptomIndex + 1;
        if (nextIndex >= SYMPTOM_QUESTION_KEYS.length) {
          const finalized: SymptomAnswers = {
            fatigue: currentQuestionKey === "fatigue" ? answer : newAnswers.fatigue === true,
            weight_change:
              currentQuestionKey === "weight_change" ? answer : newAnswers.weight_change === true,
            hair_fall: currentQuestionKey === "hair_fall" ? answer : newAnswers.hair_fall === true,
            temperature_sensitivity:
              currentQuestionKey === "temperature_sensitivity"
                ? answer
                : newAnswers.temperature_sensitivity === true,
            irregular_cycles:
              currentQuestionKey === "irregular_cycles" ? answer : newAnswers.irregular_cycles === true,
          };

          saveSymptomAnswers(finalized);
          setStage("completed");
          stopConversation("completed");
          navigate("/voice-test", { replace: true });
          return;
        }

        setSymptomIndex(nextIndex);
        symptomIndexRef.current = nextIndex;
        askQuestionAndListen(t(`assistant.question.${SYMPTOM_QUESTION_KEYS[nextIndex]}`));
      }
    };

    recognition.onerror = (event) => {
      console.log("[SymptomAssistant] Recognition error:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        speak(t("assistant.microphoneDenied"));
        stopConversation("stopped");
        return;
      }

      if (event.error === "no-speech") {
        handleUnclearResponse();
        return;
      }

      if (event.error === "aborted") {
        // Recognition was aborted, likely due to new recognition starting
        console.log("[SymptomAssistant] Recognition aborted");
        return;
      }

      speak(t("assistant.unableToRecognize"));
      stopConversation("stopped");
    };

    recognition.onend = () => {
      console.log("[SymptomAssistant] Recognition ended, hasResult:", hasResult);
      setIsListening(false);
      if (!hasResult) {
        console.log("[SymptomAssistant] No result detected, triggering unclear response");
        handleUnclearResponse();
      }
    };

    try {
      setIsListening(true);
      recognition.start();
    } catch {
      setIsListening(false);
      speak(t("assistant.couldNotStart"));
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
    speak,
    stage, // Only used for early return check
    stopConversation,
    t,
  ]);

  const startConversation = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStage("safety");
    stageRef.current = "safety";
    speak(t("assistant.intro"), () => {
      speak(t("assistant.yesNoInstruction"), () => {
        askQuestionAndListen(t("assistant.safetyQuestion"));
      });
    });
  }, [askQuestionAndListen, speak, t]);

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
            <p className="font-semibold text-foreground">{t("assistant.title")}</p>
            <p className="text-sm text-muted-foreground">{t("assistant.subtitle")}</p>
          </div>
          <Volume2 className="w-5 h-5 text-muted-foreground ml-auto" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 h-[65vh] overflow-y-auto space-y-3">
          {stage === "waiting" && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <p className="text-center text-muted-foreground">
                {t("assistant.tapToStart")}
              </p>
              <button
                type="button"
                onClick={startConversation}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
              >
                <Play className="w-5 h-5" />
                {t("assistant.startConversation")}
              </button>
            </div>
          )}
          
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
            <div className="text-xs text-muted-foreground text-center">{t("assistant.recognized")}: {recognizedText}</div>
          )}

          {retryCount > 0 && stage !== "stopped" && stage !== "locked" && (
            <div className="text-xs text-warning text-center">{t("assistant.retry")} {retryCount}/{MAX_RETRIES}</div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isListening ? "bg-success/20 animate-pulse" : "bg-muted"
              }`}
            >
              <Mic className={`w-6 h-6 ${isListening ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <p className="text-sm text-muted-foreground">
              {isListening
                ? t("assistant.listening")
                : isSpeaking
                ? t("assistant.speaking")
                : stage === "waiting"
                ? t("assistant.waiting")
                : stage === "locked"
                ? t("assistant.locked")
                : stage === "stopped"
                ? t("assistant.stopped")
                : "..."}
            </p>
          </div>
          
          {/* Yes/No buttons as fallback when listening or ready to listen */}
          {(stage === "safety" || stage === "symptoms") && !isSpeaking && (
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={() => handleManualAnswer(true)}
                className="px-8 py-3 rounded-xl bg-success text-white font-bold text-lg shadow-md hover:bg-success/90 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleManualAnswer(false)}
                className="px-8 py-3 rounded-xl bg-danger text-white font-bold text-lg shadow-md hover:bg-danger/90 transition-colors"
              >
                No
              </button>
            </div>
          )}
        </div>

        {stage === "locked" && (
          <button
            type="button"
            onClick={() => navigate("/home", { replace: true })}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {t("assistant.returnHome")}
          </button>
        )}

        {stage === "stopped" && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            {t("assistant.tryAgain")}
          </button>
        )}
      </div>
    </div>
  );
};

export default SymptomAssistant;
