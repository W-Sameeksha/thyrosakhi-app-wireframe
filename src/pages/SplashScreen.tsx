import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Heart } from "lucide-react";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      navigate("/language", { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary px-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-24 h-24 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Heart className="w-14 h-14 text-primary-foreground" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-extrabold text-primary-foreground tracking-tight">
          THYRO_TRACK
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-primary-foreground/80 text-center text-body max-w-xs"
        >
          {t("splash.tagline")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
