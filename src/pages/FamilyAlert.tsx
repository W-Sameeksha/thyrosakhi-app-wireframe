import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageSquare } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface Contact {
  name: string;
  phone: string;
}

const FamilyAlert = () => {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const addContact = () => {
    if (name.trim() && phone.trim()) {
      setContacts([...contacts, { name: name.trim(), phone: phone.trim() }]);
      setName("");
      setPhone("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="family.title" />
      <div className="px-5 pt-4 space-y-6">
        {/* Enable toggle */}
        <div className="flex items-center justify-between bg-card rounded-2xl p-5 border border-border">
          <span className="font-semibold text-foreground text-body">{t("family.enable")}</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            {/* Add contact */}
            <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-primary" />
                <h3 className="font-bold">{t("family.addContact")}</h3>
              </div>
              <Input
                placeholder={t("family.name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl h-12 text-body"
              />
              <Input
                placeholder={t("family.phone")}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl h-12 text-body"
              />
              <Button onClick={addContact} className="w-full rounded-xl h-12 font-bold">
                {t("family.save")}
              </Button>
            </div>

            {/* Contacts list */}
            {contacts.map((c, i) => (
              <div key={i} className="bg-muted rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {c.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                </div>
              </div>
            ))}

            {/* Alert preview */}
            <div className="bg-secondary/10 rounded-2xl p-5 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <h3 className="font-bold text-foreground">{t("family.preview")}</h3>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {t("family.sampleMsg", { score: "72" })}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FamilyAlert;
