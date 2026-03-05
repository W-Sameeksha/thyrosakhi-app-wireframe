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
import {
  Mic,
  Activity,
  User,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Download,
  MapPin,
  Utensils,
  RotateCcw,
  FileText,
} from "lucide-react";

type RiskLevel = "low" | "medium" | "high";

const getRiskExplanation = (riskLevel: RiskLevel, t: (key: string) => string): string => {
  if (riskLevel === "low") {
    return t("report.explanationLow");
  }
  if (riskLevel === "medium") {
    return t("report.explanationModerate");
  }
  return t("report.explanationHigh");
};

const getRiskBadgeStyles = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case "low":
      return "bg-success/20 text-success border-success/30";
    case "medium":
      return "bg-warning/20 text-warning border-warning/30";
    case "high":
      return "bg-danger/20 text-danger border-danger/30";
  }
};

const getScoreInterpretation = (
  type: "voice" | "symptom" | "neck",
  score: number,
  t: (key: string) => string
): string => {
  if (type === "voice") {
    if (score <= 1) return t("report.voiceLow");
    if (score <= 2) return t("report.voiceModerate");
    return t("report.voiceHigh");
  }
  if (type === "symptom") {
    if (score <= 1) return t("report.symptomLow");
    if (score <= 3) return t("report.symptomModerate");
    return t("report.symptomHigh");
  }
  // neck
  if (score <= 0.15) return t("report.neckLow");
  if (score <= 0.35) return t("report.neckModerate");
  return t("report.neckHigh");
};

