import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";
import ScreeningLockedNotice from "@/components/ScreeningLockedNotice";
import { isScreeningLocked } from "@/lib/screeningLock";

type NeckAnalysisResult = {
  neck_score: number;
  swelling_level: string;
  message: string;
};

const Processing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const screeningLocked = isScreeningLocked();
  const neckAnalysis = (location.state as { neckAnalysis?: NeckAnalysisResult } | null)?.neckAnalysis;

  useEffect(() => {
    if (screeningLocked) {
      return;
    }

    const timer = setTimeout(
      () =>
        navigate("/risk-score", {
          replace: true,
          state: neckAnalysis ? { neckAnalysis } : undefined,
        }),
      3000
    );
    return () => clearTimeout(timer);
  }, [navigate, neckAnalysis, screeningLocked]);

  if (screeningLocked) {
    return <ScreeningLockedNotice />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 gap-8">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
      >
        <Heart className="w-12 h-12 text-primary" fill="currentColor" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">{t("processing.title")}</h2>
        <p className="text-muted-foreground text-body">{t("processing.subtitle")}</p>
      </div>

      {neckAnalysis && (
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-4 text-sm space-y-2">
          <p className="font-semibold text-foreground">Neck Scan Result</p>
          <p className="text-muted-foreground">{neckAnalysis.message}</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <p className="text-muted-foreground">Neck Score</p>
            <p className="text-right font-medium text-foreground">{neckAnalysis.neck_score}</p>
            <p className="text-muted-foreground">Swelling Level</p>
            <p className="text-right font-medium text-foreground capitalize">{neckAnalysis.swelling_level}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.3 }}
            className="w-3 h-3 rounded-full bg-primary"
          />
        ))}
      </div>
    </div>
  );
};

export default Processing;
