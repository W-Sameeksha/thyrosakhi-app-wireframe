import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const mockHistory = [
  { date: "2026-02-10", score: 72, trend: "improving" as const },
  { date: "2026-01-28", score: 65, trend: "stable" as const },
  { date: "2026-01-15", score: 63, trend: "declining" as const },
  { date: "2025-12-20", score: 70, trend: "improving" as const },
];

const trendIcons = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

const trendColors = {
  improving: "text-success",
  stable: "text-warning",
  declining: "text-danger",
};

const scoreBg = (score: number) =>
  score >= 70 ? "bg-success" : score >= 40 ? "bg-warning" : "bg-danger";

const History = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="history.title" showBack={false} />
      <div className="px-5 pt-4 space-y-4">
        {mockHistory.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-body">
            {t("history.noData")}
          </div>
        ) : (
          mockHistory.map((entry, i) => {
            const TrendIcon = trendIcons[entry.trend];
            return (
              <div
                key={i}
                className="flex items-center gap-4 bg-card rounded-2xl p-4 border border-border shadow-sm"
              >
                {/* Score badge */}
                <div className={`w-14 h-14 rounded-xl ${scoreBg(entry.score)} flex items-center justify-center`}>
                  <span className="text-xl font-extrabold text-white">{entry.score}</span>
                </div>
                {/* Info */}
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                  <div className={`flex items-center gap-1 text-sm ${trendColors[entry.trend]}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{t(`history.${entry.trend}`)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <Button
          size="lg"
          onClick={() => navigate("/voice-test")}
          className="w-full rounded-2xl py-6 text-lg font-bold mt-4"
        >
          {t("history.recheck")}
        </Button>
      </div>
      <BottomNav />
    </div>
  );
};

export default History;
