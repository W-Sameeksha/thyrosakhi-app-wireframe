import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Globe, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const SettingsScreen = () => {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="settings.title" showBack={false} />
      <div className="px-5 pt-4 space-y-4">
        {/* Language toggle */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-bold">{t("settings.language")}</h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage("en")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                language === "en"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("te")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                language === "te"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              తెలుగు
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-bold">{t("settings.privacy")}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{t("settings.privacyText")}</p>
        </div>

        {/* Help */}
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-bold">{t("settings.help")}</h3>
          </div>
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2">
              <span className="font-semibold text-sm">{t("settings.faq1q")}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground pl-1 pb-2">{t("settings.faq1a")}</p>
          </details>
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer py-2">
              <span className="font-semibold text-sm">{t("settings.faq2q")}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
            </summary>
            <p className="text-sm text-muted-foreground pl-1 pb-2">{t("settings.faq2a")}</p>
          </details>
        </div>

        {/* Family Alerts link */}
        <button
          onClick={() => navigate("/family-alert")}
          className="w-full bg-card rounded-2xl p-5 border border-border flex items-center justify-between"
        >
          <span className="font-semibold">{t("family.title")}</span>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 py-4 text-danger font-semibold rounded-2xl bg-danger/5 mt-4">
          <LogOut className="w-5 h-5" />
          {t("settings.logout")}
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default SettingsScreen;
