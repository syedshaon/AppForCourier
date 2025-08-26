// src/components/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Home, ArrowLeft, Search, Mail } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation("notFound");
  usePageTitle(t("pageTitle"));

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-orange-500">{t("title")}</h1>
          <h2 className="text-3xl font-bold mb-4 text-orange-900">{t("heading")}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("description")}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-6 w-6" />
                {t("reasonsTitle")}
              </CardTitle>
              <CardDescription>{t("reasonsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                {(t("reasons", { returnObjects: true }) as string[]).map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-6 w-6" />
                {t("helpTitle")}
              </CardTitle>
              <CardDescription>{t("helpDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">{t("helpText")}</p>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/contact">{t("contactSupport")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              {t("goHome")}
            </Link>
          </Button>

          <Button variant="default" className="border border-b-primary gap-2" asChild>
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              {t("goBack")}
            </Link>
          </Button>
        </div>

        {/* Quick links section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-secondary text-center mb-6">{t("popularPages")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/services">{t("services")}</Link>
            </Button>
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/pricing">{t("pricing")}</Link>
            </Button>
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/contact">{t("contact")}</Link>
            </Button>
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/login">{t("login")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
