import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Phone, Mail, ArrowRight, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    email: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    age: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = { name: "", phone: "", age: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = t("login.nameRequired");
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = t("login.nameMinLength");
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("login.phoneRequired");
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = t("login.phoneInvalid");
      isValid = false;
    }

    const ageNum = parseInt(formData.age, 10);
    if (!formData.age.trim()) {
      newErrors.age = t("login.ageRequired");
      isValid = false;
    } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      newErrors.age = t("login.ageInvalid");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    login({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      age: parseInt(formData.age, 10),
      email: formData.email.trim() || undefined,
    });

    setIsSubmitting(false);
    navigate("/language");
  };

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg"
        >
          <span className="text-3xl font-bold text-white">T</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent"
        >
          THYRO-TRACK
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mt-2"
        >
          {t("login.subtitle")}
        </motion.p>
      </div>

      {/* Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex-1 px-6 pb-8"
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 space-y-6">
          <h2 className="text-xl font-semibold text-center text-foreground">
            {t("login.title")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                {t("login.name")} <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t("login.namePlaceholder")}
                  value={formData.name}
                  onChange={handleChange("name")}
                  className={`pl-11 h-12 rounded-xl ${errors.name ? "border-danger" : ""}`}
                />
              </div>
              {errors.name && <p className="text-danger text-sm">{errors.name}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                {t("login.phone")} <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t("login.phonePlaceholder")}
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  maxLength={10}
                  className={`pl-11 h-12 rounded-xl ${errors.phone ? "border-danger" : ""}`}
                />
              </div>
              {errors.phone && <p className="text-danger text-sm">{errors.phone}</p>}
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age" className="text-sm font-medium">
                {t("login.age")} <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="age"
                  type="number"
                  placeholder={t("login.agePlaceholder")}
                  value={formData.age}
                  onChange={handleChange("age")}
                  min={1}
                  max={120}
                  className={`pl-11 h-12 rounded-xl ${errors.age ? "border-danger" : ""}`}
                />
              </div>
              {errors.age && <p className="text-danger text-sm">{errors.age}</p>}
            </div>

            {/* Email Field (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                {t("login.email")} <span className="text-muted-foreground text-xs">({t("login.optional")})</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("login.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange("email")}
                  className="pl-11 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl text-lg font-semibold bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg mt-4"
            >
              {isSubmitting ? (
                <span className="animate-pulse">{t("login.loading")}</span>
              ) : (
                <>
                  {t("login.continue")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Privacy Note */}
          <p className="text-xs text-center text-muted-foreground pt-2">
            {t("login.privacyNote")}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
