import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface PageHeaderProps {
  titleKey: string;
  showBack?: boolean;
}

const PageHeader = ({ titleKey, showBack = true }: PageHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-xl font-bold">{t(titleKey)}</h1>
    </header>
  );
};

export default PageHeader;
