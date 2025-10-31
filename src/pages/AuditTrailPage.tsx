import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Filter,
  X,
  FileText,
  Shield,
  Calendar,
  User,
  Edit,
  Trash,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Activity,
  TrendingUp,
} from "lucide-react";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
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
  AreaChart,
  Area,
} from "recharts";

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  user_email: string;
  user_id: string;
  employee_id: string;
  employee_no: string;
  name_en: string;
  name_ar: string;
  details: any;
  old_values: any;
  new_values: any;
  ip_address: string;
}

export function AuditTrailPage() {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("30days");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Charts visibility
  const [showCharts, setShowCharts] = useState(false);

  // Fetch reference data for resolving IDs to names
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data || [];
    },
  });

  // Helper function to resolve ID to name
  const resolveIdToName = (field: string, value: any): string => {
    if (value === null || value === undefined) return "(empty)";
    
    // Check if it's a UUID (looks like: 88f8619d-1bfc-45b5-9529-f47b5ce11a45)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (typeof value === "string" && uuidPattern.test(value)) {
      if (field === "company_id") {
        const company = companies.find((c) => c.id === value);
        return company ? (i18n.language === "ar" ? company.name_ar : company.name_en) : value;
      } else if (field === "department_id") {
        const dept = departments.find((d) => d.id === value);
        return dept ? (i18n.language === "ar" ? dept.name_ar : dept.name_en) : value;
      } else if (field === "job_id") {
        const job = jobs.find((j) => j.id === value);
        return job ? (i18n.language === "ar" ? job.name_ar : job.name_en) : value;
      }
    }
    
    return String(value);
  };

  // Fetch audit logs
  const {
    data: auditLogs,
    isLoading,
  } = useQuery({
    queryKey: ["audit-trail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Employee info is now stored directly in activity_log columns
      return data.map((log: any) => ({
        ...log,
        employee_no: log.employee_no || "N/A",
        name_en: log.name_en || "Deleted Employee",
        name_ar: log.name_ar || "موظف محذوف",
      })) as AuditLog[];
    },
  });

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    if (!auditLogs) return [];
    const users = [
      ...new Set(auditLogs.map((log) => log.user_email).filter(Boolean)),
    ];
    return users.sort();
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (!auditLogs) return [];

    let filtered = auditLogs.filter((log) => {
      // Search filter
      const matchesSearch =
        !searchTerm ||
        log.employee_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.name_ar?.includes(searchTerm) ||
        log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase());

      // Action filter
      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      // User filter
      const matchesUser = userFilter === "all" || log.user_email === userFilter;

      return matchesSearch && matchesAction && matchesUser;
    });

    // Date range filter
    if (dateRangeFilter !== "all") {
      if (dateRangeFilter === "custom") {
        if (customStartDate && customEndDate) {
          filtered = filtered.filter(
            (log) =>
              dayjs(log.timestamp).isAfter(
                dayjs(customStartDate).subtract(1, "day")
              ) &&
              dayjs(log.timestamp).isBefore(dayjs(customEndDate).add(1, "day"))
          );
        }
      } else {
        const rangeDate =
          dateRangeFilter === "7days"
            ? dayjs().subtract(7, "day")
            : dateRangeFilter === "30days"
            ? dayjs().subtract(30, "day")
            : dateRangeFilter === "90days"
            ? dayjs().subtract(90, "day")
            : null;
        if (rangeDate) {
          filtered = filtered.filter((log) =>
            dayjs(log.timestamp).isAfter(rangeDate)
          );
        }
      }
    }

    return filtered;
  }, [
    auditLogs,
    searchTerm,
    actionFilter,
    userFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
  ]);

  // Statistics
  const stats = useMemo(() => {
    const createCount = filteredLogs.filter((log) => log.action === "CREATE").length;
    const updateCount = filteredLogs.filter((log) => log.action === "UPDATE").length;
    const deleteCount = filteredLogs.filter((log) => log.action === "DELETE").length;

    // Activity by date (last 7 days)
    const activityByDate = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, "day");
      const dateStr = date.format("MMM DD");
      const count = filteredLogs.filter((log) =>
        dayjs(log.timestamp).isSame(date, "day")
      ).length;
      activityByDate.push({ date: dateStr, activities: count });
    }

    // Activity by action (pie chart data)
    const activityByAction = [
      { name: "Created", value: createCount, color: "#10b981" },
      { name: "Updated", value: updateCount, color: "#3b82f6" },
      { name: "Deleted", value: deleteCount, color: "#ef4444" },
    ].filter((item) => item.value > 0);

    // Top users
    const userActivity: Record<string, number> = {};
    filteredLogs.forEach((log) => {
      const user = log.user_email || "System";
      userActivity[user] = (userActivity[user] || 0) + 1;
    });
    const topUsers = Object.entries(userActivity)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent activity (last 24 hours)
    const recentCount = filteredLogs.filter((log) =>
      dayjs(log.timestamp).isAfter(dayjs().subtract(24, "hour"))
    ).length;

    return {
      createCount,
      updateCount,
      deleteCount,
      activityByDate,
      activityByAction,
      topUsers,
      recentCount,
    };
  }, [filteredLogs]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Action icon and color
  const getActionBadge = (action: string) => {
    const config: Record<string, { icon: any; color: string; label: string }> =
      {
        CREATE: {
          icon: Plus,
          color:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          label: "Created",
        },
        UPDATE: {
          icon: Edit,
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          label: "Updated",
        },
        DELETE: {
          icon: Trash,
          color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
          label: "Deleted",
        },
      };
    return (
      config[action] || {
        icon: Edit,
        color: "bg-gray-100 text-gray-800",
        label: action,
      }
    );
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setActionFilter("all");
    setUserFilter("all");
    setDateRangeFilter("30days");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredLogs.map((log) => ({
      "Date/Time": dayjs(log.timestamp).format("DD/MM/YYYY HH:mm:ss"),
      Action: log.action,
      "Employee No": log.employee_no,
      "Employee Name": i18n.language === "ar" ? log.name_ar : log.name_en,
      "Changed By": log.user_email || "System",
      Details: log.details ? JSON.stringify(log.details) : "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
    XLSX.writeFile(wb, `Audit_Trail_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  // Export to PDF (Compliance Report)
  const exportComplianceReport = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("HR COMPLIANCE AUDIT REPORT", 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${dayjs().format("DD/MM/YYYY HH:mm")}`, 14, 28);
    doc.text(`Generated By: ${user?.email || "System"}`, 14, 33);
    doc.text(`Total Records: ${filteredLogs.length}`, 14, 38);
    doc.text(
      `Date Range: ${
        dateRangeFilter === "custom"
          ? `${customStartDate} to ${customEndDate}`
          : dateRangeFilter
      }`,
      14,
      43
    );

    // Summary statistics
    const createCount = filteredLogs.filter(
      (log) => log.action === "CREATE"
    ).length;
    const updateCount = filteredLogs.filter(
      (log) => log.action === "UPDATE"
    ).length;
    const deleteCount = filteredLogs.filter(
      (log) => log.action === "DELETE"
    ).length;

    doc.setFontSize(12);
    doc.text("Activity Summary:", 14, 52);
    doc.setFontSize(10);
    doc.text(`• Employees Created: ${createCount}`, 14, 58);
    doc.text(`• Employees Updated: ${updateCount}`, 14, 63);
    doc.text(`• Employees Deleted: ${deleteCount}`, 14, 68);

    // Table
    const tableData = filteredLogs
      .slice(0, 100)
      .map((log) => [
        dayjs(log.timestamp).format("DD/MM/YY HH:mm"),
        log.action,
        log.employee_no || "N/A",
        (log.name_en || "").substring(0, 25),
        (log.user_email || "System").substring(0, 30),
      ]);

    autoTable(doc, {
      startY: 75,
      head: [["Date/Time", "Action", "Emp#", "Employee Name", "Changed By"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 75;
    doc.setFontSize(8);
    doc.text(
      "This report is generated for labor inspection compliance purposes.",
      14,
      finalY + 10
    );
    doc.text("Confidential - For Official Use Only", 14, finalY + 15);

    doc.save(`HR_Compliance_Report_${dayjs().format("YYYY-MM-DD")}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Audit Trail & Compliance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete activity log for labor inspections and compliance reporting
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <User className="w-3 h-3" />
              Logged in as: {user?.email}
            </Badge>
            <Badge variant="secondary">{dayjs().format("dddd, MMMM D, YYYY")}</Badge>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={exportToExcel} variant="outline" size="sm" className="flex-1 sm:flex-initial h-11 md:h-9 touch-manipulation active:scale-95 transition-transform gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={exportComplianceReport} size="sm" className="flex-1 sm:flex-initial h-11 md:h-9 touch-manipulation active:scale-95 transition-transform gap-2">
            <FileText className="w-4 h-4" />
            Compliance Report (PDF)
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="w-5 h-5" />
              Advanced Filters
              {(searchTerm || actionFilter !== "all" || userFilter !== "all" || dateRangeFilter !== "30days") && (
                <Badge variant="secondary" className="ml-2">
                  {[searchTerm, actionFilter !== "all", userFilter !== "all", dateRangeFilter !== "30days"].filter(Boolean).length} active
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
              >
                {showFilters ? "Hide" : "Show"}
              </Button>
              {(searchTerm || actionFilter !== "all" || userFilter !== "all" || dateRangeFilter !== "30days") && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Employee, user, action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Action Type
                </Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="CREATE">
                      <span className="flex items-center gap-2">
                        <Plus className="w-3 h-3 text-green-600" />
                        Created
                      </span>
                    </SelectItem>
                    <SelectItem value="UPDATE">
                      <span className="flex items-center gap-2">
                        <Edit className="w-3 h-3 text-blue-600" />
                        Updated
                      </span>
                    </SelectItem>
                    <SelectItem value="DELETE">
                      <span className="flex items-center gap-2">
                        <Trash className="w-3 h-3 text-red-600" />
                        Deleted
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User
                </Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {uniqueUsers.map((email) => (
                      <SelectItem key={email} value={email}>
                        {email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date Range
                </Label>
                <Select
                  value={dateRangeFilter}
                  onValueChange={setDateRangeFilter}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Date Range */}
            {dateRangeFilter === "custom" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    From Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || undefined}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    To Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate || undefined}
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* Active Filters Summary */}
            {(searchTerm || actionFilter !== "all" || userFilter !== "all" || dateRangeFilter !== "30days") && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1">
                      <Search className="w-3 h-3" />
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {actionFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      <Activity className="w-3 h-3" />
                      {actionFilter === "CREATE" ? "Created" : actionFilter === "UPDATE" ? "Updated" : "Deleted"}
                    </Badge>
                  )}
                  {userFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      <User className="w-3 h-3" />
                      User: {userFilter}
                    </Badge>
                  )}
                  {dateRangeFilter !== "30days" && (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {dateRangeFilter === "custom"
                        ? `${customStartDate ? dayjs(customStartDate).format("DD/MM/YYYY") : "Start"} - ${customEndDate ? dayjs(customEndDate).format("DD/MM/YYYY") : "End"}`
                        : dateRangeFilter === "7days"
                        ? "Last 7 Days"
                        : dateRangeFilter === "90days"
                        ? "Last 90 Days"
                        : "All Time"}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Activity Visualization Charts */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="w-5 h-5" />
              Activity Analytics & Insights
            </CardTitle>
            <Button
              onClick={() => setShowCharts(!showCharts)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              {showCharts ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>

        {showCharts && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Trend (Last 7 Days) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Activity Trend (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={stats.activityByDate}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="activities"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Activities"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Action Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="w-5 h-5" />
                    Action Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={stats.activityByAction}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.activityByAction.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Users Activity */}
            {stats.topUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Top Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.topUsers} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="email" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} name="Activities" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="border-b bg-muted/50">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Audit Records
            </span>
            <Badge variant="outline">{filteredLogs.length} total records</Badge>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-muted/80 to-muted/40 border-b-2">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Date/Time
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Changed By
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedLogs.map((log) => {
                const badge = getActionBadge(log.action);
                const Icon = badge.icon;

                return (
                  <tr 
                    key={log.id} 
                    className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer active:bg-muted/70"
                  >
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {dayjs(log.timestamp).format("DD/MM/YYYY")}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {dayjs(log.timestamp).format("HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${badge.color} gap-1.5 px-3 py-1`}>
                        <Icon className="w-3.5 h-3.5" />
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {log.employee_no?.substring(0, 2) || "N/A"}
                        </div>
                        <div>
                          <div className="font-medium">{log.employee_no}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {i18n.language === "ar" ? log.name_ar : log.name_en}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">
                          {log.user_email || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm max-w-md">
                      {/* Show formatted changes */}
                      {log.details?.changes &&
                        Object.keys(log.details.changes).length > 0 && (
                          <div className="space-y-2">
                            {Object.entries(log.details.changes).map(
                              ([field, values]: [string, { old: unknown; new: unknown }]) => {
                                // Skip updated_at timestamp field
                                if (field === "updated_at") return null;

                                const oldVal =
                                  values.old === null
                                    ? "(empty)"
                                    : typeof values.old === "boolean"
                                    ? values.old
                                      ? "Active"
                                      : "Inactive"
                                    : resolveIdToName(field, values.old);
                                const newVal =
                                  values.new === null
                                    ? "(empty)"
                                    : typeof values.new === "boolean"
                                    ? values.new
                                      ? "Active"
                                      : "Inactive"
                                    : resolveIdToName(field, values.new);

                                return (
                                  <div
                                    key={field}
                                    className="text-xs border-l-2 border-blue-500 pl-3 py-2 bg-blue-50/50 dark:bg-blue-900/10 rounded-r"
                                  >
                                    <div className="font-semibold text-gray-700 dark:text-gray-200 capitalize mb-1">
                                      {field.replace(/_/g, " ")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-red-600 dark:text-red-400 line-through bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                                        {String(oldVal)}
                                      </span>
                                      <span className="text-gray-400 font-bold">→</span>
                                      <span className="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                        {String(newVal)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}

                      {/* New employee created */}
                      {log.action === "CREATE" && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded">
                          <Plus className="w-4 h-4" />
                          New employee added to system
                        </div>
                      )}

                      {/* Employee deleted */}
                      {log.action === "DELETE" && (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
                          <Trash className="w-4 h-4" />
                          Employee permanently removed
                        </div>
                      )}

                      {/* No changes detected (shouldn't happen but safety) */}
                      {log.action === "UPDATE" &&
                        (!log.details?.changes ||
                          Object.keys(log.details.changes).length === 0) && (
                          <span className="text-muted-foreground text-xs italic">
                            No changes recorded
                          </span>
                        )}

                      {/* Legacy status_change action */}
                      {log.action === "status_change" && (
                        <span className="text-blue-600 dark:text-blue-400 text-xs">
                          Status changed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t bg-muted/30 px-4 py-4 gap-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
              <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of{" "}
              <span className="font-semibold text-foreground">{filteredLogs.length}</span> records
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 touch-manipulation active:scale-95 transition-transform"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-md text-sm font-medium">
                <span className="text-primary">Page {currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="text-primary">{totalPages}</span>
              </div>
              <Button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 touch-manipulation active:scale-95 transition-transform"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card className="p-16 text-center border-2 border-dashed bg-gradient-to-br from-muted/50 to-transparent">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Shield className="w-10 h-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Audit Records Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || actionFilter !== "all" || userFilter !== "all"
                  ? "No records match your current filters. Try adjusting your search criteria."
                  : "The audit trail is empty. Activity logs will appear here once employees are created, updated, or deleted."}
              </p>
            </div>
            {(searchTerm || actionFilter !== "all" || userFilter !== "all") && (
              <Button onClick={clearFilters} variant="outline" className="mt-4 gap-2">
                <X className="w-4 h-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
