import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mic, Camera, Salad, MapPin, Activity } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const quickActions = [
  { key: "home.voiceTest", icon: Mic, path: "/voice-test", color: "bg-primary/10 text-primary" },
  { key: "home.neckScan", icon: Camera, path: "/neck-scan", color: "bg-secondary/20 text-secondary-foreground" },
  { key: "home.dietTips", icon: Salad, path: "/diet", color: "bg-success/10 text-success" },
  { key: "home.findPHC", icon: MapPin, path: "/phc", color: "bg-warning/10 text-warning" },
];

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Mock last score
  const lastScore: number | null = 72;
  const scoreColor = lastScore === null ? "" : lastScore >= 70 ? "text-success" : lastScore >= 40 ? "text-warning" : "text-danger";
  const scoreBg = lastScore === null ? "bg-muted" : lastScore >= 70 ? "bg-success/10" : lastScore >= 40 ? "bg-warning/10" : "bg-danger/10";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-8 rounded-b-[2rem]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-primary-foreground/70 text-body">{t("home.welcome")} 👋</p>
          <h1 className="text-2xl font-extrabold text-primary-foreground mt-1">{t("home.greeting")}</h1>
        </motion.div>
      </div>

      <div className="px-5 -mt-5 space-y-5">
        {/* Start Health Check CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/voice-test")}
          className="w-full py-5 bg-secondary text-secondary-foreground rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-3"
        >
          <Activity className="w-7 h-7" />
          {t("home.startCheck")}
        </motion.button>

        {/* Last Score */}
        <div className={`rounded-2xl p-5 ${scoreBg}`}>
          <p className="text-sm font-semibold text-muted-foreground mb-1">{t("home.lastScore")}</p>
          {lastScore !== null ? (
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold ${scoreColor}`}>{lastScore}</span>
              <span className="text-muted-foreground text-sm">/100</span>
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
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl ${action.color} font-semibold text-body transition-shadow hover:shadow-md`}
            >
              <action.icon className="w-8 h-8" />
              <span>{t(action.key)}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
