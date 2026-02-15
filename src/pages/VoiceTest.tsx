import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const VoiceTest = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);

  const startRecording = useCallback(() => {
    setRecording(true);
    setTimeLeft(10);
  }, []);

  useEffect(() => {
    if (!recording) return;
    if (timeLeft <= 0) {
      setRecording(false);
      navigate("/processing");
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [recording, timeLeft, navigate]);

  const circumference = 2 * Math.PI * 44;
  const progress = ((10 - timeLeft) / 10) * circumference;

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
            onClick={startRecording}
            disabled={recording}
            className={`absolute w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              recording
                ? "bg-danger text-danger-foreground"
                : "bg-primary text-primary-foreground"
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
        ) : (
          <p className="text-muted-foreground text-body">{t("voice.tapToRecord")}</p>
        )}
      </div>
    </div>
  );
};

export default VoiceTest;
