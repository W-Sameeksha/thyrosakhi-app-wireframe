import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Phone, Navigation, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

const PHCSupport = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="phc.title" />
      <div className="px-5 pt-4 space-y-5">
        {/* Map placeholder */}
        <div className="w-full aspect-video bg-muted rounded-2xl flex items-center justify-center border border-border">
          <div className="text-center text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Map view coming soon</p>
          </div>
        </div>

        {/* PHC Info Card */}
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border space-y-3">
          <h3 className="font-bold text-foreground">District PHC - Warangal</h3>
          <p className="text-sm text-muted-foreground">Main Road, Near Bus Stand, Warangal - 506002</p>
          <div className="flex gap-3">
            <Button size="lg" className="flex-1 rounded-xl gap-2" onClick={() => window.open("https://maps.google.com", "_blank")}>
              <Navigation className="w-5 h-5" />
              {t("phc.directions")}
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => window.open("tel:+911234567890")}>
              <Phone className="w-5 h-5" />
              {t("phc.call")}
            </Button>
          </div>
        </div>

        {/* Free camps */}
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">{t("phc.camps")}</h3>
          </div>
          <p className="text-body text-muted-foreground">{t("phc.campInfo")}</p>
        </div>
      </div>
    </div>
  );
};

export default PHCSupport;
