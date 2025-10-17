// @ts-nocheck: Supabase type generation issue with relations
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileX,
  AlertTriangle,
  Clock,
  Building2,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Shield,
  CreditCard,
  FileText,
  Home,
  Globe,
  Award,
  UserCheck,
  UserX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AnimatedStatCard } from "@/components/AnimatedStatCard";
import * as XLSX from "xlsx";

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = dayjs().format("YYYY-MM-DD");
      const thirtyDaysFromNow = dayjs().add(30, "day").format("YYYY-MM-DD");
      const sixtyDaysFromNow = dayjs().add(60, "day").format("YYYY-MM-DD");
      const ninetyDaysFromNow = dayjs().add(90, "day").format("YYYY-MM-DD");

      // Get all employees with full details
      const { data: allEmployees } = await supabase
        .from("employees")
        .select(
          "*, companies(name_en, name_ar), departments(name_en, name_ar), jobs(name_en, name_ar)"
        );

      const totalEmployees = allEmployees?.length || 0;

      // Missing documents analysis
      const missingPassports =
        allEmployees?.filter((emp) => !emp.passport_no).length || 0;
      const missingEmiratesId =
        allEmployees?.filter((emp) => !emp.emirates_id).length || 0;
      const missingResidence =
        allEmployees?.filter((emp) => !emp.residence_no).length || 0;
      const missingCard =
        allEmployees?.filter((emp) => !emp.card_no).length || 0;

      // Expired documents
      const expiredPassports =
        allEmployees?.filter(
          (emp) =>
            emp.passport_expiry &&
            dayjs(emp.passport_expiry).isBefore(dayjs(), "day")
        ).length || 0;

      const expiredCards =
        allEmployees?.filter(
          (emp) =>
            emp.card_expiry && dayjs(emp.card_expiry).isBefore(dayjs(), "day")
        ).length || 0;

      const expiredEmiratesId =
        allEmployees?.filter(
          (emp) =>
            emp.emirates_id_expiry &&
            dayjs(emp.emirates_id_expiry).isBefore(dayjs(), "day")
        ).length || 0;

      const expiredResidence =
        allEmployees?.filter(
          (emp) =>
            emp.residence_expiry &&
            dayjs(emp.residence_expiry).isBefore(dayjs(), "day")
        ).length || 0;

      // Expiring soon (within 30 days)
      const expiringSoonPassports =
        allEmployees?.filter(
          (emp) =>
            emp.passport_expiry &&
            dayjs(emp.passport_expiry).isAfter(dayjs(), "day") &&
            dayjs(emp.passport_expiry).isBefore(dayjs().add(30, "day"), "day")
        ).length || 0;

      const expiringSoonCards =
        allEmployees?.filter(
          (emp) =>
            emp.card_expiry &&
            dayjs(emp.card_expiry).isAfter(dayjs(), "day") &&
            dayjs(emp.card_expiry).isBefore(dayjs().add(30, "day"), "day")
        ).length || 0;

      const expiringSoonEmiratesId =
        allEmployees?.filter(
          (emp) =>
            emp.emirates_id_expiry &&
            dayjs(emp.emirates_id_expiry).isAfter(dayjs(), "day") &&
            dayjs(emp.emirates_id_expiry).isBefore(
              dayjs().add(30, "day"),
              "day"
            )
        ).length || 0;

      const expiringSoonResidence =
        allEmployees?.filter(
          (emp) =>
            emp.residence_expiry &&
            dayjs(emp.residence_expiry).isAfter(dayjs(), "day") &&
            dayjs(emp.residence_expiry).isBefore(dayjs().add(30, "day"), "day")
        ).length || 0;

      const totalExpiringDocs =
        expiringSoonPassports +
        expiringSoonCards +
        expiringSoonEmiratesId +
        expiringSoonResidence;

      // Company statistics
      interface CompanyStat {
        name: string;
        count: number;
      }

      const companyStats =
        allEmployees?.reduce((acc: CompanyStat[], emp) => {
          const companyName =
            i18n.language === "ar"
              ? emp.companies?.name_ar || "Unknown"
              : emp.companies?.name_en || "Unknown";
          const existing = acc.find((item) => item.name === companyName);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: companyName, count: 1 });
          }
          return acc;
        }, [] as CompanyStat[]) || [];

      // Department statistics
      const departmentStats =
        allEmployees?.reduce((acc: CompanyStat[], emp) => {
          const deptName =
            i18n.language === "ar"
              ? emp.departments?.name_ar || "Unknown"
              : emp.departments?.name_en || "Unknown";
          const existing = acc.find((item) => item.name === deptName);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: deptName, count: 1 });
          }
          return acc;
        }, [] as CompanyStat[]) || [];

      // Job statistics
      const jobStats =
        allEmployees?.reduce((acc: CompanyStat[], emp) => {
          const jobName =
            i18n.language === "ar"
              ? emp.jobs?.name_ar || "Unknown"
              : emp.jobs?.name_en || "Unknown";
          const existing = acc.find((item) => item.name === jobName);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: jobName, count: 1 });
          }
          return acc;
        }, [] as CompanyStat[]) || [];

      // Nationality statistics
      const nationalityStats =
        allEmployees?.reduce((acc: CompanyStat[], emp) => {
          const nationality = emp.nationality || "Unknown";
          const existing = acc.find((item) => item.name === nationality);
          if (existing) {
            existing.count += 1;
          } else {
            acc.push({ name: nationality, count: 1 });
          }
          return acc;
        }, [] as CompanyStat[]) || [];

      // Document status timeline (next 90 days)
      const documentTimeline = [
        {
          period: "0-30 days",
          passports: expiringSoonPassports,
          cards: expiringSoonCards,
          emiratesId: expiringSoonEmiratesId,
          residence: expiringSoonResidence,
        },
        {
          period: "31-60 days",
          passports:
            allEmployees?.filter(
              (emp) =>
                emp.passport_expiry &&
                dayjs(emp.passport_expiry).isAfter(
                  dayjs().add(30, "day"),
                  "day"
                ) &&
                dayjs(emp.passport_expiry).isBefore(
                  dayjs().add(60, "day"),
                  "day"
                )
            ).length || 0,
          cards:
            allEmployees?.filter(
              (emp) =>
                emp.card_expiry &&
                dayjs(emp.card_expiry).isAfter(dayjs().add(30, "day"), "day") &&
                dayjs(emp.card_expiry).isBefore(dayjs().add(60, "day"), "day")
            ).length || 0,
          emiratesId:
            allEmployees?.filter(
              (emp) =>
                emp.emirates_id_expiry &&
                dayjs(emp.emirates_id_expiry).isAfter(
                  dayjs().add(30, "day"),
                  "day"
                ) &&
                dayjs(emp.emirates_id_expiry).isBefore(
                  dayjs().add(60, "day"),
                  "day"
                )
            ).length || 0,
          residence:
            allEmployees?.filter(
              (emp) =>
                emp.residence_expiry &&
                dayjs(emp.residence_expiry).isAfter(
                  dayjs().add(30, "day"),
                  "day"
                ) &&
                dayjs(emp.residence_expiry).isBefore(
                  dayjs().add(60, "day"),
                  "day"
                )
            ).length || 0,
        },
        {
          period: "61-90 days",
          passports:
            allEmployees?.filter(
              (emp) =>
                emp.passport_expiry &&
                dayjs(emp.passport_expiry).isAfter(
                  dayjs().add(60, "day"),
                  "day"
                ) &&
                dayjs(emp.passport_expiry).isBefore(
                  dayjs().add(90, "day"),
                  "day"
                )
            ).length || 0,
          cards:
            allEmployees?.filter(
              (emp) =>
                emp.card_expiry &&
                dayjs(emp.card_expiry).isAfter(dayjs().add(60, "day"), "day") &&
                dayjs(emp.card_expiry).isBefore(dayjs().add(90, "day"), "day")
            ).length || 0,
          emiratesId:
            allEmployees?.filter(
              (emp) =>
                emp.emirates_id_expiry &&
                dayjs(emp.emirates_id_expiry).isAfter(
                  dayjs().add(60, "day"),
                  "day"
                ) &&
                dayjs(emp.emirates_id_expiry).isBefore(
                  dayjs().add(90, "day"),
                  "day"
                )
            ).length || 0,
          residence:
            allEmployees?.filter(
              (emp) =>
                emp.residence_expiry &&
                dayjs(emp.residence_expiry).isAfter(
                  dayjs().add(60, "day"),
                  "day"
                ) &&
                dayjs(emp.residence_expiry).isBefore(
                  dayjs().add(90, "day"),
                  "day"
                )
            ).length || 0,
        },
      ];

      // Document health score
      const totalDocs = totalEmployees * 4; // 4 document types
      const validDocs =
        totalDocs -
        (missingPassports +
          missingEmiratesId +
          missingResidence +
          missingCard +
          expiredPassports +
          expiredCards +
          expiredEmiratesId +
          expiredResidence);
      const healthScore = Math.round((validDocs / totalDocs) * 100);

      // Critical alerts (employees with multiple expired docs)
      const criticalEmployees =
        allEmployees?.filter((emp) => {
          let expiredCount = 0;
          if (
            emp.passport_expiry &&
            dayjs(emp.passport_expiry).isBefore(dayjs(), "day")
          )
            expiredCount++;
          if (
            emp.card_expiry &&
            dayjs(emp.card_expiry).isBefore(dayjs(), "day")
          )
            expiredCount++;
          if (
            emp.emirates_id_expiry &&
            dayjs(emp.emirates_id_expiry).isBefore(dayjs(), "day")
          )
            expiredCount++;
          if (
            emp.residence_expiry &&
            dayjs(emp.residence_expiry).isBefore(dayjs(), "day")
          )
            expiredCount++;
          return expiredCount >= 2;
        }) || [];

      return {
        totalEmployees,
        missingPassports,
        missingEmiratesId,
        missingResidence,
        missingCard,
        expiredPassports,
        expiredCards,
        expiredEmiratesId,
        expiredResidence,
        expiringSoonPassports,
        expiringSoonCards,
        expiringSoonEmiratesId,
        expiringSoonResidence,
        totalExpiringDocs,
        companyStats: companyStats
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        departmentStats: departmentStats
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        jobStats: jobStats.sort((a, b) => b.count - a.count).slice(0, 10),
        nationalityStats: nationalityStats
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        documentTimeline,
        healthScore,
        criticalEmployees,
      };
    },
  });

  // Export dashboard to Excel
  const exportDashboard = () => {
    if (!stats) return;

    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview
    const overviewData = [
      ["HR Management System Dashboard"],
      ["Generated on", dayjs().format("DD/MM/YYYY HH:mm")],
      [""],
      ["Overview Statistics"],
      ["Total Employees", stats.totalEmployees],
      ["Document Health Score", `${stats.healthScore}%`],
      ["Critical Employees", stats.criticalEmployees?.length || 0],
      [""],
      ["Document Status"],
      ["Expiring Soon (30 days)", stats.totalExpiringDocs],
      ["Expired Passports", stats.expiredPassports],
      ["Expired Cards", stats.expiredCards],
      ["Expired Emirates ID", stats.expiredEmiratesId],
      ["Expired Residence", stats.expiredResidence],
      [""],
      ["Missing Documents"],
      ["Missing Passports", stats.missingPassports],
      ["Missing Cards", stats.missingCard],
      ["Missing Emirates ID", stats.missingEmiratesId],
      ["Missing Residence", stats.missingResidence],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, "Overview");

    // Sheet 2: Company Statistics
    const ws2 = XLSX.utils.json_to_sheet(stats.companyStats);
    XLSX.utils.book_append_sheet(wb, ws2, "Companies");

    // Sheet 3: Department Statistics
    const ws3 = XLSX.utils.json_to_sheet(stats.departmentStats);
    XLSX.utils.book_append_sheet(wb, ws3, "Departments");

    // Sheet 4: Nationality Statistics
    const ws4 = XLSX.utils.json_to_sheet(stats.nationalityStats);
    XLSX.utils.book_append_sheet(wb, ws4, "Nationalities");

    XLSX.writeFile(wb, `Dashboard_Report_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const mainStatCards = [
    {
      title: t("dashboard.totalEmployees"),
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      subtitle: "Total workforce",
      onClick: () => navigate("/employees"),
    },
    {
      title: "Document Health Score",
      value: stats?.healthScore || 0,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      subtitle: "Overall compliance",
    },
    {
      title: "Critical Alerts",
      value: stats?.criticalEmployees?.length || 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      subtitle: "Multiple expired docs",
    },
    {
      title: "Expiring Soon",
      value: stats?.totalExpiringDocs || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
      subtitle: "Next 30 days",
    },
  ];

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dayjs().format("dddd, MMMM D, YYYY")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportDashboard} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStatCards.map((stat) => (
          <AnimatedStatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Critical Alerts */}
      {stats?.criticalEmployees && stats.criticalEmployees.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Critical Alerts - Immediate Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.criticalEmployees.slice(0, 5).map((emp: any) => (
                <div
                  key={emp.id}
                  className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {i18n.language === "ar" ? emp.name_ar : emp.name_en}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {emp.employee_no} • {emp.companies?.name_en}
                    </p>
                  </div>
                  <Badge variant="destructive">Multiple Expired Docs</Badge>
                </div>
              ))}
              {stats.criticalEmployees.length > 5 && (
                <Button
                  variant="link"
                  onClick={() => navigate("/employees")}
                  className="text-red-600"
                >
                  View all {stats.criticalEmployees.length} critical employees →
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Passports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expiring Soon
              </span>
              <span className="font-semibold text-yellow-600">
                {stats?.expiringSoonPassports || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expired</span>
              <span className="font-semibold text-red-600">
                {stats?.expiredPassports || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Missing</span>
              <span className="font-semibold text-gray-600">
                {stats?.missingPassports || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Work Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expiring Soon
              </span>
              <span className="font-semibold text-yellow-600">
                {stats?.expiringSoonCards || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expired</span>
              <span className="font-semibold text-red-600">
                {stats?.expiredCards || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Missing</span>
              <span className="font-semibold text-gray-600">
                {stats?.missingCard || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              Emirates ID
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expiring Soon
              </span>
              <span className="font-semibold text-yellow-600">
                {stats?.expiringSoonEmiratesId || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expired</span>
              <span className="font-semibold text-red-600">
                {stats?.expiredEmiratesId || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Missing</span>
              <span className="font-semibold text-gray-600">
                {stats?.missingEmiratesId || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Home className="w-4 h-4 text-orange-600" />
              Residence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Expiring Soon
              </span>
              <span className="font-semibold text-yellow-600">
                {stats?.expiringSoonResidence || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Expired</span>
              <span className="font-semibold text-red-600">
                {stats?.expiredResidence || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Missing</span>
              <span className="font-semibold text-gray-600">
                {stats?.missingResidence || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Expiry Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Document Expiry Timeline (Next 90 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.documentTimeline || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="passports" fill="#3b82f6" name="Passports" />
              <Bar dataKey="cards" fill="#10b981" name="Cards" />
              <Bar dataKey="emiratesId" fill="#8b5cf6" name="Emirates ID" />
              <Bar dataKey="residence" fill="#f59e0b" name="Residence" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Employees by Company
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.companyStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Employees by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.departmentStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name} (${entry.count})`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stats?.departmentStats?.map((_: unknown, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Top 10 Nationalities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.nationalityStats || []}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Top 10 Job Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats?.jobStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Document Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                {stats?.healthScore || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Compliance Rate</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.totalExpiringDocs || 0}
              </p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">
                {(stats?.expiredPassports || 0) +
                  (stats?.expiredCards || 0) +
                  (stats?.expiredEmiratesId || 0) +
                  (stats?.expiredResidence || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Expired</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <UserX className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <p className="text-2xl font-bold text-gray-600">
                {(stats?.missingPassports || 0) +
                  (stats?.missingCard || 0) +
                  (stats?.missingEmiratesId || 0) +
                  (stats?.missingResidence || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Missing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}