import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      // If user is already logged in, go to home; otherwise go to login
      if (isAuthenticated) {
        navigate("/home", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  if (!show) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-400 via-teal-300 to-purple-300 px-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center shadow-xl">
          <span className="text-5xl font-black text-white">T</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
          THYRO-TRACK
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/90 text-center text-body max-w-xs drop-shadow"
        >
          {t("splash.tagline")}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
