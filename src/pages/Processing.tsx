import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";

const Processing = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/risk-score", { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

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
