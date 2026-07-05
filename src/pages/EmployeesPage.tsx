import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/ui/voice-input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { MultiSelect } from "@/components/ui/multi-select";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentScanner } from "@/components/DocumentScanner";
import { BulkImportDialog } from "@/components/BulkImportDialog";
import {
  Plus,
  Edit,
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Camera,
  Upload,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import * as XLSX from "xlsx";

// Enable relative time plugin for dayjs
dayjs.extend(relativeTime);

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
  added_date: string | null;
  is_active: boolean;
  updated_at: string | null;
  avatar_url: string | null;
}

function EmployeeAvatar({
  avatarUrl,
  initial,
  sizeClass,
  textClass,
}: {
  avatarUrl: string | null | undefined;
  initial: string;
  sizeClass: string;
  textClass: string;
}) {
  const [failed, setFailed] = React.useState(false);

  // Reset failed state if the URL changes (e.g. after a new upload)
  React.useEffect(() => {
    setFailed(false);
  }, [avatarUrl]);

  return (
    <div
      className={`${sizeClass} rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold ${textClass}`}
    >
      {avatarUrl && !failed ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initial?.toUpperCase() || "?"
      )}
    </div>
  );
}

type ViewMode = "grid" | "table";
type StatusFilter =
  | "all"
  | "valid"
  | "expiring"
  | "expired"
  | "missing"
  | "missing_number"
  | "missing_date";

