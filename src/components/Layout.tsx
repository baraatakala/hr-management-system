import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/store/useTheme";
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Layout() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(true);

  // Set initial direction and lang on mount and whenever language changes
  React.useEffect(() => {
    const currentLang = i18n.language || "en";
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
    {
      name: i18n.language === "ar" ? "الجنسيات" : "Nationalities",
      href: "/nationalities",
      icon: Globe,
    },
    { name: t("nav.reminders"), href: "/reminders", icon: Mail },
  ];

  const isRTL = i18n.language === "ar";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
        <h1
          className={`text-lg font-bold text-primary ${
            isRTL ? "mr-4" : "ml-4"
          }`}
        >
          {t("app.title")}
        </h1>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Sidebar - Responsive */}
      <div
        className={`fixed inset-y-0 ${
          isRTL ? "right-0 border-l" : "left-0 border-r"
        } z-50 ${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex flex-col h-full" style={{ pointerEvents: 'auto' }}>
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 relative">
            <h1 className={`text-xl font-bold text-primary ${sidebarCollapsed ? "hidden" : "hidden lg:block"}`}>
              {t("app.title")}
            </h1>
            {sidebarCollapsed && (
              <h1 className="text-xl font-bold text-primary hidden lg:block">
                HR
              </h1>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className={`lg:hidden absolute ${
                isRTL ? "left-4" : "right-4"
              } p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation active:scale-95 transition-transform min-w-[44px] min-h-[44px] flex items-center justify-center`}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop collapse button - Prominent position below header */}
          <div className="hidden lg:block p-2 border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center" : "justify-between"
              } px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors border border-blue-200 dark:border-blue-800`}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {!sidebarCollapsed && <span className="text-xs font-semibold">Collapse</span>}
              {sidebarCollapsed ? (
                isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
              ) : (
                isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center ${
                    sidebarCollapsed ? "justify-center px-2" : "px-4"
                  } py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${sidebarCollapsed ? "" : isRTL ? "ml-3" : "mr-3"}`} />
                  {!sidebarCollapsed && item.name}
                </Link>
              );
            })}
          </nav>

          <div className={`p-4 space-y-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
              } py-3 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11`}
              type="button"
              title={sidebarCollapsed ? (theme === "light" ? t("settings.dark") : t("settings.light")) : undefined}
            >
              {theme === "light" ? (
                <Moon className={`w-4 h-4 ${sidebarCollapsed ? "" : isRTL ? "ml-2" : "mr-2"}`} />
              ) : (
                <Sun className={`w-4 h-4 ${sidebarCollapsed ? "" : isRTL ? "ml-2" : "mr-2"}`} />
              )}
              {!sidebarCollapsed && (theme === "light" ? t("settings.dark") : t("settings.light"))}
            </button>
            <button
              onClick={toggleLanguage}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
              } py-3 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11`}
              type="button"
              title={sidebarCollapsed ? (i18n.language === "en" ? "العربية" : "English") : undefined}
            >
              <Languages className={`w-4 h-4 ${sidebarCollapsed ? "" : isRTL ? "ml-2" : "mr-2"}`} />
              {!sidebarCollapsed && (i18n.language === "en" ? "العربية" : "English")}
            </button>
            <button
              onClick={() => signOut()}
              className={`w-full flex items-center ${
                sidebarCollapsed ? "justify-center px-2" : "justify-start px-4"
              } py-3 text-sm font-medium rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11`}
              type="button"
              title={sidebarCollapsed ? t("auth.logout") : undefined}
            >
              <LogOut className={`w-4 h-4 ${sidebarCollapsed ? "" : isRTL ? "ml-2" : "mr-2"}`} />
              {!sidebarCollapsed && t("auth.logout")}
            </button>
          </div>
        </div>
      </div>

      {/* Main content - Responsive padding */}
      <div
        className={`${
          isRTL 
            ? (sidebarCollapsed ? "lg:pr-16" : "lg:pr-64")
            : (sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")
        } pt-16 lg:pt-0 min-h-screen transition-all duration-300 ease-in-out`}
      >
        <main className="p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
