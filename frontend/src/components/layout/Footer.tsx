// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation(["common", "navigation", "footer"]);

  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">{t("common:header.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("footer:description")}</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t("footer:services.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/services" className="hover:text-primary">
                  {t("footer:services.allServices")}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-primary">
                  {t("footer:services.pricing")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary">
                  {t("footer:services.expressDelivery")}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-primary">
                  {t("footer:services.parcelTracking")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t("footer:company.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/contact" className="hover:text-primary">
                  {t("navigation:contact")}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary">
                  {t("navigation:about")}
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-primary">
                  {t("footer:company.careers")}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary">
                  {t("footer:company.blog")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t("footer:legal.title")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/terms" className="hover:text-primary">
                  {t("footer:legal.terms")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary">
                  {t("footer:legal.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-primary">
                  {t("footer:legal.cookies")}
                </Link>
              </li>
              <li>
                <Link to="/security" className="hover:text-primary">
                  {t("footer:legal.security")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t("footer:copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
