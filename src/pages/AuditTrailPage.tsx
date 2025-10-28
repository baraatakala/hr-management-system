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
import { Card } from "@/components/ui/card";
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
} from "lucide-react";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

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

  // Fetch audit logs
  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ["audit-trail"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select(`
          *,
          employees (
            employee_no,
            name_en,
            name_ar
          )
        `)
        .order("timestamp", { ascending: false })
        .limit(1000);

      if (error) throw error;

      return data.map((log: any) => ({
        ...log,
        employee_no: log.employees?.employee_no || "N/A",
        name_en: log.employees?.name_en || "Deleted Employee",
        name_ar: log.employees?.name_ar || "موظف محذوف",
      })) as AuditLog[];
    },
  });

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    if (!auditLogs) return [];
    const users = [...new Set(auditLogs.map(log => log.user_email).filter(Boolean))];
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
      const matchesAction = actionFilter === "all" || log.action === actionFilter;

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
              dayjs(log.timestamp).isAfter(dayjs(customStartDate).subtract(1, "day")) &&
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
          filtered = filtered.filter((log) => dayjs(log.timestamp).isAfter(rangeDate));
        }
      }
    }

    return filtered;
  }, [auditLogs, searchTerm, actionFilter, userFilter, dateRangeFilter, customStartDate, customEndDate]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Action icon and color
  const getActionBadge = (action: string) => {
    const config: Record<string, { icon: any; color: string; label: string }> = {
      CREATE: { icon: Plus, color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Created" },
      UPDATE: { icon: Edit, color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Updated" },
      DELETE: { icon: Trash, color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", label: "Deleted" },
    };
    return config[action] || { icon: Edit, color: "bg-gray-100 text-gray-800", label: action };
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
      "Details": log.details ? JSON.stringify(log.details) : "",
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
    doc.text(`Date Range: ${dateRangeFilter === "custom" ? `${customStartDate} to ${customEndDate}` : dateRangeFilter}`, 14, 43);

    // Summary statistics
    const createCount = filteredLogs.filter(log => log.action === "CREATE").length;
    const updateCount = filteredLogs.filter(log => log.action === "UPDATE").length;
    const deleteCount = filteredLogs.filter(log => log.action === "DELETE").length;

    doc.setFontSize(12);
    doc.text("Activity Summary:", 14, 52);
    doc.setFontSize(10);
    doc.text(`• Employees Created: ${createCount}`, 14, 58);
    doc.text(`• Employees Updated: ${updateCount}`, 14, 63);
    doc.text(`• Employees Deleted: ${deleteCount}`, 14, 68);

    // Table
    const tableData = filteredLogs.slice(0, 100).map((log) => [
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
    doc.text("This report is generated for labor inspection compliance purposes.", 14, finalY + 10);
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
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
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
            <Badge variant="secondary">
              {filteredLogs.length} records
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={exportComplianceReport} className="gap-2">
            <FileText className="w-4 h-4" />
            Compliance Report (PDF)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
            >
              {showFilters ? "Hide" : "Show"}
            </Button>
            <Button onClick={clearFilters} variant="ghost" size="sm" className="gap-1">
              <X className="w-3 h-3" />
              Clear All
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div>
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Employee, user, action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <Label className="text-xs">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Created</SelectItem>
                  <SelectItem value="UPDATE">Updated</SelectItem>
                  <SelectItem value="DELETE">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div>
              <Label className="text-xs">User</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
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
            <div>
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Date Range
              </Label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
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
        )}

        {/* Custom Date Range */}
        {dateRangeFilter === "custom" && showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || undefined}
              />
            </div>
            <div>
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate || undefined}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Changed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedLogs.map((log) => {
                const badge = getActionBadge(log.action);
                const Icon = badge.icon;

                return (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {dayjs(log.timestamp).format("DD/MM/YYYY")}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {dayjs(log.timestamp).format("HH:mm:ss")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${badge.color} gap-1`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium">{log.employee_no}</div>
                      <div className="text-xs text-muted-foreground">
                        {i18n.language === "ar" ? log.name_ar : log.name_en}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {log.user_email || "System"}
                    </td>
                    <td className="px-4 py-3 text-sm max-w-md">
                      {/* Show formatted changes */}
                      {log.details?.changes && Object.keys(log.details.changes).length > 0 && (
                        <div className="space-y-1">
                          {Object.entries(log.details.changes).map(([field, values]: [string, any]) => {
                            // Skip updated_at timestamp field
                            if (field === 'updated_at') return null;
                            
                            const oldVal = values.old === null ? '(empty)' : 
                                          typeof values.old === 'boolean' ? (values.old ? 'Active' : 'Inactive') :
                                          values.old;
                            const newVal = values.new === null ? '(empty)' : 
                                          typeof values.new === 'boolean' ? (values.new ? 'Active' : 'Inactive') :
                                          values.new;
                            
                            return (
                              <div key={field} className="text-xs border-l-2 border-blue-400 pl-2 py-1">
                                <div className="font-semibold text-gray-700 dark:text-gray-300 capitalize">
                                  {field.replace(/_/g, ' ')}:
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-red-600 dark:text-red-400 line-through">
                                    {String(oldVal)}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-green-600 dark:text-green-400 font-medium">
                                    {String(newVal)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* New employee created */}
                      {log.action === "CREATE" && (
                        <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                          ✓ New employee added
                        </span>
                      )}
                      
                      {/* Employee deleted */}
                      {log.action === "DELETE" && (
                        <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                          ✗ Employee deleted
                        </span>
                      )}
                      
                      {/* No changes detected (shouldn't happen but safety) */}
                      {log.action === "UPDATE" && (!log.details?.changes || Object.keys(log.details.changes).length === 0) && (
                        <span className="text-muted-foreground text-xs italic">No changes recorded</span>
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
          <div className="flex items-center justify-between border-t p-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
              {filteredLogs.length} records
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 px-3 text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <Card className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Audit Records Found</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm || actionFilter !== "all" || userFilter !== "all"
              ? "Try adjusting your filters"
              : "Audit trail is empty"}
          </p>
        </Card>
      )}
    </div>
  );
}
