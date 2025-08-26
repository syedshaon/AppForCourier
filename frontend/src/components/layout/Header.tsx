// src/components/layout/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authApi } from "../../services/api";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LangSwitch";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [_isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useTranslation(["common", "auth", "navigation"]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
      toast.success(t("auth:logout.success"));
    } catch (error: any) {
      console.error("Logout API error:", error);
      toast.error(error.response?.data?.message || t("auth:logout.error"));
    } finally {
      logout();
      setIsLoggingOut(false);
      navigate("/");
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const getUserDisplayName = () => {
    if (!user) return t("common:user");
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-3xl">{t("common:header.title")}</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              {isAuthenticated && (
                <>
                  {user?.role === "CUSTOMER" && (
                    <NavigationMenuItem>
                      <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                        {t("navigation:dashboard")}
                      </Link>
                    </NavigationMenuItem>
                  )}
                  {user?.role === "ADMIN" && (
                    <NavigationMenuItem>
                      <Link to="/admin" className="text-sm font-medium transition-colors hover:text-primary">
                        {t("navigation:dashboard")}
                      </Link>
                    </NavigationMenuItem>
                  )}
                  {user?.role === "AGENT" && (
                    <NavigationMenuItem>
                      <Link to="/agent" className="text-sm font-medium transition-colors hover:text-primary">
                        {t("navigation:agentPortal")}
                      </Link>
                    </NavigationMenuItem>
                  )}
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex mr-5 flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center space-x-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/placeholder.jpg" alt={getUserDisplayName()} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{t(`common:roles.${user?.role?.toLowerCase()}`)}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t("navigation:profile")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>{t("auth:logout.button")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">{t("auth:login")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">{t("auth:register")}</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