const HealthReport = () => {
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
        <PageHeader titleKey="report.title" />
        <div className="px-6 pt-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{t("report.incomplete")}</p>
          <Button className="mt-4" onClick={() => navigate("/home")}>
            {t("report.goBack")}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate scores
  const symptomScore =
    Number(symptomAnswers.fatigue) +
    Number(symptomAnswers.weight_change) +
    Number(symptomAnswers.hair_fall) +
    Number(symptomAnswers.temperature_sensitivity) +
    Number(symptomAnswers.irregular_cycles);

  const voiceScore = Math.min(Math.max(voiceResult.risk_score, 0), 3);
  const neckScore = Math.min(Math.max(neckResult.neck_score ?? 0, 0), 0.5);

  // Calculate final risk
  const normalizedRisk =
    (voiceScore / 3) * 0.4 + (symptomScore / 5) * 0.4 + (neckScore / 0.5) * 0.2;

  const healthScore = Math.round((1 - normalizedRisk) * 100);
  const finalScore = Math.min(100, Math.max(0, healthScore));
  const riskLevel: RiskLevel = finalScore >= 70 ? "low" : finalScore >= 40 ? "medium" : "high";

  // Download report as text (simple implementation)
  const handleDownloadReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const reportContent = `
═══════════════════════════════════════════
       THYRO_TRACK HEALTH SUMMARY REPORT
═══════════════════════════════════════════

Date: ${reportDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                ANALYSIS RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎤 VOICE ANALYSIS
   Score: ${voiceScore.toFixed(2)} / 3.00
   Average Pitch: ${voiceResult.average_pitch.toFixed(2)} Hz
   Pitch Variation: ${voiceResult.pitch_variation.toFixed(2)}
   Energy: ${voiceResult.energy.toFixed(4)}
   Status: ${getScoreInterpretation("voice", voiceScore, t)}

🧠 SYMPTOM ANALYSIS
   Score: ${symptomScore} / 5
   Fatigue: ${symptomAnswers.fatigue ? "Yes" : "No"}
   Weight Change: ${symptomAnswers.weight_change ? "Yes" : "No"}
   Hair Fall: ${symptomAnswers.hair_fall ? "Yes" : "No"}
   Temperature Sensitivity: ${symptomAnswers.temperature_sensitivity ? "Yes" : "No"}
   Irregular Cycles: ${symptomAnswers.irregular_cycles ? "Yes" : "No"}
   Status: ${getScoreInterpretation("symptom", symptomScore, t)}

🧍 NECK SCAN ANALYSIS
   Score: ${neckScore.toFixed(2)} / 0.50
   Swelling Level: ${neckResult.swelling_level}
   Status: ${getScoreInterpretation("neck", neckScore, t)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              FINAL ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Health Score: ${finalScore} / 100
Risk Level: ${riskLevel.toUpperCase()}

${getRiskExplanation(riskLevel, t)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${riskLevel === "low" ? "• Continue maintaining a healthy lifestyle\n• Regular exercise and balanced diet\n• Periodic health checkups" : ""}
${riskLevel === "medium" ? "• Monitor your symptoms regularly\n• Improve dietary habits with iodine-rich foods\n• Consider consulting a healthcare professional" : ""}
${riskLevel === "high" ? "• Consult a healthcare professional immediately\n• Visit a nearby clinic or hospital\n• Follow up with thyroid function tests" : ""}

═══════════════════════════════════════════
      Generated by THYRO_TRACK App
        ${new Date().toLocaleString()}
═══════════════════════════════════════════
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `THYRO_TRACK_Report_${reportDate.replace(/\//g, "-")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const analysisCards = [
    {
      icon: Mic,
      title: t("report.voiceTitle"),
      score: voiceScore,
      maxScore: 3,
      interpretation: getScoreInterpretation("voice", voiceScore, t),
      color: voiceScore <= 1 ? "text-success" : voiceScore <= 2 ? "text-warning" : "text-danger",
      bgColor: voiceScore <= 1 ? "bg-success/10" : voiceScore <= 2 ? "bg-warning/10" : "bg-danger/10",
    },
    {
      icon: Activity,
      title: t("report.symptomTitle"),
      score: symptomScore,
      maxScore: 5,
      interpretation: getScoreInterpretation("symptom", symptomScore, t),
      color: symptomScore <= 1 ? "text-success" : symptomScore <= 3 ? "text-warning" : "text-danger",
      bgColor: symptomScore <= 1 ? "bg-success/10" : symptomScore <= 3 ? "bg-warning/10" : "bg-danger/10",
    },
    {
      icon: User,
      title: t("report.neckTitle"),
      score: neckScore,
      maxScore: 0.5,
      interpretation: getScoreInterpretation("neck", neckScore, t),
      color: neckScore <= 0.15 ? "text-success" : neckScore <= 0.35 ? "text-warning" : "text-danger",
      bgColor: neckScore <= 0.15 ? "bg-success/10" : neckScore <= 0.35 ? "bg-warning/10" : "bg-danger/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <PageHeader titleKey="report.title" />

      <div className="px-5 pt-4 space-y-5">
        {/* Final Risk Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`rounded-2xl border-2 p-5 text-center ${getRiskBadgeStyles(riskLevel)}`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {riskLevel === "low" && <CheckCircle className="w-6 h-6" />}
            {riskLevel === "medium" && <AlertCircle className="w-6 h-6" />}
            {riskLevel === "high" && <AlertTriangle className="w-6 h-6" />}
            <span className="font-bold text-lg">{t("report.finalRisk")}</span>
          </div>
          <p className="text-3xl font-extrabold uppercase">{t(`report.risk${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`)}</p>
          <p className="text-sm mt-1 opacity-80">
            {t("report.healthScore")}: {finalScore}/100
          </p>
        </motion.div>

        {/* AI Explanation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">{t("report.aiAnalysis")}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getRiskExplanation(riskLevel, t)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Analysis Cards */}
        <div className="space-y-3">
          <p className="font-semibold text-foreground">{t("report.detailedResults")}</p>
          {analysisCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 + index * 0.1 }}
              className={`rounded-xl p-4 border border-border ${card.bgColor}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground">{card.title}</p>
                    <span className={`text-sm font-bold ${card.color}`}>
                      {card.score.toFixed(2)} / {card.maxScore.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{card.interpretation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            size="lg"
            className="w-full rounded-xl gap-2"
            onClick={() => navigate("/diet", { state: { riskLevel } })}
          >
            <Utensils className="w-5 h-5" />
            {t("report.viewDiet")}
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full rounded-xl gap-2"
            onClick={() => navigate("/phc-nearby")}
          >
            <MapPin className="w-5 h-5" />
            {t("report.findClinics")}
          </Button>

          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 rounded-xl gap-2"
              onClick={handleDownloadReport}
            >
              <Download className="w-5 h-5" />
              {t("report.download")}
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="flex-1 rounded-xl gap-2"
              onClick={() => {
                // Clear results and restart
                localStorage.removeItem("thyrosakhi_symptom_data");
                localStorage.removeItem("thyrosakhi_voice_result");
                localStorage.removeItem("thyrosakhi_neck_result");
                navigate("/home");
              }}
            >
              <RotateCcw className="w-5 h-5" />
              {t("report.retake")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthReport;
