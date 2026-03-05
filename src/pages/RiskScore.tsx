import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import ScreeningLockedNotice from "@/components/ScreeningLockedNotice";
import {
  getNeckResult,
  getScreeningCompletion,
  getSymptomAnswers,
  getVoiceResult,
  isScreeningLocked,
} from "@/lib/screeningLock";

const RiskScore = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const screeningLocked = isScreeningLocked();

  if (screeningLocked) {
    return <ScreeningLockedNotice />;
  }

  const completion = getScreeningCompletion();
  const symptomAnswers = getSymptomAnswers();
  const voiceResult = getVoiceResult();
  const neckResult = getNeckResult();

  if (!completion.isComplete || !symptomAnswers || !voiceResult || !neckResult) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader titleKey="risk.title" showBack={false} />
        <div className="px-6 pt-8 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="font-semibold text-foreground mb-2">Complete all tests to view final result</p>
            <ul className="text-sm space-y-2">
              <li className={completion.hasSymptoms ? "text-success" : "text-muted-foreground"}>
                Symptoms Test {completion.hasSymptoms ? "✓" : "✗"}
              </li>
              <li className={completion.hasVoice ? "text-success" : "text-muted-foreground"}>
                Voice Test {completion.hasVoice ? "✓" : "✗"}
              </li>
              <li className={completion.hasNeck ? "text-success" : "text-muted-foreground"}>
                Neck Scan {completion.hasNeck ? "✓" : "✗"}
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {!completion.hasSymptoms && (
              <button
                type="button"
                onClick={() => navigate("/symptom-assistant")}
                className="rounded-xl bg-primary text-primary-foreground py-3 font-semibold"
              >
                Complete Symptoms Test
              </button>
            )}
            {!completion.hasVoice && (
              <button
                type="button"
                onClick={() => navigate("/voice-test")}
                className="rounded-xl bg-primary text-primary-foreground py-3 font-semibold"
              >
                Complete Voice Test
              </button>
            )}
            {!completion.hasNeck && (
              <button
                type="button"
                onClick={() => navigate("/neck-scan")}
                className="rounded-xl bg-primary text-primary-foreground py-3 font-semibold"
              >
                Complete Neck Scan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const score = (() => {
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
    return Math.min(100, Math.max(0, healthScore));
  })();

  const maxAngle = 180;
  const angle = (score / 100) * maxAngle;

  const riskLevel = score >= 70 ? "low" : score >= 40 ? "medium" : "high";
  const riskColor = riskLevel === "low" ? "text-success" : riskLevel === "medium" ? "text-warning" : "text-danger";

  // Automatically redirect to PHC nearby page when risk is high
  useEffect(() => {
    if (riskLevel === "high") {
      const timer = setTimeout(() => {
        navigate("/phc-nearby", { replace: true });
      }, 3000); // Show result for 3 seconds before redirecting
      return () => clearTimeout(timer);
    }
  }, [riskLevel, navigate]);

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
          onClick={() =>
            navigate("/health-report", {
              state: { riskLevel },
            })
          }
          className="w-full max-w-xs rounded-2xl py-6 text-lg font-bold"
        >
          {t("risk.nextSteps")}
        </Button>
      </div>
    </div>
  );
};

export default RiskScore;
