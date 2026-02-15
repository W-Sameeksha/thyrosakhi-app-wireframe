import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Camera, Zap, ZapOff, CheckCircle, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

const NeckScan = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [flash, setFlash] = useState(false);
  const [captured, setCaptured] = useState(false);

  const handleCapture = () => {
    setCaptured(true);
    setTimeout(() => navigate("/processing"), 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="neck.title" />
      <div className="flex flex-col items-center px-6 pt-4 gap-5">
        {/* Camera preview placeholder */}
        <div className="relative w-full max-w-sm aspect-[3/4] bg-foreground/5 rounded-2xl overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground/30" />
          </div>
          {/* Chin-up guide overlay */}
          <div className="absolute inset-x-8 top-1/4 bottom-1/3 border-2 border-primary/40 rounded-3xl flex items-end justify-center pb-4">
            <p className="text-primary text-sm font-semibold bg-background/80 px-3 py-1 rounded-full">
              {t("neck.chinUp")} ↑
            </p>
          </div>
        </div>

        {/* Flash toggle */}
        <button
          onClick={() => setFlash(!flash)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-muted-foreground font-semibold text-sm"
        >
          {flash ? <Zap className="w-5 h-5 text-warning" /> : <ZapOff className="w-5 h-5" />}
          {t("neck.flash")} {flash ? "ON" : "OFF"}
        </button>

        {/* Quality indicator */}
        {captured ? (
          <div className="flex items-center gap-2 text-success font-semibold">
            <CheckCircle className="w-5 h-5" />
            {t("neck.quality.good")}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <AlertCircle className="w-4 h-4" />
            {t("neck.instruction")}
          </div>
        )}

        {/* Capture button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleCapture}
          disabled={captured}
          className="w-20 h-20 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center border-4 border-primary-foreground/20"
        >
          <div className="w-14 h-14 rounded-full border-2 border-primary-foreground" />
        </motion.button>
        <p className="text-muted-foreground text-sm">{t("neck.capture")}</p>
      </div>
    </div>
  );
};

export default NeckScan;
