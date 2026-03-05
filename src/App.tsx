import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SplashScreen from "./pages/SplashScreen";
import LanguageSelection from "./pages/LanguageSelection";
import SymptomAssistant from "./pages/SymptomAssistant";
import Home from "./pages/Home";
import VoiceTest from "./pages/VoiceTest";
import NeckScan from "./pages/NeckScan";
import Processing from "./pages/Processing";
import RiskScore from "./pages/RiskScore";
import DietGuidance from "./pages/DietGuidance";
import PHCSupport from "./pages/PHCSupport";
import FamilyAlert from "./pages/FamilyAlert";
import History from "./pages/History";
import SettingsScreen from "./pages/SettingsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-md mx-auto min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/language" element={<LanguageSelection />} />
              <Route path="/symptom-assistant" element={<SymptomAssistant />} />
              <Route path="/home" element={<Home />} />
              <Route path="/voice-test" element={<VoiceTest />} />
              <Route path="/neck-scan" element={<NeckScan />} />
              <Route path="/processing" element={<Processing />} />
              <Route path="/risk-score" element={<RiskScore />} />
              <Route path="/diet" element={<DietGuidance />} />
              <Route path="/phc" element={<PHCSupport />} />
              <Route path="/family-alert" element={<FamilyAlert />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<SettingsScreen />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
