import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Minus, TrendingDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { getHistory, clearHistory, HistoryEntry } from "@/lib/screeningLock";

type TrendType = "improving" | "stable" | "declining";

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

// Calculate trend based on previous entry
const calculateTrend = (currentScore: number, previousScore: number | null): TrendType => {
  if (previousScore === null) return "stable";
  const diff = currentScore - previousScore;
  if (diff > 5) return "improving";
  if (diff < -5) return "declining";
  return "stable";
};

const History = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const data = getHistory();
    setHistoryData(data);
  }, []);

  const handleClearHistory = () => {
    if (window.confirm(t("history.confirmClear"))) {
      clearHistory();
      setHistoryData([]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="history.title" showBack={false} />
      <div className="px-5 pt-4 space-y-4">
        {historyData.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-body">
            {t("history.noData")}
          </div>
        ) : (
          <>
            {historyData.map((entry, i) => {
              const previousScore = i < historyData.length - 1 ? historyData[i + 1].score : null;
              const trend = calculateTrend(entry.score, previousScore);
              const TrendIcon = trendIcons[trend];
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
                    <p className="font-semibold text-foreground">
                      {new Date(entry.date).toLocaleDateString()} - {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span>{t(`history.${trend}`)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`history.risk.${entry.riskLevel}`)}
                    </p>
                  </div>
                </div>
              );
            })}

            <Button
              size="lg"
              variant="outline"
              onClick={handleClearHistory}
              className="w-full rounded-2xl py-4 text-base font-semibold text-danger border-danger/30 hover:bg-danger/10 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              {t("history.clearHistory")}
            </Button>
          </>
        )}

        <Button
          size="lg"
          onClick={() => navigate("/symptom-assistant")}
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
