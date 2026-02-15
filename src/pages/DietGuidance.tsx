import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";

const dosEN = [
  { food: "🌾 Ragi (Finger Millet)", tip: "Rich in calcium, great for thyroid" },
  { food: "🍃 Curry Leaves", tip: "Boosts immunity naturally" },
  { food: "🥛 Curd / Buttermilk", tip: "Good for digestion and probiotics" },
  { food: "🫘 Millets (Jowar, Bajra)", tip: "Whole grains for steady energy" },
  { food: "🥚 Eggs", tip: "Good source of selenium and iodine" },
  { food: "🐟 Fish", tip: "Omega-3 and iodine support" },
];

const dontsEN = [
  { food: "🥦 Raw Cabbage / Cauliflower", tip: "Can interfere with thyroid — cook them first" },
  { food: "🍟 Deep Fried Foods", tip: "Too much oil slows metabolism" },
  { food: "🥤 Packaged Drinks", tip: "High sugar harms thyroid balance" },
  { food: "🧁 Maida / White Flour", tip: "Choose whole grains instead" },
];

const dosTE = [
  { food: "🌾 రాగి", tip: "కాల్షియం అధికం, థైరాయిడ్‌కు మంచిది" },
  { food: "🍃 కరివేపాకు", tip: "రోగనిరోధక శక్తిని పెంచుతుంది" },
  { food: "🥛 పెరుగు / మజ్జిగ", tip: "జీర్ణక్రియకు మంచిది" },
  { food: "🫘 జొన్నలు / సజ్జలు", tip: "స్థిరమైన శక్తి కోసం" },
  { food: "🥚 గుడ్లు", tip: "సెలీనియం మరియు అయోడిన్ మూలం" },
  { food: "🐟 చేపలు", tip: "ఒమేగా-3 మరియు అయోడిన్ మద్దతు" },
];

const dontsTE = [
  { food: "🥦 పచ్చి క్యాబేజీ / కాలీఫ్లవర్", tip: "థైరాయిడ్‌ను ప్రభావితం చేయవచ్చు — వండి తినండి" },
  { food: "🍟 డీప్ ఫ్రైడ్ ఆహారాలు", tip: "ఎక్కువ నూనె జీవక్రియను నెమ్మదిస్తుంది" },
  { food: "🥤 ప్యాకేజ్డ్ డ్రింక్స్", tip: "ఎక్కువ చక్కెర థైరాయిడ్ బ్యాలెన్స్‌ను దెబ్బతీస్తుంది" },
  { food: "🧁 మైదా", tip: "బదులుగా తృణధాన్యాలు ఎంచుకోండి" },
];

const DietGuidance = () => {
  const { t, language } = useLanguage();
  const dos = language === "te" ? dosTE : dosEN;
  const donts = language === "te" ? dontsTE : dontsEN;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="diet.title" />
      <div className="px-5 pt-4 space-y-6">
        {/* Do's */}
        <section>
          <h2 className="text-lg font-bold text-success mb-3">{t("diet.dos")}</h2>
          <div className="space-y-3">
            {dos.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-success/5 p-4 rounded-2xl">
                <Check className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{item.food}</p>
                  <p className="text-sm text-muted-foreground">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Don'ts */}
        <section>
          <h2 className="text-lg font-bold text-danger mb-3">{t("diet.donts")}</h2>
          <div className="space-y-3">
            {donts.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-danger/5 p-4 rounded-2xl">
                <X className="w-5 h-5 text-danger mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{item.food}</p>
                  <p className="text-sm text-muted-foreground">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
};

export default DietGuidance;
