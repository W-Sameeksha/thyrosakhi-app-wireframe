import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

const LanguageSelection = () => {
  const navigate = useNavigate();
  const { setLanguage, t } = useLanguage();

  const select = (lang: "en" | "te") => {
    setLanguage(lang);
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Languages className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-1">{t("lang.title")}</h1>
        <p className="text-muted-foreground text-body">{t("lang.subtitle")}</p>
      </motion.div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => select("en")}
          className="w-full py-5 px-6 rounded-2xl bg-card border-2 border-primary text-foreground font-bold text-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <span className="text-3xl">🇬🇧</span>
          <span>English</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => select("te")}
          className="w-full py-5 px-6 rounded-2xl bg-card border-2 border-secondary text-foreground font-bold text-xl shadow-md hover:shadow-lg transition-shadow flex items-center gap-4"
        >
          <span className="text-3xl">🇮🇳</span>
          <span>తెలుగు</span>
        </motion.button>
      </div>
    </div>
  );
};

export default LanguageSelection;
