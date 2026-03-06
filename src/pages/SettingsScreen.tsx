import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Globe, Shield, HelpCircle, LogOut, ChevronRight, User, Phone, Mail, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const SettingsScreen = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm(t("settings.logoutConfirm"))) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="settings.title" showBack={false} />
      <div className="px-5 pt-4 space-y-4">
        {/* User Profile Card */}
        {user && (
          <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{user.name}</h3>
                <div className="flex items-center gap-4 text-white/80 text-sm mt-1">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{user.age} {t("settings.years")}</span>
                  </div>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Mail className="w-3 h-3" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 text-danger font-semibold rounded-2xl bg-danger/5 mt-4"
        >
          <LogOut className="w-5 h-5" />
          {t("settings.logout")}
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default SettingsScreen;
