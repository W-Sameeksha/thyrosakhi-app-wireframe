import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

type NeckAnalysisResult = {
  image_result: string;
  symmetry_score: number;
  visible_asymmetry: boolean;
  swelling_flag: boolean;
};

const RiskScore = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const neckAnalysis = (location.state as { neckAnalysis?: NeckAnalysisResult } | null)?.neckAnalysis;

  const score = (() => {
    if (!neckAnalysis) {
      return 72;
    }

    const normalizedFromSymmetry = 100 - Math.round(neckAnalysis.symmetry_score * 2.5);
    const asymmetryPenalty = neckAnalysis.visible_asymmetry ? 20 : 0;
    const swellingPenalty = neckAnalysis.swelling_flag ? 15 : 0;

    const computedScore = normalizedFromSymmetry - asymmetryPenalty - swellingPenalty;
    return Math.min(100, Math.max(0, computedScore));
  })();

  const maxAngle = 180;
  const angle = (score / 100) * maxAngle;

  const riskLevel = score >= 70 ? "low" : score >= 40 ? "medium" : "high";
  const riskColor = riskLevel === "low" ? "text-success" : riskLevel === "medium" ? "text-warning" : "text-danger";

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="risk.title" showBack={false} />
      <div className="flex flex-col items-center px-6 pt-6 gap-6">
        {/* Semicircle gauge */}
        <div className="relative w-64 h-36 overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Green zone */}
            <path
              d="M 10 100 A 90 90 0 0 1 70 18"
              fill="none"
              stroke="hsl(var(--danger))"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 70 18 A 90 90 0 0 1 130 18"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <path
              d="M 130 18 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2={100 + 70 * Math.cos(((180 - angle) * Math.PI) / 180)}
              y2={100 - 70 * Math.sin(((180 - angle) * Math.PI) / 180)}
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="hsl(var(--foreground))" />
          </svg>
        </div>

        {/* Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground font-semibold">{t("risk.score")}</p>
          <span className={`text-6xl font-extrabold ${riskColor}`}>{score}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </motion.div>

        {/* Explanation */}
        <div className={`rounded-2xl p-4 text-center max-w-xs ${
          riskLevel === "low" ? "bg-success/10" : riskLevel === "medium" ? "bg-warning/10" : "bg-danger/10"
        }`}>
          <p className={`font-semibold text-body ${riskColor}`}>
            {t(`risk.${riskLevel}`)}
          </p>
        </div>

        <Button
          size="lg"
          onClick={() => navigate("/diet")}
          className="w-full max-w-xs rounded-2xl py-6 text-lg font-bold"
        >
          {t("risk.nextSteps")}
        </Button>
      </div>
    </div>
  );
};

export default RiskScore;