export function EmployeesPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportTarget, setExportTarget] = useState<"all" | "selected">("all");
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([
    "employee_no", "name_en", "name_ar", "nationality", "status",
    "company", "department", "job", "added_date",
    "passport_no", "passport_expiry", "card_no", "card_expiry",
    "emirates_id", "emirates_id_expiry", "residence_no", "residence_expiry",
    "email", "phone"
  ]);

  // Check if RTL
  const isRTL = i18n.language === "ar";

  // Filter states
  const [nationalityFilter, setNationalityFilter] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [jobFilter, setJobFilter] = useState<string[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("all"); // active, inactive, all
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all"); // all, 30days, 60days, 90days, custom
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [passportStatusFilter, setPassportStatusFilter] =
    useState<StatusFilter[]>([]);
  const [cardStatusFilter, setCardStatusFilter] = useState<StatusFilter[]>([]);
  const [emiratesIdStatusFilter, setEmiratesIdStatusFilter] =
    useState<StatusFilter[]>([]);
  const [residenceStatusFilter, setResidenceStatusFilter] = useState<StatusFilter[]>([]);

  // Apply URL parameters on mount
  useEffect(() => {
    const search = searchParams.get("search");
    const passport = searchParams.get("passport");
    const card = searchParams.get("card");
    const emiratesId = searchParams.get("emiratesId");
    const residence = searchParams.get("residence");
    const company = searchParams.get("company");
    const department = searchParams.get("department");
    const job = searchParams.get("job");
    const nationality = searchParams.get("nationality");
    const status = searchParams.get("status");
    const dateRange = searchParams.get("dateRange");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Splits a comma-separated URL param into an array, normalizing the legacy
    // "missing" value (from dashboard links) to "missing_number"
    const parseStatusParam = (raw: string | null): StatusFilter[] => {
      if (!raw) return [];
      return raw
        .split(",")
        .filter(Boolean)
        .map((v) => (v === "missing" ? "missing_number" : v)) as StatusFilter[];
    };
    const parseListParam = (raw: string | null): string[] =>
      raw ? raw.split(",").filter(Boolean) : [];

    // Apply search term from URL (from audit trail navigation)
    if (search) setSearchTerm(search);

    if (passport) setPassportStatusFilter(parseStatusParam(passport));
    if (card) setCardStatusFilter(parseStatusParam(card));
    if (emiratesId) setEmiratesIdStatusFilter(parseStatusParam(emiratesId));
    if (residence) setResidenceStatusFilter(parseStatusParam(residence));

    // Apply dashboard filters
    if (company) setCompanyFilter(parseListParam(company));
    if (department) setDepartmentFilter(parseListParam(department));
    if (job) setJobFilter(parseListParam(job));
    if (nationality) setNationalityFilter(parseListParam(nationality));
    if (status) setActiveStatusFilter(status); // active, inactive, or all

    // Apply date range filters
    if (dateRange) setDateRangeFilter(dateRange);
    if (startDate) setCustomStartDate(startDate);
    if (endDate) setCustomEndDate(endDate);

    // Show filters panel if any URL filter is present
    if (
      search ||
      passport ||
      card ||
      emiratesId ||
      residence ||
      company ||
      department ||
      job ||
      nationality ||
      status ||
      dateRange
    ) {
      setShowFilters(true);
    }
  }, [searchParams]);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(true);

  // Sort states
  const [sortColumn, setSortColumn] = useState<string>("employee_no");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

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

  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await supabase
        .from("companies")
        .select("*")
        .order("name_en");
      return data || [];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("departments")
        .select("*")
        .order("name_en");
      return data || [];
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("jobs").select("*").order("name_en");
      return data || [];
    },
  });

  const { data: nationalities = [] } = useQuery({
    queryKey: ["nationalities"],
    queryFn: async () => {
      const { data } = await supabase
        .from("nationalities")
        .select("*")
        .order("name_en");
      return data || [];
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

  // Bulk activate mutation
  const bulkActivateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: true })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSelectedIds([]);
      setShowBulkActions(false);
    },
  });

  // Bulk deactivate mutation
  const bulkDeactivateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("employees")
        .update({ is_active: false })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSelectedIds([]);
      setShowBulkActions(false);
    },
  });

  // Helper function to check document status
  const getDocumentStatus = (
    expiryDate: string | null
  ): StatusFilter | null => {
    if (!expiryDate) return null; // N/A dates return null to indicate no status
    const daysUntilExpiry = dayjs(expiryDate).diff(dayjs(), "day");
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 30) return "expiring";
    return "valid";
  };

  // Helper function to get localized nationality name
  const getNationalityName = (nationalityCode: string): string => {
    const nationality = nationalities.find(
      (nat: any) =>
        nat.name_en === nationalityCode || nat.code === nationalityCode
    );
    if (!nationality) return nationalityCode;
    return i18n.language === "ar" ? nationality.name_ar : nationality.name_en;
  };

  // Comprehensive filtering
  const filteredEmployees = useMemo(() => {
    const filtered = employees?.filter((emp: any) => {
      // Search filter - Enhanced for Arabic
      const searchLower = searchTerm.toLowerCase().trim();
      const searchOriginal = searchTerm.trim();
      const matchesSearch =
        !searchTerm ||
        emp.name_en?.toLowerCase().includes(searchLower) ||
        emp.name_ar?.toLowerCase().includes(searchLower) ||
        emp.name_ar?.includes(searchOriginal) ||
        emp.employee_no?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.phone?.toLowerCase().includes(searchLower) ||
        emp.phone?.includes(searchOriginal) ||
        emp.passport_no?.toLowerCase().includes(searchLower) ||
        emp.card_no?.toLowerCase().includes(searchLower) ||
        emp.emirates_id?.toLowerCase().includes(searchLower) ||
        emp.residence_no?.toLowerCase().includes(searchLower) ||
        emp.companies?.name_en?.toLowerCase().includes(searchLower) ||
        emp.companies?.name_ar?.toLowerCase().includes(searchLower) ||
        emp.companies?.name_ar?.includes(searchOriginal) ||
        emp.departments?.name_en?.toLowerCase().includes(searchLower) ||
        emp.departments?.name_ar?.toLowerCase().includes(searchLower) ||
        emp.departments?.name_ar?.includes(searchOriginal) ||
        emp.jobs?.name_en?.toLowerCase().includes(searchLower) ||
        emp.jobs?.name_ar?.toLowerCase().includes(searchLower) ||
        emp.jobs?.name_ar?.includes(searchOriginal);

      // Nationality filter
      const matchesNationality =
        nationalityFilter.length === 0 ||
        nationalityFilter.includes(emp.nationality);

      // Company filter
      const matchesCompany =
        companyFilter.length === 0 || companyFilter.includes(emp.company_id);

      // Department filter
      const matchesDepartment =
        departmentFilter.length === 0 ||
        departmentFilter.includes(emp.department_id);

      // Job filter
      const matchesJob = jobFilter.length === 0 || jobFilter.includes(emp.job_id);

      // Active status filter
      const matchesActiveStatus =
        activeStatusFilter === "all" ||
        (activeStatusFilter === "active" && emp.is_active === true) ||
        (activeStatusFilter === "inactive" && emp.is_active === false);

      // Passport status filter
      const passportStatus = getDocumentStatus(emp.passport_expiry);
      const matchesPassport =
        passportStatusFilter.length === 0 ||
        (passportStatusFilter.includes("missing_number") && !emp.passport_no) ||
        (passportStatusFilter.includes("missing_date") && !emp.passport_expiry) ||
        (passportStatus !== null && passportStatusFilter.includes(passportStatus));

      // Card status filter
      const cardStatus = getDocumentStatus(emp.card_expiry);
      const matchesCard =
        cardStatusFilter.length === 0 ||
        (cardStatusFilter.includes("missing_number") && !emp.card_no) ||
        (cardStatusFilter.includes("missing_date") && !emp.card_expiry) ||
        (cardStatus !== null && cardStatusFilter.includes(cardStatus));

      // Emirates ID status filter
      const emiratesIdStatus = getDocumentStatus(emp.emirates_id_expiry);
      const matchesEmiratesId =
        emiratesIdStatusFilter.length === 0 ||
        (emiratesIdStatusFilter.includes("missing_number") && !emp.emirates_id) ||
        (emiratesIdStatusFilter.includes("missing_date") &&
          !emp.emirates_id_expiry) ||
        (emiratesIdStatus !== null &&
          emiratesIdStatusFilter.includes(emiratesIdStatus));

      // Residence status filter
      const residenceStatus = getDocumentStatus(emp.residence_expiry);
      const matchesResidence =
        residenceStatusFilter.length === 0 ||
        (residenceStatusFilter.includes("missing_number") &&
          !emp.residence_no) ||
        (residenceStatusFilter.includes("missing_date") &&
          !emp.residence_expiry) ||
        (residenceStatus !== null &&
          residenceStatusFilter.includes(residenceStatus));

      // Date range filter (added_date)
      let matchesDateRange = true;
      if (dateRangeFilter !== "all" && emp.added_date) {
        if (dateRangeFilter === "custom") {
          // Custom date range
          if (customStartDate && customEndDate) {
            matchesDateRange =
              dayjs(emp.added_date).isAfter(
                dayjs(customStartDate).subtract(1, "day")
              ) &&
              dayjs(emp.added_date).isBefore(
                dayjs(customEndDate).add(1, "day")
              );
          } else if (customStartDate) {
            matchesDateRange = dayjs(emp.added_date).isAfter(
              dayjs(customStartDate).subtract(1, "day")
            );
          } else if (customEndDate) {
            matchesDateRange = dayjs(emp.added_date).isBefore(
              dayjs(customEndDate).add(1, "day")
            );
          }
        } else {
          // Preset ranges (30, 60, 90 days)
          const rangeDate =
            dateRangeFilter === "30days"
              ? dayjs().subtract(30, "day")
              : dateRangeFilter === "60days"
              ? dayjs().subtract(60, "day")
              : dateRangeFilter === "90days"
              ? dayjs().subtract(90, "day")
              : null;
          if (rangeDate) {
            matchesDateRange = dayjs(emp.added_date).isAfter(rangeDate);
          }
        }
      }

      return (
        matchesSearch &&
        matchesNationality &&
        matchesCompany &&
        matchesDepartment &&
        matchesJob &&
        matchesActiveStatus &&
        matchesPassport &&
        matchesCard &&
        matchesEmiratesId &&
        matchesResidence &&
        matchesDateRange
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
          aValue =
            i18n.language === "ar"
              ? a.companies?.name_ar
              : a.companies?.name_en;
          bValue =
            i18n.language === "ar"
              ? b.companies?.name_ar
              : b.companies?.name_en;
          break;
        case "department":
          aValue =
            i18n.language === "ar"
              ? a.departments?.name_ar
              : a.departments?.name_en;
          bValue =
            i18n.language === "ar"
              ? b.departments?.name_ar
              : b.departments?.name_en;
          break;
        case "job":
          aValue = i18n.language === "ar" ? a.jobs?.name_ar : a.jobs?.name_en;
          bValue = i18n.language === "ar" ? b.jobs?.name_ar : b.jobs?.name_en;
          break;
        case "is_active":
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case "added_date":
          aValue = a.added_date || "";
          bValue = b.added_date || "";
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

      // Compare values - use localeCompare with numeric for proper number sorting
      const comparison = String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    employees,
    searchTerm,
    nationalityFilter,
    companyFilter,
    departmentFilter,
    jobFilter,
    activeStatusFilter,
    passportStatusFilter,
    cardStatusFilter,
    emiratesIdStatusFilter,
    residenceStatusFilter,
    dateRangeFilter,
    customStartDate,
    customEndDate,
    sortColumn,
    sortDirection,
    i18n.language,
  ]);

  // Pagination logic
  const totalPages = Math.ceil((filteredEmployees?.length || 0) / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees?.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    nationalityFilter,
    companyFilter,
    departmentFilter,
    jobFilter,
    activeStatusFilter,
    passportStatusFilter,
    cardStatusFilter,
    emiratesIdStatusFilter,
    residenceStatusFilter,
  ]);

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsDialogOpen(true);
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

  const handleBulkActivate = () => {
    if (
      confirm(
        `Are you sure you want to activate ${selectedIds.length} selected employee(s)?`
      )
    ) {
      bulkActivateMutation.mutate(selectedIds);
    }
  };

  const handleBulkDeactivate = () => {
    if (
      confirm(
        `Are you sure you want to deactivate ${selectedIds.length} selected employee(s)?`
      )
    ) {
      bulkDeactivateMutation.mutate(selectedIds);
    }
  };

  const handleBulkExport = () => {
    const selectedEmployees = filteredEmployees?.filter((emp: any) =>
      selectedIds.includes(emp.id)
    );
    if (!selectedEmployees || selectedEmployees.length === 0) return;
    setExportTarget("selected");
    setExportDialogOpen(true);
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
    setNationalityFilter([]);
    setCompanyFilter([]);
    setDepartmentFilter([]);
    setJobFilter([]);
    setActiveStatusFilter("all");
    setPassportStatusFilter([]);
    setCardStatusFilter([]);
    setEmiratesIdStatusFilter([]);
    setResidenceStatusFilter([]);
    setDateRangeFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    // Clear URL parameters
    navigate("/employees", { replace: true });
  };

  const EXPORT_FIELD_DEFS = [
    { key: "employee_no", label: "Employee No" },
    { key: "name_en", label: "Name (English)" },
    { key: "name_ar", label: "Name (Arabic)" },
    { key: "nationality", label: "Nationality" },
    { key: "status", label: "Status" },
    { key: "added_date", label: "Added Date" },
    { key: "updated_at", label: "Last Updated" },
    { key: "company", label: "Company" },
    { key: "department", label: "Department" },
    { key: "job", label: "Job" },
    { key: "passport_no", label: "Passport No" },
    { key: "passport_expiry", label: "Passport Expiry" },
    { key: "card_no", label: "Card No" },
    { key: "card_expiry", label: "Card Expiry" },
    { key: "emirates_id", label: "Emirates ID" },
    { key: "emirates_id_expiry", label: "Emirates ID Expiry" },
    { key: "residence_no", label: "Residence No" },
    { key: "residence_expiry", label: "Residence Expiry" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const buildExportRow = (emp: any) => {
    const all: Record<string, string> = {
      employee_no: emp.employee_no || "",
      name_en: emp.name_en || "",
      name_ar: emp.name_ar || "",
      nationality: emp.nationality || "",
      status: emp.is_active ? "Active" : "Inactive",
      added_date: emp.added_date ? dayjs(emp.added_date).format("DD/MM/YYYY") : "",
      updated_at: emp.updated_at ? dayjs(emp.updated_at).format("DD/MM/YYYY HH:mm") : "",
      company: i18n.language === "ar" ? emp.companies?.name_ar || "" : emp.companies?.name_en || "",
      department: i18n.language === "ar" ? emp.departments?.name_ar || "" : emp.departments?.name_en || "",
      job: i18n.language === "ar" ? emp.jobs?.name_ar || "" : emp.jobs?.name_en || "",
      passport_no: emp.passport_no || "",
      passport_expiry: emp.passport_expiry ? dayjs(emp.passport_expiry).format("DD/MM/YYYY") : "",
      card_no: emp.card_no || "",
      card_expiry: emp.card_expiry ? dayjs(emp.card_expiry).format("DD/MM/YYYY") : "",
      emirates_id: emp.emirates_id || "",
      emirates_id_expiry: emp.emirates_id_expiry ? dayjs(emp.emirates_id_expiry).format("DD/MM/YYYY") : "",
      residence_no: emp.residence_no || "",
      residence_expiry: emp.residence_expiry ? dayjs(emp.residence_expiry).format("DD/MM/YYYY") : "",
      email: emp.email || "",
      phone: emp.phone || "",
    };
    const row: Record<string, string> = {};
    selectedExportFields.forEach((k) => {
      const def = EXPORT_FIELD_DEFS.find((d) => d.key === k);
      if (def) row[def.label] = all[k] ?? "";
    });
    return row;
  };

  const doExport = (empList: any[], filename: string) => {
    if (!empList || empList.length === 0) { alert("No data to export"); return; }
    const exportData = empList.map(buildExportRow);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    const maxWidth = 50;
    const colWidths = Object.keys(exportData[0]).map((key) => ({
      wch: Math.min(maxWidth, Math.max(key.length, ...exportData.map((r) => String(r[key] || "").length))),
    }));
    ws["!cols"] = colWidths;
    XLSX.writeFile(wb, filename);
  };

  const exportToExcel = () => {
    if (!filteredEmployees || filteredEmployees.length === 0) { alert("No data to export"); return; }
    setExportTarget("all");
    setExportDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      {/* Header - Compact Design */}
      <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">
            {t("employees.title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredEmployees?.length || 0}{" "}
            {t("employees.title").toLowerCase()}{" "}
            {filteredEmployees?.length !== employees?.length &&
              `(filtered from ${employees?.length})`}
          </p>
        </div>
        <div
          className={`flex gap-2 w-full md:w-auto ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Button
            onClick={handleAdd}
            className="gap-2 flex-1 md:flex-initial h-9"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {t("employees.addEmployee")}
            </span>
            <span className="sm:hidden">Add</span>
          </Button>
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="gap-2 flex-1 md:flex-initial h-9 bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900 text-green-700 dark:text-green-300"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">{t("Bulk Import")}</span>
            <span className="sm:hidden">{t("Import")}</span>
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="gap-2 flex-1 md:flex-initial h-9"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t("filters.exportExcel")}</span>
            <span className="sm:hidden">{t("common.export")}</span>
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar - Compact Design */}
      {showBulkActions && (
        <Card className="p-2 md:p-3 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 shadow-lg">
          <div
            className={`flex flex-col gap-2 md:flex-row md:justify-between md:items-center ${
              isRTL ? "md:flex-row-reverse" : ""
            }`}
          >
            <div
              className={`flex items-center gap-2 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="font-semibold text-xs md:text-sm text-blue-900 dark:text-blue-100">
                {selectedIds.length}{" "}
                {selectedIds.length === 1 ? "employee" : "employees"} selected
              </span>
            </div>
            <div
              className={`flex gap-2 w-full md:w-auto ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <Button
                onClick={handleBulkActivate}
                variant="outline"
                className="gap-2 flex-1 md:flex-initial h-8 text-xs border-green-500 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950"
                size="sm"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Activate</span>
              </Button>
              <Button
                onClick={handleBulkDeactivate}
                variant="outline"
                className="gap-2 flex-1 md:flex-initial h-8 text-xs border-gray-500 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-950"
                size="sm"
              >
                <Square className="w-4 h-4" />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
              <Button
                onClick={handleBulkExport}
                variant="outline"
                className="gap-2 flex-1 md:flex-initial h-8 text-xs"
                size="sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">Export Selected</span>
                <span className="sm:hidden">Export</span>
              </Button>
              <Button
                onClick={handleBulkDelete}
                variant="destructive"
                className="gap-2 flex-1 md:flex-initial h-8 text-xs"
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
                className="h-8 px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters & Controls - Compact Design */}
      <Card className="p-2 md:p-3">
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
            isRTL ? "sm:flex-row-reverse" : ""
          }`}
        >
          <div
            className={`flex items-center gap-2 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Filter className="w-4 h-4 text-primary flex-shrink-0" />
            <h2 className="text-sm md:text-base font-semibold">
              {t("filters.filtersControl")}
            </h2>
            {(nationalityFilter.length > 0 ||
              companyFilter.length > 0 ||
              jobFilter.length > 0 ||
              departmentFilter.length > 0 ||
              searchTerm) && (
              <Badge variant="secondary" className="text-xs">
                {[
                  searchTerm ? 1 : 0,
                  nationalityFilter.length,
                  companyFilter.length,
                  jobFilter.length,
                  departmentFilter.length,
                ].reduce((a, b) => a + b, 0)}{" "}
                active
              </Badge>
            )}
          </div>
          <div
            className={`flex gap-1 md:gap-2 w-full sm:w-auto ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              size="sm"
              className="h-8 text-xs px-2 md:px-3 flex-1 sm:flex-initial"
            >
              <span className="hidden sm:inline">
                {showFilters ? t("common.hide") : t("common.show")}
              </span>
              <Filter className="w-4 h-4 sm:hidden" />
            </Button>
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="gap-1 h-8 text-xs px-2 md:px-3 flex-1 sm:flex-initial"
            >
              <X className="w-3 h-3" />
              <span className="hidden md:inline">{t("filters.clearAll")}</span>
              <span className="md:hidden">{t("filters.clearAll")}</span>
            </Button>
            {/* View Mode Toggle - Works on All Screen Sizes */}
            <div className="flex gap-0.5 border rounded-md">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-r-none h-8 px-2"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                className="rounded-l-none h-8 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-2 mt-2">
            {/* Active Filters Display */}
            {(nationalityFilter.length > 0 ||
              companyFilter.length > 0 ||
              jobFilter.length > 0 ||
              departmentFilter.length > 0 ||
              dateRangeFilter !== "all" ||
              searchTerm) && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                  Active:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Search: "{searchTerm.slice(0, 20)}
                    {searchTerm.length > 20 ? "..." : ""}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {nationalityFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Nationality
                    {nationalityFilter.length > 1
                      ? ` (${nationalityFilter.length})`
                      : `: ${nationalityFilter[0]}`}
                    <button
                      onClick={() => setNationalityFilter([])}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {companyFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Company{companyFilter.length > 1 ? ` (${companyFilter.length})` : ""}
                    <button
                      onClick={() => setCompanyFilter([])}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {jobFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Job{jobFilter.length > 1 ? ` (${jobFilter.length})` : ""}
                    <button
                      onClick={() => setJobFilter([])}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {departmentFilter.length > 0 && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Department
                    {departmentFilter.length > 1 ? ` (${departmentFilter.length})` : ""}
                    <button
                      onClick={() => setDepartmentFilter([])}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {dateRangeFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Date:{" "}
                    {dateRangeFilter === "custom"
                      ? `${customStartDate || "?"} to ${customEndDate || "?"}`
                      : dateRangeFilter === "30days"
                      ? "Last 30 Days"
                      : dateRangeFilter === "60days"
                      ? "Last 60 Days"
                      : dateRangeFilter === "90days"
                      ? "Last 90 Days"
                      : dateRangeFilter}
                    <button
                      onClick={() => {
                        setDateRangeFilter("all");
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Filter Grid - Compact Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {/* Nationality Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("employees.nationality")}
                </Label>
                <MultiSelect
                  values={nationalityFilter}
                  onValuesChange={setNationalityFilter}
                  options={nationalities.map((nat: any) => ({
                    value: nat.name_en,
                    label: i18n.language === "ar" ? nat.name_ar : nat.name_en,
                  }))}
                  allLabel={t("filters.allNationalities")}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                />
              </div>

              {/* Company Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("employees.company")}
                </Label>
                <MultiSelect
                  values={companyFilter}
                  onValuesChange={setCompanyFilter}
                  options={companies.map((company) => ({
                    value: company.id,
                    label: i18n.language === "ar" ? company.name_ar : company.name_en,
                  }))}
                  allLabel={t("filters.allCompanies")}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                />
              </div>

              {/* Job Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("employees.job")}
                </Label>
                <MultiSelect
                  values={jobFilter}
                  onValuesChange={setJobFilter}
                  options={jobs.map((job) => ({
                    value: job.id,
                    label: i18n.language === "ar" ? job.name_ar : job.name_en,
                  }))}
                  allLabel={t("filters.allJobs")}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                />
              </div>

              {/* Department Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("employees.department")}
                </Label>
                <MultiSelect
                  values={departmentFilter}
                  onValuesChange={setDepartmentFilter}
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label: i18n.language === "ar" ? dept.name_ar : dept.name_en,
                  }))}
                  allLabel={t("filters.allDepartments")}
                  searchPlaceholder={i18n.language === "ar" ? "بحث..." : "Search..."}
                />
              </div>

              {/* Active Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("filters.activeStatus")}
                </Label>
                <Select
                  value={activeStatusFilter}
                  onValueChange={setActiveStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("filters.activeEmployees")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      {t("filters.activeEmployees")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("filters.inactiveEmployees")}
                    </SelectItem>
                    <SelectItem value="all">
                      {t("filters.allEmployees")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Added Date
                </Label>
                <Select
                  value={dateRangeFilter}
                  onValueChange={setDateRangeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="60days">Last 60 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="custom">Custom Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Passport Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("filters.passportStatus")}
                </Label>
                <MultiSelect
                  values={passportStatusFilter}
                  onValuesChange={(v) => setPassportStatusFilter(v as StatusFilter[])}
                  options={[
                    { value: "valid", label: t("filters.valid") },
                    { value: "expiring", label: t("filters.expiring") },
                    { value: "expired", label: t("filters.expired") },
                    { value: "missing_date", label: t("filters.missingExpiry") },
                    { value: "missing_number", label: t("filters.missingPassportNo") },
                  ]}
                  allLabel={t("filters.allStatus")}
                />
              </div>

              {/* Card Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("filters.cardStatus")}
                </Label>
                <MultiSelect
                  values={cardStatusFilter}
                  onValuesChange={(v) => setCardStatusFilter(v as StatusFilter[])}
                  options={[
                    { value: "valid", label: t("filters.valid") },
                    { value: "expiring", label: t("filters.expiring") },
                    { value: "expired", label: t("filters.expired") },
                    { value: "missing_date", label: t("filters.missingExpiry") },
                    { value: "missing_number", label: t("filters.missingCardNo") },
                  ]}
                  allLabel={t("filters.allStatus")}
                />
              </div>

              {/* Emirates ID Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("filters.emiratesIdStatus")}
                </Label>
                <MultiSelect
                  values={emiratesIdStatusFilter}
                  onValuesChange={(v) => setEmiratesIdStatusFilter(v as StatusFilter[])}
                  options={[
                    { value: "valid", label: t("filters.valid") },
                    { value: "expiring", label: t("filters.expiring") },
                    { value: "expired", label: t("filters.expired") },
                    { value: "missing_date", label: t("filters.missingExpiry") },
                    { value: "missing_number", label: t("filters.missingEmiratesId") },
                  ]}
                  allLabel={t("filters.allStatus")}
                />
              </div>

              {/* Residence Status Filter */}
              <div>
                <Label className="text-xs font-medium mb-1 block">
                  {t("filters.residenceStatus")}
                </Label>
                <MultiSelect
                  values={residenceStatusFilter}
                  onValuesChange={(v) => setResidenceStatusFilter(v as StatusFilter[])}
                  options={[
                    { value: "valid", label: t("filters.valid") },
                    { value: "expiring", label: t("filters.expiring") },
                    { value: "expired", label: t("filters.expired") },
                    { value: "missing_date", label: t("filters.missingExpiry") },
                    { value: "missing_number", label: t("filters.missingResidenceNo") },
                  ]}
                  allLabel={t("filters.allStatus")}
                />
              </div>
            </div>

            {/* Custom Date Range Inputs - Show only when custom is selected */}
            {dateRangeFilter === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="customStartDate"
                    className="text-xs font-medium"
                  >
                    From Date
                  </Label>
                  <Input
                    id="customStartDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || undefined}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="customEndDate"
                    className="text-xs font-medium"
                  >
                    To Date
                  </Label>
                  <Input
                    id="customEndDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate || undefined}
                    className="h-9"
                  />
                </div>
              </div>
            )}

            {/* Quick Search - Mobile Optimized */}
            {/* Enhanced Quick Search with Clear Button */}
            <div>
              <Label className="text-xs font-medium mb-1 flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t("filters.quickSearch")}
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
                <Search className="absolute left-3 w-4 h-4 text-gray-400 flex-shrink-0 pointer-events-none" />
                <Input
                  placeholder="Search by name, employee #, email, phone, passport, emirates ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 h-9 pl-10 pr-10"
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
                💡 Tip: Search works across all fields - names, documents,
                contact info
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Employee Cards/Table - Mobile Optimized with Fixed Height */}
      {viewMode === "grid" ? (
        <>
          {paginatedEmployees && paginatedEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 min-h-[500px]">
              {paginatedEmployees.map((employee: any) => (
                <Card
                  key={employee.id}
                  className={`p-4 md:p-5 space-y-3 transition-all duration-200 hover:shadow-lg ${
                    selectedIds.includes(employee.id)
                      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md"
                      : ""
                  } ${
                    !employee.is_active
                      ? "opacity-60 bg-gray-50 dark:bg-gray-900/50"
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
                      {/* Avatar */}
                      <div className="mt-0.5">
                        <EmployeeAvatar
                          avatarUrl={employee.avatar_url}
                          initial={(i18n.language === "ar" ? employee.name_ar : employee.name_en)?.charAt(0) || "?"}
                          sizeClass="w-10 h-10"
                          textClass="text-sm"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base md:text-lg truncate">
                          {i18n.language === "ar"
                            ? employee.name_ar
                            : employee.name_en}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {employee.employee_no}
                          </p>
                          {employee.is_active !== undefined && (
                            <Badge
                              variant={
                                employee.is_active ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              {employee.is_active
                                ? t("filters.activeEmployees")
                                : t("filters.inactiveEmployees")}
                            </Badge>
                          )}
                        </div>
                        {employee.added_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("employees.addedDate")}:{" "}
                            {dayjs(employee.added_date).format("DD/MM/YYYY")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(employee)}
                      className="h-9 w-9 p-0 touch-manipulation active:scale-95 transition-transform flex-shrink-0"
                      title={t("common.edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm md:text-base">
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        {t("employees.nationality")}:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {getNationalityName(employee.nationality) || "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        {t("employees.company")}:
                      </span>{" "}
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
                      <span className="font-medium text-xs md:text-sm">
                        {t("employees.job")}:
                      </span>{" "}
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
                      <span className="text-muted-foreground">
                        {employee.passport_no || "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        Passport Expiry:
                      </span>{" "}
                      <span
                        className={getExpiryStatus(employee.passport_expiry)}
                      >
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
                      <span className="text-muted-foreground">
                        {employee.emirates_id || "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        {t("employees.emiratesIdExpiry")}:
                      </span>{" "}
                      <span
                        className={getExpiryStatus(employee.emirates_id_expiry)}
                      >
                        {employee.emirates_id_expiry
                          ? dayjs(employee.emirates_id_expiry).format(
                              "DD/MM/YYYY"
                            )
                          : "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        Residence No:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {employee.residence_no || "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        Residence Expiry:
                      </span>{" "}
                      <span
                        className={getExpiryStatus(employee.residence_expiry)}
                      >
                        {employee.residence_expiry
                          ? dayjs(employee.residence_expiry).format(
                              "DD/MM/YYYY"
                            )
                          : "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        Email:
                      </span>{" "}
                      <span className="text-muted-foreground text-xs">
                        {employee.email || "N/A"}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-medium text-xs md:text-sm">
                        Phone:
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {employee.phone || "N/A"}
                      </span>
                    </p>
                  </div>

                  {/* Timeline Footer - Added & Updated Info */}
                  {(employee.added_date || employee.updated_at) && (
                    <div className="mt-3 pt-3 border-t border-muted">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {employee.added_date && (
                          <div className="flex items-center gap-1">
                            <Plus className="w-3 h-3" />
                            <span>
                              {i18n.language === "ar" ? "أضيف" : "Added"}{" "}
                              {dayjs(employee.added_date).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        )}
                        {employee.updated_at && (
                          <div className="flex items-center gap-1">
                            <Edit className="w-3 h-3" />
                            <span className="truncate">
                              {i18n.language === "ar" ? "آخر تحديث" : "Updated"}{" "}
                              {dayjs(employee.updated_at).fromNow()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">No employees found</p>
                <p className="text-sm mt-2">
                  Try adjusting your filters or search terms
                </p>
              </div>
            </div>
          )}

          {/* Pagination for Grid View */}
          {paginatedEmployees &&
            paginatedEmployees.length > 0 &&
            totalPages > 1 && (
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredEmployees?.length || 0
                      )}{" "}
                      of {filteredEmployees?.length || 0} employees
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
        </>
      ) : (
        <>
          {/* Table View - Sticky Header with Smooth Scrolling */}
          <Card className="overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto max-h-[calc(100vh-300px)] min-h-[500px] overflow-y-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-muted dark:bg-gray-800 shadow-md">
                    <th className="p-2 md:p-3 w-10 bg-muted dark:bg-gray-800">
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
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("employee_no")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.employeeNo")}
                        <SortIcon column="employee_no" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800 w-48 max-w-xs"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.name")}
                        <SortIcon column="name" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("nationality")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.nationality")}
                        <SortIcon column="nationality" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("company")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.company")}
                        <SortIcon column="company" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("department")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.department")}
                        <SortIcon column="department" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("job")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.job")}
                        <SortIcon column="job" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("added_date")}
                    >
                      <div className="flex items-center gap-1">
                        {t("employees.addedDate")}
                        <SortIcon column="added_date" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("passport")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.passport")}
                        <SortIcon column="passport" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("card_expiry")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.cardExpiry")}
                        <SortIcon column="card_expiry" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("emirates_id")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.emiratesId")}
                        <SortIcon column="emirates_id" />
                      </div>
                    </th>
                    <th
                      className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm cursor-pointer hover:bg-muted/80 select-none active:bg-muted transition-colors bg-muted dark:bg-gray-800"
                      onClick={() => handleSort("residence")}
                    >
                      <div className="flex items-center gap-1">
                        {t("table.residence")}
                        <SortIcon column="residence" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees?.map((employee: any) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
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
                      <td className="p-2 md:p-3 font-medium text-xs md:text-sm">
                        {employee.employee_no}
                      </td>
                      <td className="p-2 md:p-3 text-xs md:text-sm w-52 max-w-xs">
                        <div className="flex items-center gap-2 group">
                          {/* Avatar circle */}
                          <EmployeeAvatar
                            avatarUrl={employee.avatar_url}
                            initial={(i18n.language === "ar" ? employee.name_ar : employee.name_en)?.charAt(0) || "?"}
                            sizeClass="w-7 h-7"
                            textClass="text-xs"
                          />
                          <span className="truncate flex-1">
                            {i18n.language === "ar"
                              ? employee.name_ar
                              : employee.name_en}
                          </span>
                          <span
                            className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                              employee.is_active
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                            title={
                              employee.is_active
                                ? t("filters.activeEmployees")
                                : t("filters.inactiveEmployees")
                            }
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(employee)}
                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            title={t("common.edit")}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2 md:p-3 text-xs md:text-sm">
                        {getNationalityName(employee.nationality)}
                      </td>
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
                      <td className="p-2 md:p-3 text-xs md:text-sm">
                        <div className="space-y-0.5">
                          <div className="font-medium">
                            {employee.added_date
                              ? dayjs(employee.added_date).format("DD/MM/YYYY")
                              : "N/A"}
                          </div>
                          {employee.updated_at && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Edit className="w-2.5 h-2.5" />
                              <span
                                title={dayjs(employee.updated_at).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              >
                                {dayjs(employee.updated_at).fromNow()}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2 md:p-3">
                        <div className="text-[10px] md:text-xs">
                          <div>{employee.passport_no || "N/A"}</div>
                          <div
                            className={getExpiryStatus(
                              employee.passport_expiry
                            )}
                          >
                            {employee.passport_expiry
                              ? dayjs(employee.passport_expiry).format(
                                  "DD/MM/YYYY"
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="p-2 md:p-3">
                        <div className="text-[10px] md:text-xs">
                          <div>{employee.card_no || "N/A"}</div>
                          <div
                            className={getExpiryStatus(employee.card_expiry)}
                          >
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
                            className={getExpiryStatus(
                              employee.emirates_id_expiry
                            )}
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
                            className={getExpiryStatus(
                              employee.residence_expiry
                            )}
                          >
                            {employee.residence_expiry
                              ? dayjs(employee.residence_expiry).format(
                                  "DD/MM/YYYY"
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!filteredEmployees || filteredEmployees.length === 0) && (
                <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium">No employees found</p>
                    <p className="text-sm mt-2">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Table info footer */}
            {filteredEmployees && filteredEmployees.length > 0 && (
              <div className="border-t p-3 bg-muted/20 text-center text-sm text-muted-foreground">
                Showing {filteredEmployees.length} employee
                {filteredEmployees.length !== 1 ? "s" : ""} • Scroll to view all
              </div>
            )}
          </Card>
        </>
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

      {/* Bulk Import Dialog */}
      <BulkImportDialog
        open={isBulkImportOpen}
        onOpenChange={setIsBulkImportOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["employees"] });
          setIsBulkImportOpen(false);
        }}
        companies={companies || []}
        departments={departments || []}
        jobs={jobs || []}
        nationalities={nationalities || []}
      />

      {/* Export Fields Selection Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              {exportTarget === "all"
                ? `Export ${filteredEmployees?.length || 0} Employees`
                : `Export ${selectedIds.length} Selected Employees`}
            </DialogTitle>
            <DialogDescription>
              Choose which fields to include in the Excel export.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2 mb-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedExportFields(EXPORT_FIELD_DEFS.map(d => d.key))}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedExportFields([])}>
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
              {EXPORT_FIELD_DEFS.map((field) => (
                <label key={field.key} className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedExportFields.includes(field.key)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedExportFields(prev => [...prev, field.key]);
                      } else {
                        setSelectedExportFields(prev => prev.filter(k => k !== field.key));
                      }
                    }}
                    className="w-4 h-4 accent-blue-600"
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (selectedExportFields.length === 0) { alert("Please select at least one field"); return; }
                const empList = exportTarget === "all"
                  ? filteredEmployees || []
                  : (filteredEmployees || []).filter((e: any) => selectedIds.includes(e.id));
                const filename = exportTarget === "all"
                  ? `Employees_${dayjs().format("YYYY-MM-DD")}.xlsx`
                  : `Selected_Employees_${dayjs().format("YYYY-MM-DD")}.xlsx`;
                doExport(empList, filename);
                setExportDialogOpen(false);
              }}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export ({selectedExportFields.length} fields)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  const [formData, setFormData] = useState<any>(
    employee || {
      added_date: dayjs().format("YYYY-MM-DD"),
      is_active: true,
    }
  );

  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerType, setScannerType] = useState<
    "passport" | "emirates_id" | "work_card"
  >("passport");

  // Handle data extracted from OCR with smart merging
  const handleDataExtracted = (data: any) => {
    // Smart nationality matching - map OCR result to existing nationalities
    if (data.nationality && nationalities && nationalities.length > 0) {
      const extractedNat = data.nationality.toLowerCase();

      // Try to find exact match first
      let matchedNationality = nationalities.find(
        (nat: any) => nat.name_en?.toLowerCase() === extractedNat
      );

      // If no exact match, try partial matching (e.g., "Syrian Arab Republic" → "Syria")
      if (!matchedNationality) {
        matchedNationality = nationalities.find((nat: any) => {
          const natName = nat.name_en?.toLowerCase() || "";
          const natWords = natName.split(" ");
          const extractedWords = extractedNat.split(" ");

          // Check if any word matches (e.g., "Syrian" matches "Syria")
          return natWords.some((word) =>
            extractedWords.some(
              (extractedWord) =>
                word.includes(extractedWord) || extractedWord.includes(word)
            )
          );
        });
      }

      // If still no match, try similarity-based matching
      if (!matchedNationality) {
        // Common nationality mappings
        const nationalityMappings: { [key: string]: string[] } = {
          syria: ["syrian", "syrian arab republic", "syr"],
          india: ["indian", "ind"],
          pakistan: ["pakistani", "pak"],
          bangladesh: ["bangladeshi", "bgd"],
          philippines: ["filipino", "phl"],
          egypt: ["egyptian", "egy"],
          jordan: ["jordanian", "jor"],
          lebanon: ["lebanese", "lbn"],
          sudan: ["sudanese", "sdn"],
          afghanistan: ["afghan", "afg"],
          nepal: ["nepali", "npl"],
          "sri lanka": ["sri lankan", "lka"],
          indonesia: ["indonesian", "idn"],
        };

        // Find match using mapping
        for (const [dbNat, variants] of Object.entries(nationalityMappings)) {
          if (variants.some((variant) => extractedNat.includes(variant))) {
            matchedNationality = nationalities.find((nat: any) =>
              nat.name_en?.toLowerCase().includes(dbNat)
            );
            if (matchedNationality) break;
          }
        }
      }

      // Use matched nationality NAME (not ID) since database stores VARCHAR
      if (matchedNationality) {
        data.nationality = matchedNationality.name_en; // Store the name, not the ID
      } else {
        // If no match found, remove nationality to avoid invalid data
        delete data.nationality;
      }
    }

    // SMART MERGE: Only update fields that have new valid data
    // Don't overwrite existing good data with empty/null values
    const mergedData = { ...formData };
    
    for (const [key, value] of Object.entries(data)) {
      // Only update if:
      // 1. New value is not null/undefined/empty string
      // 2. OR existing value is already empty (allow any update)
      if (value !== null && value !== undefined && value !== '') {
        mergedData[key] = value;
      } else if (!formData[key]) {
        // If existing field is empty, allow the update (even if new value is empty)
        mergedData[key] = value;
      }
      // Otherwise skip - keeps existing good data
    }

    setFormData(mergedData);
    setScannerOpen(false);
  };

  React.useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        added_date: dayjs().format("YYYY-MM-DD"),
        is_active: true,
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
  }, [employee]);

  // Avatar state
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = React.useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate size (max 300KB) and type
    if (file.size > 512 * 1024) {
      alert("Photo must be under 512KB. Please compress it first.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (employeeId: string): Promise<string | null> => {
    if (!avatarFile) return formData.avatar_url || null;
    setAvatarUploading(true);
    try {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${employeeId}/avatar.${ext}`;
      const { error } = await supabase.storage
        .from("employee-avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
      if (error) throw error;
      const { data } = supabase.storage.from("employee-avatars").getPublicUrl(path);
      return data.publicUrl + `?t=${Date.now()}`;
    } catch (err: any) {
      console.error("Avatar upload failed:", err.message);
      return null;
    } finally {
      setAvatarUploading(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      // Clean data: remove nested objects and keep only valid columns
      const cleanData: any = {
        employee_no: data.employee_no,
        name_en: data.name_en,
        name_ar: data.name_ar,
        nationality: data.nationality,
        company_id: data.company_id || null,
        department_id: data.department_id || null,
        job_id: data.job_id || null,
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
        added_date: data.added_date || null,
        is_active: data.is_active !== false,
        avatar_url: data.avatar_url || null,
      };

      if (employee) {
        // Upload avatar first if changed
        if (avatarFile) {
          const url = await uploadAvatar(employee.id);
          if (url) cleanData.avatar_url = url;
        }
        const { error } = await supabase
          .from("employees")
          .update(cleanData)
          .eq("id", employee.id);
        if (error) throw error;
      } else {
        // Insert first to get id, then upload avatar
        const { data: inserted, error } = await supabase
          .from("employees")
          .insert([cleanData])
          .select("id")
          .single();
        if (error) throw error;
        if (avatarFile && inserted) {
          const url = await uploadAvatar(inserted.id);
          if (url) {
            await supabase.from("employees").update({ avatar_url: url }).eq("id", inserted.id);
          }
        }
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
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-3 sm:p-4 md:p-6 gap-0">
        <DialogHeader className="space-y-1.5 sm:space-y-2 pb-3 sm:pb-4 border-b shrink-0">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold">
            {employee
              ? t("employees.editEmployee")
              : t("employees.addEmployee")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm md:text-base leading-relaxed">
            {employee
              ? "Edit employee information and document details"
              : "Add a new employee to the system with all required information"}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Basic Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📋</span>
              <span>Basic Information</span>
            </h3>
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
              <EmployeeAvatar
                avatarUrl={avatarPreview || formData.avatar_url}
                initial={(formData.name_en || formData.name_ar || "?").charAt(0)}
                sizeClass="w-16 h-16"
                textClass="text-xl"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-1">Employee Photo</p>
                <p className="text-xs text-muted-foreground mb-2">Max 512KB · JPG/PNG/WEBP</p>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    {(formData.avatar_url || avatarPreview) ? "Change Photo" : "Upload Photo"}
                  </span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </label>
                {(formData.avatar_url || avatarPreview) && (
                  <button
                    type="button"
                    className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      setFormData({ ...formData, avatar_url: null });
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.employeeNo")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <VoiceInput
                  value={formData.employee_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Type or say numbers"
                  required
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.nameEn")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <VoiceInput
                  value={formData.name_en || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name_en: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Type or click mic to speak"
                  required
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.nameAr")}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <VoiceInput
                  value={formData.name_ar || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name_ar: e.target.value })
                  }
                  voiceLanguage="ar-SA"
                  placeholder="اكتب أو انقر على الميكروفون للتحدث"
                  required
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.addedDate")}
                </Label>
                <Input
                  type="date"
                  value={formData.added_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, added_date: e.target.value })
                  }
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-3 pt-2 sm:pt-6">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active !== false}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked === true })
                  }
                  className="w-5 h-5 sm:w-4 sm:h-4"
                />
                <Label
                  htmlFor="is_active"
                  className="text-sm sm:text-base font-semibold cursor-pointer text-gray-700 dark:text-gray-300"
                >
                  {t("employees.isActive")}
                </Label>
              </div>
            </div>
          </div>

          {/* Company Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🏢</span>
              <span>Company Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.company")}
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
                    i18n.language === "ar"
                      ? "اختر الشركة..."
                      : "Select a company..."
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.department")}
                </Label>
                <SearchableSelect
                  value={formData.department_id || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department_id: value })
                  }
                  options={departments.map((dept) => ({
                    value: dept.id,
                    label: i18n.language === "ar" ? dept.name_ar : dept.name_en,
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
              <div className="space-y-1.5 sm:space-y-2 sm:col-span-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.job")}
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
                    i18n.language === "ar"
                      ? "اختر الوظيفة..."
                      : "Select a job..."
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
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📄</span>
              <span>Documents & IDs</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.passportNo")}
                </Label>
                <div className="flex gap-2">
                  <VoiceInput
                    value={formData.passport_no || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, passport_no: e.target.value })
                    }
                    voiceLanguage="en-US"
                    placeholder="Speak passport number"
                    className="h-12 sm:h-11 text-base sm:text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannerType("passport");
                      setScannerOpen(true);
                    }}
                    className="shrink-0 h-12 sm:h-11"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.passportExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.passport_expiry || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passport_expiry: e.target.value,
                    })
                  }
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.cardNo")}
                </Label>
                <div className="flex gap-2">
                  <VoiceInput
                    value={formData.card_no || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, card_no: e.target.value })
                    }
                    voiceLanguage="en-US"
                    placeholder="Speak card number"
                    className="h-12 sm:h-11 text-base sm:text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannerType("work_card");
                      setScannerOpen(true);
                    }}
                    className="shrink-0 h-12 sm:h-11"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.cardExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.card_expiry || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, card_expiry: e.target.value })
                  }
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.emiratesId")}
                </Label>
                <div className="flex gap-2">
                  <VoiceInput
                    value={formData.emirates_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, emirates_id: e.target.value })
                    }
                    voiceLanguage="en-US"
                    placeholder="Speak Emirates ID"
                    className="h-12 sm:h-11 text-base sm:text-sm flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setScannerType("emirates_id");
                      setScannerOpen(true);
                    }}
                    className="shrink-0 h-12 sm:h-11"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Scan
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
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
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.residenceNo")}
                </Label>
                <VoiceInput
                  value={formData.residence_no || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, residence_no: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak residence number"
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.residenceExpiry")}
                </Label>
                <Input
                  type="date"
                  value={formData.residence_expiry || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      residence_expiry: e.target.value,
                    })
                  }
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <span className="text-xl sm:text-2xl">📞</span>
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.email")}
                </Label>
                <VoiceInput
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak email address"
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t("employees.phone")}
                </Label>
                <VoiceInput
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  voiceLanguage="en-US"
                  placeholder="Speak phone number"
                  type="tel"
                  className="h-12 sm:h-11 text-base sm:text-sm"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 mt-6 flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-semibold order-2 sm:order-1"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || avatarUploading}
              className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-semibold order-1 sm:order-2"
            >
              {(saveMutation.isPending || avatarUploading) ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {avatarUploading ? "Uploading photo..." : t("common.loading")}
                </span>
              ) : t("common.save")}
            </Button>
          </DialogFooter>
        </form>

        {/* Document Scanner */}
        <DocumentScanner
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onDataExtracted={handleDataExtracted}
          documentType={scannerType}
        />
      </DialogContent>
    </Dialog>
  );
}
