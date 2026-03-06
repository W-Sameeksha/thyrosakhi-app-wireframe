import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import ScreeningLockedNotice from "@/components/ScreeningLockedNotice";
import { isScreeningLocked } from "@/lib/screeningLock";

type RiskDietLevel = "low" | "moderate" | "high";

type FoodRecommendation = {
  name: string;
  icon: string;
  allergens?: string[];
};

const DEFAULT_FOOD_ICON = "https://img.icons8.com/color/48/healthy-food.png";

const thyroidDietRecommendations: Record<RiskDietLevel, { title: string; foods: FoodRecommendation[] }> = {
  low: {
    title: "Maintain Healthy Thyroid Function",
    foods: [
      { name: "Eggs", icon: "https://img.icons8.com/color/48/egg.png", allergens: ["Egg"] },
      { name: "Milk", icon: "https://img.icons8.com/color/48/milk.png", allergens: ["Dairy"] },
      { name: "Whole grains", icon: "https://img.icons8.com/color/48/wheat.png", allergens: ["Gluten"] },
      { name: "Fresh fruits", icon: "https://img.icons8.com/color/48/apple.png" },
    ],
  },
  moderate: {
    title: "Support Thyroid Health",
    foods: [
      { name: "Brazil nuts", icon: "https://img.icons8.com/color/48/nuts.png", allergens: ["Nuts"] },
      { name: "Sunflower seeds", icon: "https://img.icons8.com/color/48/sunflower.png" },
      { name: "Pumpkin seeds", icon: "https://img.icons8.com/color/48/pumpkin.png" },
      { name: "Walnuts", icon: "https://img.icons8.com/color/48/walnut.png", allergens: ["Nuts"] },
    ],
  },
  high: {
    title: "Possible Thyroid Risk Detected",
    foods: [
      { name: "Leafy greens", icon: "https://img.icons8.com/color/48/lettuce.png" },
      { name: "Berries", icon: "https://img.icons8.com/color/48/blueberries.png" },
      { name: "Oats", icon: "https://img.icons8.com/color/48/oats.png", allergens: ["Gluten"] },
      { name: "Fish", icon: "https://img.icons8.com/color/48/fish-food.png", allergens: ["Fish"] },
    ],
  },
};

const ALLERGY_OPTIONS = ["Nuts", "Dairy", "Egg", "Fish", "Gluten"];

const iconForRecommendation = (recommendation: string): string => {
  const text = recommendation.toLowerCase();

  if (text.includes("egg")) return "https://img.icons8.com/color/48/egg.png";
  if (text.includes("milk") || text.includes("dairy")) return "https://img.icons8.com/color/48/milk.png";
  if (text.includes("fish")) return "https://img.icons8.com/color/48/fish-food.png";
  if (text.includes("seed")) return "https://img.icons8.com/color/48/sunflower.png";
  if (text.includes("nut")) return "https://img.icons8.com/color/48/nuts.png";
  if (text.includes("fruit")) return "https://img.icons8.com/color/48/apple.png";

  return DEFAULT_FOOD_ICON;
};

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
  const location = useLocation();
  const screeningLocked = isScreeningLocked();
  const dos = language === "te" ? dosTE : dosEN;
  const donts = language === "te" ? dontsTE : dontsEN;
  const routeState = (location.state as { dietaryRecommendations?: string[]; riskLevel?: string } | null) ?? null;
  const dietaryRecommendations = routeState?.dietaryRecommendations ?? [];
  const requestedRiskLevel = routeState?.riskLevel;
  const normalizedRiskLevel: RiskDietLevel | null =
    requestedRiskLevel === "low"
      ? "low"
      : requestedRiskLevel === "high"
        ? "high"
        : requestedRiskLevel === "medium" || requestedRiskLevel === "moderate"
          ? "moderate"
          : null;

  const riskBasedDiet = normalizedRiskLevel ? thyroidDietRecommendations[normalizedRiskLevel] : null;
  const fallbackFoods: FoodRecommendation[] = dietaryRecommendations.map((recommendation) => ({
    name: recommendation,
    icon: iconForRecommendation(recommendation),
  }));
  const activeTitle = riskBasedDiet?.title;
  const activeFoods = riskBasedDiet?.foods ?? fallbackFoods;
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((previous) =>
      previous.includes(allergy)
        ? previous.filter((item) => item !== allergy)
        : [...previous, allergy]
    );
  };

  const filteredFoods = activeFoods.filter(
    (food) => !(food.allergens ?? []).some((allergen) => selectedAllergies.includes(allergen))
  );

  const handleFoodIconError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    if (image.src !== DEFAULT_FOOD_ICON) {
      image.src = DEFAULT_FOOD_ICON;
    }
  };

  if (screeningLocked) {
    return <ScreeningLockedNotice />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader titleKey="diet.title" />
      <div className="px-5 pt-4 space-y-6">
        <section className="bg-card p-4 rounded-2xl border border-border space-y-3">
          <p className="text-sm font-semibold text-foreground">{t("diet.allergyPreferences")}</p>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map((allergy) => {
              const selected = selectedAllergies.includes(allergy);
              return (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => toggleAllergy(allergy)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground border-border"
                  }`}
                >
                  {allergy}
                </button>
              );
            })}
          </div>
        </section>

        {activeFoods.length > 0 && (
          <section className="bg-primary/5 p-4 rounded-2xl space-y-3">
            {activeTitle && <p className="text-sm text-foreground font-semibold">{activeTitle}</p>}
            <ul className="space-y-2">
              {filteredFoods.map((food, index) => (
                <li key={`${food.name}-${index}`} className="flex items-center gap-2 text-sm text-foreground my-2">
                  <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  <img
                    src={food.icon}
                    alt={food.name}
                    className="w-7 h-7 shrink-0"
                    loading="lazy"
                    onError={handleFoodIconError}
                  />
                  <span>{food.name}</span>
                </li>
              ))}
            </ul>
            {filteredFoods.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("diet.noMatchingFoods")}</p>
            )}
          </section>
        )}

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
