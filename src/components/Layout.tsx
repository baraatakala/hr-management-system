import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/store/useTheme";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FolderKanban,
  Globe,
  Mail,
  LogOut,
  Moon,
  Sun,
  Languages,
} from "lucide-react";

export function Layout() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Set initial direction and lang on mount and whenever language changes
  React.useEffect(() => {
    const currentLang = i18n.language || 'en';
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const navigation = [
    { name: t("nav.dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("nav.employees"), href: "/employees", icon: Users },
    { name: t("nav.companies"), href: "/companies", icon: Building2 },
    { name: t("nav.departments"), href: "/departments", icon: FolderKanban },
    { name: t("nav.jobs"), href: "/jobs", icon: Briefcase },
    { name: i18n.language === "ar" ? "الجنسيات" : "Nationalities", href: "/nationalities", icon: Globe },
    { name: t("nav.reminders"), href: "/reminders", icon: Mail },
  ];

  const isRTL = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} z-50 w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-primary">{t("app.title")}</h1>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-full justify-start"
            >
              {theme === "light" ? (
                <Moon className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              ) : (
                <Sun className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              )}
              {theme === "light" ? t("settings.dark") : t("settings.light")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="w-full justify-start"
            >
              <Languages className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {i18n.language === "en" ? "العربية" : "English"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full justify-start"
            >
              <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("auth.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={isRTL ? 'pr-64' : 'pl-64'}>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
