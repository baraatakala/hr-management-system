import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/ui/voice-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  Grid3x3,
  List,
  Filter,
  X,
  CheckSquare,
  Square,
  Trash,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

interface Employee {
  id: string;
  employee_no: string;
  name_en: string;
  name_ar: string;
  nationality: string;
  company_id: string;
  department_id: string;
  job_id: string;
  passport_no: string | null;
  passport_expiry: string | null;
  card_no: string | null;
  card_expiry: string | null;
  emirates_id: string | null;
  emirates_id_expiry: string | null;
  residence_no: string | null;
  residence_expiry: string | null;
  email: string | null;
  phone: string | null;
}

type ViewMode = "grid" | "table";
type StatusFilter = "all" | "valid" | "expiring" | "expired";

export function EmployeesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Check if RTL
  const isRTL = i18n.language === "ar";

  // Filter states
  const [nationalityFilter, setNationalityFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [passportStatusFilter, setPassportStatusFilter] =
    useState<StatusFilter>("all");
  const [cardStatusFilter, setCardStatusFilter] = useState<StatusFilter>("all");
  const [emiratesIdStatusFilter, setEmiratesIdStatusFilter] =
    useState<StatusFilter>("all");
  const [residenceStatusFilter, setResidenceStatusFilter] =
    useState<StatusFilter>("all");

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(true);

  // Sort states
  const [sortColumn, setSortColumn] = useState<string>("employee_no");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Sort handler
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Sort icon component
  const SortIcon = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-3 h-3 md:w-4 md:h-4 ml-1 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 md:w-4 md:h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-3 h-3 md:w-4 md:h-4 ml-1 text-blue-600" />
    );
  };

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select(
          "*, companies(name_en, name_ar), departments(name_en, name_ar), jobs(name_en, name_ar)"
        )
        .order("employee_no");
      if (error) throw error;
      return data;
    },
  });

  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .order("name_en");
      return data || [];
    },
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("departments")
        .select("*")
        .order("name_en");
      return data || [];
    },
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("name_en");
      return data || [];
    },
  });

  const { data: nationalities } = useQuery({
    queryKey: ["nationalities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nationalities")
        .select("*")
        .order("name_en");
      return data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("employees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("employees").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSelectedIds([]);
      setShowBulkActions(false);
    },
  });

  // Helper function to check document status
  const getDocumentStatus = (expiryDate: string | null): StatusFilter | null => {
    if (!expiryDate) return null; // N/A dates return null to indicate no status
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), "day");
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring";
    return "valid";
  };

  // Comprehensive filtering
  const filteredEmployees = useMemo(() => {
    const filtered = employees?.filter((emp: any) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        emp.name_en.toLowerCase().includes(searchLower) ||
        emp.name_ar.includes(searchTerm) ||
        emp.employee_no.toLowerCase().includes(searchLower) ||
        emp.passport_no?.toLowerCase().includes(searchLower) ||
        emp.emirates_id?.toLowerCase().includes(searchLower) ||
        emp.residence_no?.toLowerCase().includes(searchLower);

      // Nationality filter
      const matchesNationality =
        nationalityFilter === "all" || emp.nationality === nationalityFilter;

      // Company filter
      const matchesCompany =
        companyFilter === "all" || emp.company_id === companyFilter;

      // Department filter
      const matchesDepartment =
        departmentFilter === "all" || emp.department_id === departmentFilter;

      // Job filter
      const matchesJob = jobFilter === "all" || emp.job_id === jobFilter;

      // Passport status filter
      const passportStatus = getDocumentStatus(emp.passport_expiry);
      const matchesPassport =
        passportStatusFilter === "all" ||
        (passportStatus !== null && passportStatus === passportStatusFilter);

      // Card status filter
      const cardStatus = getDocumentStatus(emp.card_expiry);
      const matchesCard =
        cardStatusFilter === "all" || 
        (cardStatus !== null && cardStatus === cardStatusFilter);

      // Emirates ID status filter
      const emiratesIdStatus = getDocumentStatus(emp.emirates_id_expiry);
      const matchesEmiratesId =
        emiratesIdStatusFilter === "all" ||
        (emiratesIdStatus !== null && emiratesIdStatus === emiratesIdStatusFilter);

      // Residence status filter
      const residenceStatus = getDocumentStatus(emp.residence_expiry);
      const matchesResidence =
        residenceStatusFilter === "all" ||
        (residenceStatus !== null && residenceStatus === residenceStatusFilter);

      return (
        matchesSearch &&
        matchesNationality &&
        matchesCompany &&
        matchesDepartment &&
        matchesJob &&
        matchesPassport &&
        matchesCard &&
        matchesEmiratesId &&
        matchesResidence
      );
    });

    // Apply sorting
    if (!sortColumn || !filtered) return filtered;

    return [...filtered].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      // Get values based on column
      switch (sortColumn) {
        case "employee_no":
          aValue = a.employee_no;
          bValue = b.employee_no;
          break;
        case "name":
          aValue = i18n.language === "ar" ? a.name_ar : a.name_en;
          bValue = i18n.language === "ar" ? b.name_ar : b.name_en;
          break;
        case "nationality":
          aValue = a.nationality || "";
          bValue = b.nationality || "";
          break;
        case "company":
          aValue = i18n.language === "ar" ? a.companies?.name_ar : a.companies?.name_en;
          bValue = i18n.language === "ar" ? b.companies?.name_ar : b.companies?.name_en;
          break;
        case "department":
          aValue = i18n.language === "ar" ? a.departments?.name_ar : a.departments?.name_en;
          bValue = i18n.language === "ar" ? b.departments?.name_ar : b.departments?.name_en;
          break;
        case "job":
          aValue = i18n.language === "ar" ? a.jobs?.name_ar : a.jobs?.name_en;
          bValue = i18n.language === "ar" ? b.jobs?.name_ar : b.jobs?.name_en;
          break;
        case "passport":
          aValue = a.passport_expiry || "";
          bValue = b.passport_expiry || "";
          break;
        case "card_expiry":
          aValue = a.card_expiry || "";
          bValue = b.card_expiry || "";
          break;
        case "emirates_id":
          aValue = a.emirates_id_expiry || "";
          bValue = b.emirates_id_expiry || "";
          break;
        case "residence":
          aValue = a.residence_expiry || "";
          bValue = b.residence_expiry || "";
          break;
        default:
          return 0;
      }

      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      // Compare values
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    employees,
    searchTerm,
    nationalityFilter,
    companyFilter,
    departmentFilter,
    jobFilter,
    passportStatusFilter,
    cardStatusFilter,
    emiratesIdStatusFilter,
    residenceStatusFilter,
    sortColumn,
    sortDirection,
    i18n.language,
  ]);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t("employees.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredEmployees?.length) {
      setSelectedIds([]);
      setShowBulkActions(false);
    } else {
      const allIds = filteredEmployees?.map((emp: any) => emp.id) || [];
      setSelectedIds(allIds);
      setShowBulkActions(true);
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelected);
    setShowBulkActions(newSelected.length > 0);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.length} selected employee(s)?`
      )
    ) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleBulkExport = () => {
    const selectedEmployees = filteredEmployees?.filter((emp: any) =>
      selectedIds.includes(emp.id)
    );

    if (!selectedEmployees || selectedEmployees.length === 0) return;

    const exportData = selectedEmployees.map((emp: any) => ({
      "Employee No": emp.employee_no,
      "Name (EN)": emp.name_en,
      "Name (AR)": emp.name_ar,
      Nationality: emp.nationality,
      Company:
        i18n.language === "ar"
          ? emp.companies?.name_ar
          : emp.companies?.name_en,
      Department:
        i18n.language === "ar"
          ? emp.departments?.name_ar
          : emp.departments?.name_en,
      Job: i18n.language === "ar" ? emp.jobs?.name_ar : emp.jobs?.name_en,
      "Passport No": emp.passport_no || "",
      "Passport Expiry": emp.passport_expiry || "",
      "Card No": emp.card_no || "",
      "Card Expiry": emp.card_expiry || "",
      "Emirates ID": emp.emirates_id || "",
      "Emirates ID Expiry": emp.emirates_id_expiry || "",
      "Residence No": emp.residence_no || "",
      "Residence Expiry": emp.residence_expiry || "",
      Email: emp.email || "",
      Phone: emp.phone || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Selected Employees");
    XLSX.writeFile(
      wb,
      `selected_employees_${dayjs().format("YYYY-MM-DD")}.xlsx`
    );
  };

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return "text-gray-500";
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), "day");
    if (daysUntilExpiry < 0) return "text-red-600 font-bold";
    if (daysUntilExpiry <= 30) return "text-yellow-600 font-bold";
    return "text-green-600";
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setNationalityFilter("all");
    setCompanyFilter("all");
    setDepartmentFilter("all");
    setJobFilter("all");
    setPassportStatusFilter("all");
    setCardStatusFilter("all");
    setEmiratesIdStatusFilter("all");
    setResidenceStatusFilter("all");
  };

  const exportToExcel = () => {
    if (!filteredEmployees || filteredEmployees.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = filteredEmployees.map((emp: any) => ({
      "Employee No": emp.employee_no,
      "Name (English)": emp.name_en,
      "Name (Arabic)": emp.name_ar,
      Nationality: emp.nationality,
      Company:
        i18n.language === "ar"
          ? emp.companies?.name_ar
          : emp.companies?.name_en,
      Department:
        i18n.language === "ar"
          ? emp.departments?.name_ar
          : emp.departments?.name_en,
      Job: i18n.language === "ar" ? emp.jobs?.name_ar : emp.jobs?.name_en,
      "Passport No": emp.passport_no || "",
      "Passport Expiry": emp.passport_expiry
        ? dayjs(emp.passport_expiry).format("DD/MM/YYYY")
        : "",
      "Card No": emp.card_no || "",
      "Card Expiry": emp.card_expiry
        ? dayjs(emp.card_expiry).format("DD/MM/YYYY")
        : "",
      "Emirates ID": emp.emirates_id || "",
      "Emirates ID Expiry": emp.emirates_id_expiry
        ? dayjs(emp.emirates_id_expiry).format("DD/MM/YYYY")
        : "",
      "Residence No": emp.residence_no || "",
      "Residence Expiry": emp.residence_expiry
        ? dayjs(emp.residence_expiry).format("DD/MM/YYYY")
        : "",
      Email: emp.email || "",
      Phone: emp.phone || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Auto-size columns
    const maxWidth = 50;
    const colWidths = Object.keys(exportData[0]).map((key) => ({
      wch: Math.min(
        maxWidth,
        Math.max(
          key.length,
          ...exportData.map(
            (row) => String(row[key as keyof typeof row] || "").length
          )
        )
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(wb, `Employees_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  if (isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("employees.title")}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {filteredEmployees?.length || 0}{" "}
            {t("employees.title").toLowerCase()}{" "}
            {filteredEmployees?.length !== employees?.length &&
              `(filtered from ${employees?.length})`}
          </p>
        </div>
        <div className={`flex gap-2 w-full md:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
          <Button onClick={handleAdd} className="gap-2 flex-1 md:flex-initial h-11 md:h-10">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t("employees.addEmployee")}</span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button onClick={exportToExcel} variant="outline" className="gap-2 flex-1 md:flex-initial h-11 md:h-10">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Excel</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar - Mobile Optimized */}
      {showBulkActions && (
        <Card className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-lg">
          <div
            className={`flex flex-col gap-3 md:flex-row md:justify-between md:items-center ${
              isRTL ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-2 md:gap-3 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-sm md:text-base text-blue-900 dark:text-blue-100">
                {selectedIds.length} {selectedIds.length === 1 ? 'employee' : 'employees'} selected
              </span>
            </div>
            <div className={`flex gap-2 w-full md:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
              <Button
                onClick={handleBulkExport}
                variant="outline"
                className="gap-2 flex-1 md:flex-initial h-10 text-xs md:text-sm"
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Export Selected</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                className="gap-2 flex-1 md:flex-initial h-10 text-xs md:text-sm"
                size="sm"
              >
                <Trash className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Selected</span>
                <span className="sm:hidden">Delete</span>
              </Button>
              <Button
                onClick={() => {
                  setSelectedIds([]);
                  setShowBulkActions(false);
                }}
                variant="ghost"
                size="sm"
                className="h-10 px-2 md:px-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters & Controls - Mobile Optimized */}
      <Card className="p-3 md:p-4 space-y-3 md:space-y-4">
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
            <h2 className="text-base md:text-lg font-semibold">Filters & Control</h2>
            {(nationalityFilter !== "all" || companyFilter !== "all" || jobFilter !== "all" || departmentFilter !== "all" || searchTerm) && (
              <Badge variant="secondary" className="text-xs">
                {[
                  searchTerm ? 1 : 0,
                  nationalityFilter !== "all" ? 1 : 0,
                  companyFilter !== "all" ? 1 : 0,
                  jobFilter !== "all" ? 1 : 0,
                  departmentFilter !== "all" ? 1 : 0,
                ].reduce((a, b) => a + b, 0)} active
              </Badge>
            )}
          </div>
          <div className={`flex gap-1 md:gap-2 w-full sm:w-auto ${isRTL ? "flex-row-reverse" : ""}`}>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
              className="h-9 text-xs md:text-sm px-2 md:px-3 flex-1 sm:flex-initial"
            >
              <span className="hidden sm:inline">{showFilters ? "Hide" : "Show"}</span>
              <Filter className="w-4 h-4 sm:hidden" />
            </Button>
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="gap-1 md:gap-2 h-9 text-xs md:text-sm px-2 md:px-3 flex-1 sm:flex-initial"
            >
              <X className="w-4 h-4" />
              <span className="hidden md:inline">Clear All</span>
              <span className="md:hidden">Clear</span>
            </Button>
            {/* View Mode Toggle - Works on All Screen Sizes */}
            <div className="flex gap-0.5 border rounded-md">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none h-9 px-2 md:px-3"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none h-9 px-2 md:px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-3 md:space-y-4">
            {/* Active Filters Display */}
            {(nationalityFilter !== "all" || companyFilter !== "all" || jobFilter !== "all" || departmentFilter !== "all" || searchTerm) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-900 dark:text-blue-100">Active Filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Search: "{searchTerm.slice(0, 20)}{searchTerm.length > 20 ? '...' : ''}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {nationalityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Nationality: {nationalityFilter}
                    <button
                      onClick={() => setNationalityFilter("all")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {companyFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Company
                    <button
                      onClick={() => setCompanyFilter("all")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {jobFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Job
                    <button
                      onClick={() => setJobFilter("all")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {departmentFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Department
                    <button
                      onClick={() => setDepartmentFilter("all")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Quick Search - Mobile Optimized */}
            {/* Enhanced Quick Search with Clear Button */}
            <div>
              <Label className="text-xs md:text-sm font-medium mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Quick Search
                {searchTerm && (
                  <span className="text-xs text-muted-foreground">
                    ({filteredEmployees?.length || 0} results)
                  </span>
                )}
              </Label>
              <div
                className={`relative flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <Search className="absolute left-3 w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0 pointer-events-none" />
                <Input
                  placeholder="Search by name, employee #, email, phone, passport, emirates ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 h-11 md:h-10 pl-10 pr-10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    type="button"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                💡 Tip: Search works across all fields - names, documents, contact info
              </p>
            </div>

            {/* Filter Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {/* Nationality Filter */}
              <div>
                <Label className="text-xs md:text-sm font-medium mb-2 block">
                  Nationality
                </Label>
                <SearchableSelect
                  value={nationalityFilter}
                  onValueChange={setNationalityFilter}
                  options={[
                    { value: "all", label: "All Nationalities" },
                    ...nationalities.map((nat: any) => ({
                      value: nat.name_en,
                      label: i18n.language === "ar" ? nat.name_ar : nat.name_en,
                    })),
                  ]}
                  placeholder="All Nationalities"
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                  emptyText={i18n.language === "ar" ? "لا توجد نتائج" : "No results found"}
                />
              </div>

              {/* Company Filter */}
              <div>
                <Label className="text-xs md:text-sm font-medium mb-2 block">
                  Company
                </Label>
                <SearchableSelect
                  value={companyFilter}
                  onValueChange={setCompanyFilter}
                  options={[
                    { value: "all", label: i18n.language === "ar" ? "جميع الشركات" : "All Companies" },
                    ...companies.map((company) => ({
                      value: company.id,
                      label: i18n.language === "ar" ? company.name_ar : company.name_en,
                    })),
                  ]}
                  placeholder={i18n.language === "ar" ? "جميع الشركات" : "All Companies"}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                  emptyText={i18n.language === "ar" ? "لا توجد نتائج" : "No results found"}
                />
              </div>

              {/* Job Filter */}
              <div>
                <Label className="text-xs md:text-sm font-medium mb-2 block">Job</Label>
                <SearchableSelect
                  value={jobFilter}
                  onValueChange={setJobFilter}
                  options={[
                    { value: "all", label: i18n.language === "ar" ? "جميع الوظائف" : "All Jobs" },
                    ...jobs.map((job) => ({
                      value: job.id,
                      label: i18n.language === "ar" ? job.name_ar : job.name_en,
                    })),
                  ]}
                  placeholder={i18n.language === "ar" ? "جميع الوظائف" : "All Jobs"}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                  emptyText={i18n.language === "ar" ? "لا توجد نتائج" : "No results found"}
                />
              </div>

              {/* Department Filter */}
              <div>
                <Label className="text-xs md:text-sm font-medium mb-2 block">
                  Department
                </Label>
                <SearchableSelect
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                  options={[
                    { value: "all", label: i18n.language === "ar" ? "جميع الأقسام" : "All Departments" },
                    ...departments.map((dept) => ({
                      value: dept.id,
                      label: i18n.language === "ar" ? dept.name_ar : dept.name_en,
                    })),
                  ]}
                  placeholder={i18n.language === "ar" ? "جميع الأقسام" : "All Departments"}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                  emptyText={i18n.language === "ar" ? "لا توجد نتائج" : "No results found"}
                />
              </div>

              {/* Passport Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Passport Status
                </Label>
                <Select
                  value={passportStatusFilter}
                  onValueChange={(value) =>
                    setPassportStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid (30+ days)</SelectItem>
                    <SelectItem value="expiring">
                      Expiring Soon (≤30 days)
                    </SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Card Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Card Status
                </Label>
                <Select
                  value={cardStatusFilter}
                  onValueChange={(value) =>
                    setCardStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid (30+ days)</SelectItem>
                    <SelectItem value="expiring">
                      Expiring Soon (≤30 days)
                    </SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Emirates ID Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Emirates ID Status
                </Label>
                <Select
                  value={emiratesIdStatusFilter}
                  onValueChange={(value) =>
                    setEmiratesIdStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid (30+ days)</SelectItem>
                    <SelectItem value="expiring">
                      Expiring Soon (≤30 days)
                    </SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Residence Status Filter */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Residence Status
                </Label>
                <Select
                  value={residenceStatusFilter}
                  onValueChange={(value) =>
                    setResidenceStatusFilter(value as StatusFilter)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="valid">Valid (30+ days)</SelectItem>
                    <SelectItem value="expiring">
                      Expiring Soon (≤30 days)
                    </SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Employee Cards/Table - Mobile Optimized */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredEmployees?.map((employee: any) => (
            <Card
              key={employee.id}
              className={`p-4 md:p-5 space-y-3 transition-all duration-200 hover:shadow-lg ${
                selectedIds.includes(employee.id)
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleSelectOne(employee.id)}
                    className="hover:bg-muted rounded p-1 mt-0.5 md:mt-1 flex-shrink-0 touch-manipulation active:scale-95 transition-transform"
                  >
                    {selectedIds.includes(employee.id) ? (
                      <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base md:text-lg truncate">
                      {i18n.language === "ar"
                        ? employee.name_ar
                        : employee.name_en}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {employee.employee_no}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(employee)}
                    className="h-9 w-9 p-0 touch-manipulation active:scale-95 transition-transform"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(employee.id)}
                    className="h-9 w-9 p-0 touch-manipulation active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm md:text-base">
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">Nationality:</span>{" "}
                  <span className="text-muted-foreground">{employee.nationality || "N/A"}</span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">{t("employees.company")}:</span>{" "}
                  <span className="text-muted-foreground">
                    {i18n.language === "ar"
                      ? employee.companies?.name_ar
                      : employee.companies?.name_en}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    {t("employees.department")}:
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {i18n.language === "ar"
                      ? employee.departments?.name_ar
                      : employee.departments?.name_en}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">{t("employees.job")}:</span>{" "}
                  <span className="text-muted-foreground">
                    {i18n.language === "ar"
                      ? employee.jobs?.name_ar
                      : employee.jobs?.name_en}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    {t("employees.passportNo")}:
                  </span>{" "}
                  <span className="text-muted-foreground">{employee.passport_no || "N/A"}</span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Passport Expiry:
                  </span>{" "}
                  <span className={getExpiryStatus(employee.passport_expiry)}>
                    {employee.passport_expiry
                      ? dayjs(employee.passport_expiry).format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    {t("employees.cardExpiry")}:
                  </span>{" "}
                  <span className={getExpiryStatus(employee.card_expiry)}>
                    {employee.card_expiry
                      ? dayjs(employee.card_expiry).format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Emirates ID:
                  </span>{" "}
                  <span className="text-muted-foreground">{employee.emirates_id || "N/A"}</span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    {t("employees.emiratesIdExpiry")}:
                  </span>{" "}
                  <span
                    className={getExpiryStatus(employee.emirates_id_expiry)}
                  >
                    {employee.emirates_id_expiry
                      ? dayjs(employee.emirates_id_expiry).format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Residence No:
                  </span>{" "}
                  <span className="text-muted-foreground">{employee.residence_no || "N/A"}</span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Residence Expiry:
                  </span>{" "}
                  <span className={getExpiryStatus(employee.residence_expiry)}>
                    {employee.residence_expiry
                      ? dayjs(employee.residence_expiry).format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Email:
                  </span>{" "}
                  <span className="text-muted-foreground text-xs">{employee.email || "N/A"}</span>
                </p>
                <p className="truncate">
                  <span className="font-medium text-xs md:text-sm">
                    Phone:
                  </span>{" "}
                  <span className="text-muted-foreground">{employee.phone || "N/A"}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View - Mobile Responsive with Horizontal Scroll */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="p-2 md:p-3 w-10">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="hover:bg-muted rounded p-1 touch-manipulation"
                    >
                      {selectedIds.length === filteredEmployees?.length &&
                      filteredEmployees?.length > 0 ? (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("employee_no")}
                  >
                    <div className="flex items-center gap-1">
                      Employee No
                      <SortIcon column="employee_no" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      <SortIcon column="name" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("nationality")}
                  >
                    <div className="flex items-center gap-1">
                      Nationality
                      <SortIcon column="nationality" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("company")}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      <SortIcon column="company" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("department")}
                  >
                    <div className="flex items-center gap-1">
                      Department
                      <SortIcon column="department" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("job")}
                  >
                    <div className="flex items-center gap-1">
                      Job
                      <SortIcon column="job" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("passport")}
                  >
                    <div className="flex items-center gap-1">
                      Passport
                      <SortIcon column="passport" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("card_expiry")}
                  >
                    <div className="flex items-center gap-1">
                      Card Expiry
                      <SortIcon column="card_expiry" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("emirates_id")}
                  >
                    <div className="flex items-center gap-1">
                      Emirates ID
                      <SortIcon column="emirates_id" />
                    </div>
                  </th>
                  <th 
                    className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors"
                    onClick={() => handleSort("residence")}
                  >
                    <div className="flex items-center gap-1">
                      Residence
                      <SortIcon column="residence" />
                    </div>
                  </th>
                  <th className="text-right p-2 md:p-3 font-semibold text-xs md:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
              {filteredEmployees?.map((employee: any) => (
                <tr key={employee.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-2 md:p-3">
                    <button
                      type="button"
                      onClick={() => handleSelectOne(employee.id)}
                      className="hover:bg-muted rounded p-1 touch-manipulation"
                    >
                      {selectedIds.includes(employee.id) ? (
                        <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </button>
                  </td>
                  <td className="p-2 md:p-3 font-medium text-xs md:text-sm">{employee.employee_no}</td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    {i18n.language === "ar"
                      ? employee.name_ar
                      : employee.name_en}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">{employee.nationality}</td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    {i18n.language === "ar"
                      ? employee.companies?.name_ar
                      : employee.companies?.name_en}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    {i18n.language === "ar"
                      ? employee.departments?.name_ar
                      : employee.departments?.name_en}
                  </td>
                  <td className="p-2 md:p-3 text-xs md:text-sm">
                    {i18n.language === "ar"
                      ? employee.jobs?.name_ar
                      : employee.jobs?.name_en}
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="text-[10px] md:text-xs">
                      <div>{employee.passport_no || "N/A"}</div>
                      <div
                        className={getExpiryStatus(employee.passport_expiry)}
                      >
                        {employee.passport_expiry
                          ? dayjs(employee.passport_expiry).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="text-[10px] md:text-xs">
                      <div>{employee.card_no || "N/A"}</div>
                      <div className={getExpiryStatus(employee.card_expiry)}>
                        {employee.card_expiry
                          ? dayjs(employee.card_expiry).format("DD/MM/YYYY")
                          : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="text-[10px] md:text-xs">
                      <div>{employee.emirates_id || "N/A"}</div>
                      <div
                        className={getExpiryStatus(employee.emirates_id_expiry)}
                      >
                        {employee.emirates_id_expiry
                          ? dayjs(employee.emirates_id_expiry).format(
                              "DD/MM/YYYY"
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="text-[10px] md:text-xs">
                      <div>{employee.residence_no || "N/A"}</div>
                      <div
                        className={getExpiryStatus(employee.residence_expiry)}
                      >
                        {employee.residence_expiry
                          ? dayjs(employee.residence_expiry).format(
                              "DD/MM/YYYY"
                            )
                          : "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 md:p-3">
                    <div className="flex gap-1 md:gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(employee)}
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(employee.id)}
                        className="h-8 w-8 p-0 touch-manipulation"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {(!filteredEmployees || filteredEmployees.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              No employees found
            </div>
          )}
        </Card>
      )}

      {/* Employee Dialog */}
      <EmployeeDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        employee={editingEmployee}
        companies={companies || []}
        departments={departments || []}
        jobs={jobs || []}
        nationalities={nationalities || []}
      />
    </div>
  );
}

interface EmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  companies: any[];
  departments: any[];
  jobs: any[];
  nationalities: any[];
}

function EmployeeDialog({
  isOpen,
  onClose,
  employee,
  companies,
  departments,
  jobs,
  nationalities,
}: EmployeeDialogProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(employee || {});

  React.useEffect(() => {
    setFormData(employee || {});
  }, [employee]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Validate required fields
      if (!data.company_id || !data.department_id || !data.job_id) {
        throw new Error("Company, Department, and Job are required fields");
      }

      // Clean data: remove nested objects and keep only valid columns
      const cleanData = {
        employee_no: data.employee_no,
        name_en: data.name_en,
        name_ar: data.name_ar,
        nationality: data.nationality,
        company_id: data.company_id,
        department_id: data.department_id,
        job_id: data.job_id,
        passport_no: data.passport_no || null,
        passport_expiry: data.passport_expiry || null,
        card_no: data.card_no || null,
        card_expiry: data.card_expiry || null,
        emirates_id: data.emirates_id || null,
        emirates_id_expiry: data.emirates_id_expiry || null,
        residence_no: data.residence_no || null,
        residence_expiry: data.residence_expiry || null,
        email: data.email || null,
        phone: data.phone || null,
      };

      if (employee) {
        const { error } = await supabase
          .from("employees")
          .update(cleanData)
          .eq("id", employee.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("employees").insert([cleanData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (error: any) => {
      alert(error.message || "An error occurred while saving the employee");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader className="space-y-2 md:space-y-3">
          <DialogTitle className="text-xl md:text-2xl">
            {employee
              ? t("employees.editEmployee")
              : t("employees.addEmployee")}
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            {employee
              ? "Edit employee information and document details"
              : "Add a new employee to the system with all required information"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 mt-4">
          {/* Basic Information Section */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-semibold text-primary border-b pb-2">
              📋 Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.employeeNo")} <span className="text-red-500">*</span> 🎤
                </Label>
                <VoiceInput
                  value={formData.employee_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Type or say numbers"
                  required
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.nameEn")} <span className="text-red-500">*</span> 🎤
                </Label>
                <VoiceInput
                  value={formData.name_en || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Type or click mic to speak"
                  required
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.nameAr")} <span className="text-red-500">*</span> 🎤
                </Label>
                <VoiceInput
                  value={formData.name_ar || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  voiceLanguage="ar-SA"
                  placeholder="اكتب أو انقر على الميكروفون للتحدث"
                  required
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.nationality")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.nationality || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nationality: value })
                  }
                  options={nationalities.map((nat) => ({
                    value: nat.name_en,
                    label: i18n.language === "ar" ? nat.name_ar : nat.name_en,
                  }))}
                  placeholder={
                    i18n.language === "ar"
                      ? "اختر الجنسية..."
                      : "Select a nationality..."
                  }
                  searchPlaceholder={
                    i18n.language === "ar" ? "بحث..." : "Search..."
                  }
                  emptyText={
                    i18n.language === "ar"
                      ? "لا توجد نتائج"
                      : "No results found"
                  }
                />
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-semibold text-primary border-b pb-2">
              🏢 Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.company")} <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.company_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, company_id: value })
                  }
                  options={companies.map((company) => ({
                    value: company.id,
                    label:
                      i18n.language === "ar"
                        ? company.name_ar
                        : company.name_en,
                  }))}
                  placeholder={
                    i18n.language === "ar" ? "اختر الشركة..." : "Select a company..."
                  }
                  searchPlaceholder={
                    i18n.language === "ar" ? "بحث..." : "Search..."
                  }
                  emptyText={
                    i18n.language === "ar"
                      ? "لا توجد نتائج"
                      : "No results found"
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.department")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.department_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label:
                      i18n.language === "ar" ? dept.name_ar : dept.name_en,
                  }))}
                  placeholder={
                    i18n.language === "ar"
                      ? "اختر القسم..."
                      : "Select a department..."
                  }
                  searchPlaceholder={
                    i18n.language === "ar" ? "بحث..." : "Search..."
                  }
                  emptyText={
                    i18n.language === "ar"
                      ? "لا توجد نتائج"
                      : "No results found"
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.job")} <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  value={formData.job_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, job_id: value })
                  }
                  options={jobs.map((job) => ({
                    value: job.id,
                    label: i18n.language === "ar" ? job.name_ar : job.name_en,
                  }))}
                  placeholder={
                    i18n.language === "ar" ? "اختر الوظيفة..." : "Select a job..."
                  }
                  searchPlaceholder={
                    i18n.language === "ar" ? "بحث..." : "Search..."
                  }
                  emptyText={
                    i18n.language === "ar"
                      ? "لا توجد نتائج"
                      : "No results found"
                  }
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-semibold text-primary border-b pb-2">
              📄 Documents & IDs
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.passportNo")} 🎤
                </Label>
                <VoiceInput
                  value={formData.passport_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, passport_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak passport number"
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.passportExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.passport_expiry || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, passport_expiry: e.target.value })
                  }
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.cardNo")} 🎤
                </Label>
                <VoiceInput
                  value={formData.card_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, card_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak card number"
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.cardExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.card_expiry || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, card_expiry: e.target.value })
                  }
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.emiratesId")} 🎤
                </Label>
                <VoiceInput
                  value={formData.emirates_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, emirates_id: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak Emirates ID"
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.emiratesIdExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.emirates_id_expiry || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emirates_id_expiry: e.target.value,
                    })
                  }
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.residenceNo")} 🎤
                </Label>
                <VoiceInput
                  value={formData.residence_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, residence_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak residence number"
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.residenceExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.residence_expiry || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, residence_expiry: e.target.value })
                  }
                  className="h-11 md:h-10"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-sm md:text-base font-semibold text-primary border-b pb-2">
              📞 Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.email")} 🎤
                </Label>
                <VoiceInput
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak email address"
                  className="h-11 md:h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs md:text-sm font-medium">
                  {t("employees.phone")} 🎤
                </Label>
                <VoiceInput
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak phone number"
                  type="tel"
                  className="h-11 md:h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto h-11 md:h-10 order-2 sm:order-1"
            >
              {t("common.cancel")}
            </Button>
            <Button 
              type="submit" 
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto h-11 md:h-10 order-1 sm:order-2"
            >
              {saveMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
