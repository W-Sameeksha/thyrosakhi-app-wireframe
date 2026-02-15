import { Home, Clock, Salad, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const tabs = [
  { key: "nav.home", icon: Home, path: "/home" },
  { key: "nav.history", icon: Clock, path: "/history" },
  { key: "nav.diet", icon: Salad, path: "/diet" },
  { key: "nav.settings", icon: Settings, path: "/settings" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[64px] ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs font-semibold">{t(tab.key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
