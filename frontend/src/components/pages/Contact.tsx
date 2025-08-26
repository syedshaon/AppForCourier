// src/components/pages/Contact.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation(["common", "contact"]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setIsLoading(false);
      toast(t("contact:form.successMessage"));
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  usePageTitle(t("navigation:contact"));

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">{t("contact:title")}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("contact:description")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div>
          <Card className="py-14">
            <CardHeader>
              <CardTitle>{t("contact:form.title")}</CardTitle>
              <CardDescription>{t("contact:form.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("contact:form.nameLabel")}</Label>
                  <Input id="name" name="name" placeholder={t("contact:form.namePlaceholder")} required value={formData.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("contact:form.emailLabel")}</Label>
                  <Input id="email" name="email" type="email" placeholder={t("contact:form.emailPlaceholder")} required value={formData.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{t("contact:form.subjectLabel")}</Label>
                  <Input id="subject" name="subject" placeholder={t("contact:form.subjectPlaceholder")} required value={formData.subject} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact:form.messageLabel")}</Label>
                  <Textarea id="message" name="message" placeholder={t("contact:form.messagePlaceholder")} rows={5} required value={formData.message} onChange={handleChange} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    t("contact:form.sending")
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t("contact:form.sendButton")}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold">{t("contact:info.addressTitle")}</h3>
                    <p className="text-muted-foreground">
                      {t("contact:info.addressLine1")}
                      <br />
                      {t("contact:info.addressLine2")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-primary mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold">{t("contact:info.phoneTitle")}</h3>
                    <p className="text-muted-foreground">{t("contact:info.phoneNumber")}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-primary mr-4 mt-1" />
                  <div>
                    <h3 className="font-semibold">{t("contact:info.emailTitle")}</h3>
                    <p className="text-muted-foreground">{t("contact:info.emailAddress")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("contact:emergency.title")}</CardTitle>
              <CardDescription>{t("contact:emergency.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-muted-foreground">{t("contact:emergency.info")}</p>
                <p className="text-lg font-semibold text-primary">{t("contact:emergency.phoneNumber")}</p>
                <p className="text-sm text-muted-foreground">{t("contact:emergency.note")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
