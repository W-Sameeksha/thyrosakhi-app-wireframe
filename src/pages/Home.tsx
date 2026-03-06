import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Mic, Camera, Salad, MapPin, Activity, RotateCcw } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { isScreeningLocked, resetScreeningData, getHistory } from "@/lib/screeningLock";

const quickActions = [
  { key: "home.voiceTest", icon: Mic, path: "/voice-test", color: "bg-primary/10 text-primary" },
  { key: "home.neckScan", icon: Camera, path: "/neck-scan", color: "bg-secondary/20 text-secondary-foreground" },
  { key: "home.dietTips", icon: Salad, path: "/diet", color: "bg-success/10 text-success" },
  { key: "home.findPHC", icon: MapPin, path: "/phc", color: "bg-warning/10 text-warning" },
];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const screeningLocked = isScreeningLocked();

  const handleResetScreening = () => {
    resetScreeningData();
    window.location.reload();
  };

  // Get last health score from history
  const history = getHistory();
  const lastScore: number | null = history.length > 0 ? history[0].score : null;
  const lastTestDate = history.length > 0 ? new Date(history[0].date) : null;
  const scoreColor = lastScore === null ? "" : lastScore >= 70 ? "text-success" : lastScore >= 40 ? "text-warning" : "text-danger";
  const scoreBg = lastScore === null ? "bg-muted" : lastScore >= 70 ? "bg-success/10" : lastScore >= 40 ? "bg-warning/10" : "bg-danger/10";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-8 rounded-b-[2rem]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start justify-between">
          <div>
            <p className="text-primary-foreground/70 text-body">
              {t("home.welcome")}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
            </p>
            <h1 className="text-2xl font-extrabold text-primary-foreground mt-1">{t("home.greeting")}</h1>
          </div>
          <div className="bg-white/20 px-3 py-2 rounded-xl">
            <span className="text-sm font-bold text-primary-foreground">THYRO-TRACK</span>
          </div>
        </motion.div>
      </div>

      <div className="px-5 -mt-5 space-y-5">
        {/* Start Health Check CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/symptom-assistant")}
          disabled={screeningLocked}
          className="w-full py-5 bg-secondary text-secondary-foreground rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3"
        >
          <Activity className="w-7 h-7" />
          {t("home.startCheck")}
        </motion.button>

        {screeningLocked && (
          <p className="text-sm text-warning text-center bg-warning/10 rounded-xl p-3">
            {t("home.coldWarning")}
          </p>
        )}

        {/* Last Score */}
        <div className={`rounded-2xl p-5 ${scoreBg}`}>
          <p className="text-sm font-semibold text-muted-foreground mb-1">{t("home.lastScore")}</p>
          {lastScore !== null ? (
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{lastScore}</span>
                <span className="text-muted-foreground text-sm">/100</span>
              </div>
              {lastTestDate && (
                <span className="text-xs text-muted-foreground">
                  {lastTestDate.toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-body">{t("home.noScore")}</p>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.key === "home.voiceTest" ? "/symptom-assistant" : action.path)}
              disabled={
                screeningLocked &&
                ["home.voiceTest", "home.neckScan", "home.dietTips"].includes(action.key)
              }
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl ${action.color} font-semibold text-body transition-shadow hover:shadow-md`}
            >
              <action.icon className="w-8 h-8" />
              <span>{t(action.key)}</span>
            </motion.button>
          ))}
        </div>

        {/* Reset Screening Button */}
        <button
          type="button"
          onClick={handleResetScreening}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t("common.resetScreening")}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
