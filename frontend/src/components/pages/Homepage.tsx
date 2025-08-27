// src/components/Homepage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Clock, Shield } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";
import ImageSlider from "../layout/ImageSlider";
import { useTranslation } from "react-i18next";

const Homepage = () => {
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation(["common", "home", "auth"]);
  usePageTitle(t("common:home"));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full h-screen md:h-auto flex flex-col justify-center   md:justify-start py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl text-secondary xl:text-6xl/none">{t("home:hero.title")}</h1>
                <p className="max-w-[600px] text-secondary md:text-xl">{t("home:hero.description")}</p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                {isAuthenticated ? (
                  <Button asChild size="lg">
                    <Link to="/dashboard">{t("home:hero.dashboardButton")}</Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" asChild size="lg">
                      <Link to="/login">{t("home:hero.getStartedButton")}</Link>
                    </Button>
                    {/* <Button variant="secondary" asChild size="lg">
                      <Link to="/login">{t("auth:login")}</Link>
                    </Button> */}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src="/delivery.png" width="550" height="550" alt={t("home:hero.imageAlt")} className="mx-auto aspect-video overflow-hidden rounded-xl object-cover" />
            </div>
          </div>
        </div>
      </section>
      <ImageSlider />

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-secondary">{t("home:features.title")}</h2>
              <p className="max-w-[900px] text-secondary md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">{t("home:features.description")}</p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 py-12">
            <Card>
              <CardHeader>
                <Truck className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">{t("home:features.fastDelivery.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{t("home:features.fastDelivery.description")}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">{t("home:features.realTimeTracking.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{t("home:features.realTimeTracking.description")}</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mx-auto" />
                <CardTitle className="text-center">{t("home:features.secureHandling.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{t("home:features.secureHandling.description")}</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("home:cta.title")}</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">{t("home:cta.description")}</p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {!isAuthenticated && (
                <Button asChild size="lg">
                  <Link to="/register">{t("home:cta.signUpButton")}</Link>
                </Button>
              )}
              <Button variant="outline" asChild size="lg">
                <Link to="/contact">{t("navigation:contact")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
