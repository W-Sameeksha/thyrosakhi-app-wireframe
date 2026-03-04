import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SymptomChatbot from "@/components/SymptomChatbot";

const MAX_RECORD_SECONDS = 10;
const ANALYSIS_TIMEOUT_MS = 120000;

type VoiceAnalysisResponse = {
  average_pitch: number;
  pitch_variation: number;
  energy: number;
  duration: number;
  risk_score: number;
  risk_level: string;
  dietary_recommendations?: string[];
};

const writeString = (view: DataView, offset: number, value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
};

const floatTo16BitPCM = (view: DataView, offset: number, input: Float32Array) => {
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }
};

const encodeWav = (samples: Float32Array, sampleRate: number): Blob => {
  const bytesPerSample = 2;
  const channels = 1;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * bytesPerSample, true);
  view.setUint16(32, channels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);
  floatTo16BitPCM(view, 44, samples);

  return new Blob([view], { type: "audio/wav" });
};

const convertBlobToWav = async (blob: Blob): Promise<Blob> => {
  const audioContext = new AudioContext();
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    return encodeWav(channelData, audioBuffer.sampleRate);
  } finally {
    await audioContext.close();
  }
};

const VoiceTest = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(MAX_RECORD_SECONDS);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysisResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isVoiceAnalysisEnabled, setIsVoiceAnalysisEnabled] = useState(true);

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const coordinatesRef = useRef<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  const getUserCoordinates = useCallback(async () => {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser.");
    }

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (error.code === 1) {
            reject(new Error("Location permission denied. Please allow location access."));
            return;
          }

          reject(new Error("Unable to get your location. Please try again."));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const analyzeVoice = useCallback(
    async (wavBlob: Blob) => {
      setAnalyzing(true);
      setErrorText(null);

      try {
        const formData = new FormData();
        formData.append("file", wavBlob, "voice.wav");
        formData.append("latitude", String(coordinatesRef.current.latitude));
        formData.append("longitude", String(coordinatesRef.current.longitude));

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), ANALYSIS_TIMEOUT_MS);
        let response: Response;
        try {
          response = await fetch("http://localhost:5000/analyze-voice", {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timeoutId);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? "Failed to analyze voice");
        }

        const analysisData = data as VoiceAnalysisResponse;
        setAnalysisResult(analysisData);

        if (analysisData.dietary_recommendations?.length) {
          navigate("/diet", {
            state: {
              dietaryRecommendations: analysisData.dietary_recommendations,
            },
          });
        }
      } catch (error) {
        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? "Analysis timed out. Please try again."
            : error instanceof Error
            ? error.message
            : "Analysis failed";
        setErrorText(message);
      } finally {
        setAnalyzing(false);
      }
    },
    [navigate]
  );

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    setErrorText(null);
    setAnalysisResult(null);
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const recordedBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const wavBlob = await convertBlobToWav(recordedBlob);
      await analyzeVoice(wavBlob);
      audioChunksRef.current = [];
    };

    mediaRecorder.start();
    setRecording(true);
    setTimeLeft(MAX_RECORD_SECONDS);
  }, [analyzeVoice]);

  const handleMicClick = useCallback(async () => {
    if (!isVoiceAnalysisEnabled) {
      setErrorText(
        "Voice analysis is disabled while cold or cough symptoms are present. Please return once symptoms resolve."
      );
      return;
    }

    if (recording) {
      stopRecording();
      return;
    }

    try {
      const coords = await getUserCoordinates();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      coordinatesRef.current = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      await startRecording();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to access location or microphone. Please allow required permissions.";
      setErrorText(message);
    }
  }, [recording, startRecording, stopRecording, getUserCoordinates, isVoiceAnalysisEnabled]);

  useEffect(() => {
    if (!recording) return;
    if (timeLeft <= 0) {
      stopRecording();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [recording, timeLeft, stopRecording]);

  useEffect(
    () => () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    },
    []
  );

  const circumference = 2 * Math.PI * 44;
  const progress = ((MAX_RECORD_SECONDS - timeLeft) / MAX_RECORD_SECONDS) * circumference;
  const riskLevelKey = analysisResult?.risk_level?.toLowerCase();
  const riskLevelColor =
    riskLevelKey === "low"
      ? "text-success bg-success/10"
      : riskLevelKey === "moderate"
      ? "text-warning bg-warning/10"
      : "text-danger bg-danger/10";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="voice.title" />
      <div className="flex flex-col items-center px-6 pt-8 gap-8">
        <div className="bg-muted rounded-2xl p-6 max-w-sm text-center">
          <p className="text-muted-foreground text-body mb-3">{t("voice.instruction")}</p>
          <p className="text-foreground text-xl font-semibold leading-relaxed">
            "{t("voice.sentence")}"
          </p>
        </div>

        <SymptomChatbot onAnalysisAvailabilityChange={setIsVoiceAnalysisEnabled} />

        <div className="relative flex items-center justify-center">
          {/* Timer ring */}
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            {recording && (
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                className="transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          {/* Mic button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleMicClick}
            disabled={analyzing || !isVoiceAnalysisEnabled}
            className={`absolute w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              recording
                ? "bg-danger text-danger-foreground"
                : isVoiceAnalysisEnabled
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Mic className="w-10 h-10" />
          </motion.button>

          {/* Pulse animation */}
          {recording && (
            <div className="absolute w-24 h-24 rounded-full bg-danger/30 animate-pulse-ring" />
          )}
        </div>

        {recording ? (
          <p className="text-foreground font-semibold text-xl">
            {timeLeft} {t("voice.timeLeft")}
          </p>
        ) : analyzing ? (
          <p className="text-foreground font-semibold text-xl">Analyzing voice... this may take a moment.</p>
        ) : !isVoiceAnalysisEnabled ? (
          <p className="text-warning text-body text-center max-w-sm">
            Voice analysis is disabled because cold/cough was reported.
          </p>
        ) : (
          <p className="text-muted-foreground text-body">{t("voice.tapToRecord")}</p>
        )}

        {analysisResult && (
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground text-center">Risk Level</p>
            <p className={`text-2xl font-bold text-center mb-3 rounded-lg py-1 ${riskLevelColor}`}>
              {analysisResult.risk_level}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-muted-foreground">Risk Score</p>
              <p className="text-right font-medium">{analysisResult.risk_score}</p>
              <p className="text-muted-foreground">Average Pitch</p>
              <p className="text-right font-medium">{analysisResult.average_pitch} Hz</p>
              <p className="text-muted-foreground">Pitch Variation</p>
              <p className="text-right font-medium">{analysisResult.pitch_variation}</p>
              <p className="text-muted-foreground">Energy</p>
              <p className="text-right font-medium">{analysisResult.energy}</p>
              <p className="text-muted-foreground">Duration</p>
              <p className="text-right font-medium">{analysisResult.duration}s</p>
            </div>
          </div>
        )}

        {errorText && (
          <div className="w-full max-w-sm rounded-xl bg-danger/10 text-danger p-3 text-sm text-center">
            {errorText}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceTest;
