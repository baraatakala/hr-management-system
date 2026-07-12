import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  Plus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";
import { QuickAddReference } from "./QuickAddReference";

interface ImportRow {
  row: number;
  data: Record<string, unknown>;
  status: "pending" | "success" | "error" | "warning";
  message?: string;
  employeeId?: string;
  // Tracked separately from `message` so that fixing a reference field
  // (company/department/job/nationality) via the preview dropdowns can
  // recompute errors without accidentally discarding a still-unresolved
  // "employee number already exists" finding.
  duplicateError?: string;
}

interface Company {
  id: string;
  name_en: string;
  name_ar?: string;
  code?: string;
}

interface Department {
  id: string;
  name_en: string;
  name_ar?: string;
  code?: string;
}

interface Job {
  id: string;
  name_en: string;
  name_ar?: string;
  code?: string;
}

interface Nationality {
  id: string;
  name_en: string;
  name_ar?: string;
  code?: string;
}

interface ReferenceLists {
  companies: Company[];
  departments: Department[];
  jobs: Job[];
  nationalities: Nationality[];
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  /** Fired as soon as any row is successfully inserted, even if the batch
   *  also has failures — lets the parent refresh its employee list in the
   *  background without forcing the results screen to close. */
  onImportComplete?: () => void;
  companies: Company[];
  departments: Department[];
  jobs: Job[];
  nationalities: Nationality[];
}

// Re-checks the required fields and the four reference-data fields
// (nationality/company/department/job) against the given lookup lists.
// Used both right after parsing the file and any time a row is edited
// (dropdown pick or Quick Add), so a "fixed" row is always re-validated
// the same way instead of silently keeping a stale error.
function computeReferenceErrors(
  data: Record<string, unknown>,
  refs: ReferenceLists
): string[] {
  const errors: string[] = [];
  if (!data.employee_no?.toString().trim()) errors.push("Employee number required");
  if (!data.name_en?.toString().trim()) errors.push("Name (EN) required");
  if (!data.name_ar?.toString().trim()) errors.push("Name (AR) required");

  if (data.nationality) {
    const match = refs.nationalities.find(
      (n) => n.name_en?.toLowerCase() === String(data.nationality).toLowerCase()
    );
    if (!match) errors.push(`Nationality "${data.nationality}" not found`);
  }
  if (data.company_name) {
    const match = refs.companies.find((c) => c.id === data.company_id);
    if (!match) errors.push(`Company "${data.company_name}" not found`);
  }
  if (data.department_name) {
    const match = refs.departments.find((d) => d.id === data.department_id);
    if (!match) errors.push(`Department "${data.department_name}" not found`);
  }
  if (data.job_name) {
    const match = refs.jobs.find((j) => j.id === data.job_id);
    if (!match) errors.push(`Job "${data.job_name}" not found`);
  }
  return errors;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onSuccess,
  onImportComplete,
  companies,
  departments,
  jobs,
  nationalities,
}: BulkImportDialogProps) {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportRow[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "results">("upload");
  const [revalidatingRow, setRevalidatingRow] = useState<number | null>(null);
  const [quickAddDialog, setQuickAddDialog] = useState<{
    type: "nationality" | "company" | "department" | "job";
    value: string;
    rowIndex: number;
  } | null>(null);

  // Download Excel template
  const downloadTemplate = () => {
    // Use ACTUAL data from this Supabase project so the template's own
    // sample rows always validate cleanly on first upload, instead of
    // guessing hardcoded names that may not exist in this installation.
    const actualJobs = jobs.length > 0 ? jobs : [];
    const pickJob = (hint: string, fallback: string) =>
      actualJobs.find((j) => j.name_en?.toLowerCase().includes(hint.toLowerCase()))?.name_en ||
      actualJobs[0]?.name_en ||
      fallback;
    const pickCompany = (i: number, fallback: string) =>
      companies.length > 0 ? companies[i % companies.length].name_en : fallback;
    const pickDepartment = (i: number, fallback: string) =>
      departments.length > 0 ? departments[i % departments.length].name_en : fallback;
    const pickNationality = (i: number, fallback: string) =>
      nationalities.length > 0 ? nationalities[i % nationalities.length].name_en : fallback;

    const templateData = [
      {
        employee_no: "TEST001",
        name_en: "Ahmed Mohammed",
        name_ar: "أحمد محمد",
        nationality: pickNationality(0, "United Arab Emirates"),
        company_name: pickCompany(0, "HR Group Main"),
        department_name: pickDepartment(0, "Human Resources"),
        job_name: pickJob("Manager", "General Manager"),
        passport_no: "N01234567",
        passport_expiry: "2026-12-31",
        card_no: "WC123456",
        card_expiry: "2025-12-31",
        emirates_id: "784-1990-1234567-1",
        emirates_id_expiry: "2027-06-30",
        residence_no: "101/2023/1234567",
        residence_expiry: "2026-03-15",
        phone: "+971501234567",
        email: "ahmed.mohammed@hrgroup.ae",
      },
      {
        employee_no: "TEST002",
        name_en: "Sara Ali",
        name_ar: "سارة علي",
        nationality: pickNationality(1, "Egypt"),
        company_name: pickCompany(1, "HR Group Main"),
        department_name: pickDepartment(1, "Finance"),
        job_name: pickJob("Account", "Accountant"),
        passport_no: "A98765432",
        passport_expiry: "2025-08-20",
        card_no: "WC789012",
        card_expiry: "2026-02-28",
        emirates_id: "784-1985-7654321-2",
        emirates_id_expiry: "2026-11-10",
        residence_no: "202/2024/9876543",
        residence_expiry: "2027-01-20",
        phone: "+971507654321",
        email: "sara.ali@hrgroup.ae",
      },
      {
        employee_no: "TEST003",
        name_en: "Mohammed Hassan",
        name_ar: "محمد حسن",
        nationality: pickNationality(2, "Syria"),
        company_name: pickCompany(2, "HR Group Branch A"),
        department_name: pickDepartment(2, "IT"),
        job_name: pickJob("Engineer", "Secretary"),
        passport_no: "P11223344",
        passport_expiry: "2027-03-15",
        card_no: "",
        card_expiry: "",
        emirates_id: "784-1992-5555666-3",
        emirates_id_expiry: "2028-05-10",
        residence_no: "",
        residence_expiry: "",
        phone: "+971509876543",
        email: "mohammed.hassan@hrgroup.ae",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws["!cols"] = [
      { wch: 15 }, // employee_no
      { wch: 20 }, // name_en
      { wch: 20 }, // name_ar
      { wch: 20 }, // nationality
      { wch: 20 }, // company_name
      { wch: 20 }, // department_name
      { wch: 20 }, // job_name
      { wch: 15 }, // passport_no
      { wch: 15 }, // passport_expiry
      { wch: 15 }, // card_no
      { wch: 15 }, // card_expiry
      { wch: 20 }, // emirates_id
      { wch: 15 }, // emirates_id_expiry
      { wch: 20 }, // residence_no
      { wch: 15 }, // residence_expiry
      { wch: 15 }, // phone
      { wch: 25 }, // email
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    // Add instructions sheet with a clean reference guide. Note: the free/
    // community build of the `xlsx` package (no paid Pro tier) can't apply
    // real cell styling (bold, color, borders) on write, so this is kept as
    // plain, consistently-formatted text rather than emoji-decorated
    // pseudo-headings, which render inconsistently across Excel versions/
    // locales and read as unpolished.
    const instructions = [
      { Section: "EMPLOYEE IMPORT TEMPLATE - INSTRUCTIONS", Info: "", Details: "" },
      { Section: "", Info: "", Details: "" },
      { Section: "HOW TO USE", Info: "", Details: "" },
      { Section: "Step 1", Info: "", Details: "Fill in employee data on the 'Employees' sheet" },
      { Section: "Step 2", Info: "", Details: "Upload the file in the HR System's Bulk Import" },
      { Section: "Step 3", Info: "", Details: "If a Nationality, Company, Department or Job isn't recognized, use 'Add New' in that row's dropdown to add it without leaving the import screen" },
      { Section: "Step 4", Info: "", Details: "Review the preview, then click Import" },
      { Section: "", Info: "", Details: "" },
      { Section: "FIELD REFERENCE", Info: "Required", Details: "Description / Example" },
      { Section: "employee_no", Info: "Yes", Details: "Unique employee ID, e.g. EMP001" },
      { Section: "name_en", Info: "Yes", Details: "Full name in English, e.g. Ahmed Mohammed Ali" },
      { Section: "name_ar", Info: "Yes", Details: "Full name in Arabic" },
      { Section: "nationality", Info: "No", Details: "Minor spelling differences are matched automatically" },
      { Section: "company_name", Info: "No", Details: "Must match an existing company, or use Add New in the preview" },
      { Section: "department_name", Info: "No", Details: "Must match an existing department, or use Add New in the preview" },
      { Section: "job_name", Info: "No", Details: "Must match an existing job title, or use Add New in the preview" },
      { Section: "passport_no", Info: "No", Details: "Passport number" },
      { Section: "passport_expiry", Info: "No", Details: "Date. Accepts YYYY-MM-DD, DD/MM/YYYY, or an Excel date cell" },
      { Section: "card_no", Info: "No", Details: "Work permit / labor card number" },
      { Section: "card_expiry", Info: "No", Details: "Date. Same formats as above" },
      { Section: "emirates_id", Info: "No", Details: "Format: 784-YYYY-NNNNNNN-N" },
      { Section: "emirates_id_expiry", Info: "No", Details: "Date. Same formats as above" },
      { Section: "residence_no", Info: "No", Details: "Residence permit number" },
      { Section: "residence_expiry", Info: "No", Details: "Date. Same formats as above" },
      { Section: "phone", Info: "No", Details: "Include country code, e.g. +971501234567" },
      { Section: "email", Info: "No", Details: "Email address" },
      { Section: "", Info: "", Details: "" },
      { Section: "NOTES", Info: "", Details: "" },
      { Section: "Duplicates", Info: "", Details: "Employee numbers must be unique. Duplicates within this file, and against existing records, are flagged before import" },
      { Section: "Matching", Info: "", Details: "Nationality/company/department/job matching is case-insensitive and tolerates minor typos" },
      { Section: "Optional fields", Info: "", Details: "Company, Department and Job may be left blank and added later" },
      { Section: "Sample rows", Info: "", Details: "Rows 2-4 on the Employees sheet are examples in the correct format - replace them with real data before uploading" },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 35 }, { wch: 12 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
  };

  // Parse error message to detect missing reference data
  const parseMissingDataError = (errorMessage: string): {
    type: "nationality" | "company" | "department" | "job";
    value: string;
  } | null => {
    const patterns = [
      { regex: /Nationality ["']([^"']+)["'] not found/i, type: "nationality" as const },
      { regex: /Company ["']([^"']+)["'] not found/i, type: "company" as const },
      { regex: /Department ["']([^"']+)["'] not found/i, type: "department" as const },
      { regex: /Job ["']([^"']+)["'] not found/i, type: "job" as const },
    ];

    for (const { regex, type } of patterns) {
      const match = errorMessage.match(regex);
      if (match) {
        return { type, value: match[1] };
      }
    }

    return null;
  };

  // Validate and parse date
  const parseDate = (value: unknown): string | null => {
    if (!value) return null;
    
    // Handle Excel serial dates
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      return dayjs(`${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`).format("YYYY-MM-DD");
    }
    
    // Handle string dates - try multiple formats
    const dateStr = value.toString().trim();
    
    // Try DD/MM/YYYY format (exported format)
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        // DD/MM/YYYY
        const parsed = dayjs(`${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`, "YYYY-MM-DD");
        if (parsed.isValid()) return parsed.format("YYYY-MM-DD");
      }
    }
    
    // Try ISO format (YYYY-MM-DD) or other dayjs-supported formats
    const parsed = dayjs(dateStr);
    return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults([]);
      setStep("upload");
    }
  };

  // Parse Excel file
  const parseFile = async () => {
    if (!file) return;

    setImporting(true);
    setStep("preview");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Batch-check ALL employee numbers against the database in a single
      // query, instead of one round-trip per row (was: N sequential
      // requests for an N-row file — slow and wasteful on a free-tier
      // Supabase project). Also builds up an in-file duplicate check, since
      // the old logic only ever compared against the database and let two
      // rows in the same file with the same employee_no both pass preview.
      const allEmployeeNos = jsonData
        .map((r) => {
          const raw = r as Record<string, unknown>;
          return String(raw.employee_no || raw["Employee No"] || "").trim();
        })
        .filter(Boolean);

      let existingSet = new Set<string>();
      if (allEmployeeNos.length > 0) {
        const { data: existingRows, error: existingErr } = await supabase
          .from("employees")
          .select("employee_no")
          .in("employee_no", allEmployeeNos);
        if (existingErr) {
          console.error("Duplicate pre-check failed, continuing without it:", existingErr);
        }
        existingSet = new Set((existingRows || []).map((r: any) => r.employee_no));
      }
      const seenInFile = new Set<string>();

      const parsedRows: ImportRow[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const rawRow = jsonData[i] as Record<string, unknown>;
        const rowNumber = i + 2; // Excel row (accounting for header)

        // Normalize column names - support both exported format and template format
        const row: Record<string, unknown> = {
          employee_no: rawRow.employee_no || rawRow["Employee No"],
          name_en: rawRow.name_en || rawRow["Name (English)"],
          name_ar: rawRow.name_ar || rawRow["Name (Arabic)"],
          nationality: rawRow.nationality || rawRow["Nationality"],
          company_name: rawRow.company_name || rawRow["Company"],
          department_name: rawRow.department_name || rawRow["Department"],
          job_name: rawRow.job_name || rawRow["Job"],
          passport_no: rawRow.passport_no || rawRow["Passport No"],
          passport_expiry: rawRow.passport_expiry || rawRow["Passport Expiry"],
          card_no: rawRow.card_no || rawRow["Card No"],
          card_expiry: rawRow.card_expiry || rawRow["Card Expiry"],
          emirates_id: rawRow.emirates_id || rawRow["Emirates ID"],
          emirates_id_expiry: rawRow.emirates_id_expiry || rawRow["Emirates ID Expiry"],
          residence_no: rawRow.residence_no || rawRow["Residence No"],
          residence_expiry: rawRow.residence_expiry || rawRow["Residence Expiry"],
          phone: rawRow.phone || rawRow["Phone"],
          email: rawRow.email || rawRow["Email"],
        };

        const empNo = row.employee_no?.toString().trim();

        // Duplicate check: against the database, AND against earlier rows
        // in this same file.
        let duplicateError: string | undefined;
        if (empNo) {
          if (existingSet.has(empNo)) {
            duplicateError = `Employee ${empNo} already exists`;
          } else if (seenInFile.has(empNo)) {
            duplicateError = `Duplicate employee number "${empNo}" appears more than once in this file`;
          } else {
            seenInFile.add(empNo);
          }
        }

        // Smart fuzzy matching for company
        let company = companies.find(
          (c) =>
            c.name_en?.toLowerCase() === row.company_name?.toString().toLowerCase() ||
            c.name_ar === row.company_name
        );
        // Fuzzy match: try partial matching
        if (!company && row.company_name) {
          const searchTerm = row.company_name.toString().toLowerCase().trim();
          company = companies.find(
            (c) =>
              c.name_en?.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(c.name_en?.toLowerCase()) ||
              c.code?.toLowerCase().includes(searchTerm)
          );
        }

        // Smart fuzzy matching for department
        let department = departments.find(
          (d) =>
            d.name_en?.toLowerCase() === row.department_name?.toString().toLowerCase() ||
            d.name_ar === row.department_name
        );
        // Fuzzy match: try partial matching
        if (!department && row.department_name) {
          const searchTerm = row.department_name.toString().toLowerCase().trim();
          department = departments.find(
            (d) =>
              d.name_en?.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(d.name_en?.toLowerCase()) ||
              d.code?.toLowerCase().includes(searchTerm)
          );
        }

        // Smart fuzzy matching for job
        let job = jobs.find(
          (j) =>
            j.name_en?.toLowerCase() === row.job_name?.toString().toLowerCase() ||
            j.name_ar === row.job_name
        );
        // Fuzzy match: try partial matching and common variations
        if (!job && row.job_name) {
          const searchTerm = row.job_name.toString().toLowerCase().trim();
          // Try bidirectional partial matching
          job = jobs.find(
            (j) =>
              j.name_en?.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(j.name_en?.toLowerCase()) ||
              j.code?.toLowerCase().includes(searchTerm)
          );
          
          // If still not found, try matching by last word (e.g., "Senior Specialist" -> "Specialist")
          if (!job) {
            const lastWord = searchTerm.split(/\s+/).pop() || "";
            if (lastWord.length > 3) {
              job = jobs.find((j) => 
                j.name_en?.toLowerCase().endsWith(lastWord) ||
                j.name_en?.toLowerCase().split(/\s+/).pop() === lastWord
              );
            }
          }
        }

        // Smart fuzzy matching for nationality
        let nationality = nationalities.find(
          (n) =>
            n.name_en?.toLowerCase() === row.nationality?.toString().toLowerCase() ||
            n.name_ar === row.nationality
        );
        // Fuzzy match: try partial matching
        if (!nationality && row.nationality) {
          const searchTerm = row.nationality.toString().toLowerCase().trim();
          nationality = nationalities.find(
            (n) =>
              n.name_en?.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(n.name_en?.toLowerCase()) ||
              n.code?.toLowerCase().includes(searchTerm)
          );
        }

        const parsedData: Record<string, unknown> = {
          employee_no: row.employee_no?.toString().trim(),
          name_en: row.name_en?.toString().trim(),
          name_ar: row.name_ar?.toString().trim(),
          nationality: nationality?.name_en || (row.nationality ? row.nationality.toString().trim() : null),
          // Store BOTH names and IDs for re-validation
          company_name: row.company_name?.toString().trim() || null,
          company_id: company?.id || null,
          department_name: row.department_name?.toString().trim() || null,
          department_id: department?.id || null,
          job_name: row.job_name?.toString().trim() || null,
          job_id: job?.id || null,
          passport_no: row.passport_no?.toString().trim() || null,
          passport_expiry: parseDate(row.passport_expiry),
          card_no: row.card_no?.toString().trim() || null,
          card_expiry: parseDate(row.card_expiry),
          emirates_id: row.emirates_id?.toString().trim() || null,
          emirates_id_expiry: parseDate(row.emirates_id_expiry),
          residence_no: row.residence_no?.toString().trim() || null,
          residence_expiry: parseDate(row.residence_expiry),
          phone: row.phone?.toString().trim() || null,
          email: row.email?.toString().trim() || null,
          added_date: dayjs().format("YYYY-MM-DD"), // Date when employee joined (DATE field)
          is_active: true, // Active by default (BOOLEAN field)
        };

        // Build suggestion hints for not-found reference values (shown in
        // the error message so users know what to try) without duplicating
        // the "is it actually missing" check — that's computeReferenceErrors.
        const suggestionSuffix = (
          type: "company" | "department" | "job" | "nationality",
          searchValue: string | null
        ): string => {
          if (!searchValue) return "";
          const term = searchValue.toLowerCase().trim();
          if (type === "job") {
            const lastWord = term.split(/\s+/).pop() || "";
            const similar = jobs.filter(
              (j) =>
                j.name_en?.toLowerCase().includes(lastWord) ||
                j.name_en?.toLowerCase().split(/\s+/).some((w) => w === lastWord)
            );
            return similar.length > 0
              ? ` Did you mean: ${similar.map((j) => j.name_en).slice(0, 5).join(", ")}?`
              : ` Available: ${jobs.map((j) => j.name_en).join(", ")}`;
          }
          if (type === "nationality") {
            const similar = nationalities.filter(
              (n) =>
                n.name_en?.toLowerCase().includes(term.substring(0, 3)) ||
                term.includes(n.name_en?.toLowerCase().substring(0, 3) || "")
            );
            return similar.length > 0
              ? ` Did you mean: ${similar.map((n) => n.name_en).slice(0, 5).join(", ")}?`
              : "";
          }
          if (type === "company") return ` Available: ${companies.map((c) => c.name_en).join(", ")}`;
          if (type === "department") return ` Available: ${departments.map((d) => d.name_en).join(", ")}`;
          return "";
        };

        const baseErrors = computeReferenceErrors(parsedData, {
          companies,
          departments,
          jobs,
          nationalities,
        }).map((err) => {
          const missing = parseMissingDataError(err);
          if (!missing) return err;
          return err + suggestionSuffix(missing.type, missing.value);
        });

        const errors = [...(duplicateError ? [duplicateError] : []), ...baseErrors];

        parsedRows.push({
          row: rowNumber,
          data: parsedData,
          status: errors.length > 0 ? "error" : "pending",
          message: errors.length > 0 ? errors.join(", ") : undefined,
          duplicateError,
        });
      }

      setResults(parsedRows);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Error parsing file: ${message}`);
      setStep("upload");
    } finally {
      setImporting(false);
    }
  };

  // Re-validate a row after the user edits one of the reference dropdowns
  // directly in the preview table (as opposed to going through Quick Add).
  // Previously this path only updated the field and never cleared the
  // row's error status, so a visibly "fixed" row was silently skipped
  // during import.
  const applyFieldChange = (rowIndex: number, patch: Record<string, unknown>) => {
    setResults((prev) => {
      const updated = [...prev];
      const current = updated[rowIndex];
      if (!current) return prev;
      const newData = { ...current.data, ...patch };
      const refErrors = computeReferenceErrors(newData, {
        companies,
        departments,
        jobs,
        nationalities,
      });
      const errors = [...(current.duplicateError ? [current.duplicateError] : []), ...refErrors];
      updated[rowIndex] = {
        ...current,
        data: newData,
        status: errors.length > 0 ? "error" : "pending",
        message: errors.length > 0 ? errors.join(", ") : undefined,
      };
      return updated;
    });
  };

  // Import validated rows
  const handleImport = async () => {
    setImporting(true);
    setStep("results");

    const updatedResults = [...results];
    let successCount = 0;

    for (let i = 0; i < updatedResults.length; i++) {
      const result = updatedResults[i];

      // Skip rows with validation errors
      if (result.status === "error") {
        continue;
      }

      try {
        // Remove _name fields that don't exist in database schema
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { company_name, department_name, job_name, ...dataToInsert } = result.data as Record<string, unknown>;

        const { data, error } = await supabase
          .from("employees")
          .insert(dataToInsert as never)
          .select()
          .single();

        if (error) {
          throw error;
        }

        updatedResults[i].status = "success";
        updatedResults[i].message = "Imported successfully";
        updatedResults[i].employeeId = data.id;
        successCount++;
      } catch (error) {
        console.error("Import failed for row:", result.row, error);
        const message = error instanceof Error ? error.message : "Import failed";
        updatedResults[i].status = "error";
        updatedResults[i].message = message;
      }

      setResults([...updatedResults]);
    }

    setImporting(false);

    const finalErrorCount = updatedResults.filter((r) => r.status === "error").length;

    if (successCount > 0) {
      // Refresh the parent's employee list right away regardless of
      // whether everything succeeded, so newly-imported employees show up
      // even while this dialog stays open for the user to review failures.
      onImportComplete?.();

      // Only auto-close when the whole batch was clean. If some rows
      // failed, leave the results screen up so the user can actually read
      // which ones and why, instead of it vanishing after 2 seconds.
      if (finalErrorCount === 0) {
        setTimeout(() => {
          onSuccess();
        }, 1200);
      }
    }
  };

  // Reset dialog
  const handleClose = () => {
    setFile(null);
    setResults([]);
    setStep("upload");
    onOpenChange(false);
  };

  const validRows = results.filter((r) => r.status !== "error").length;
  const errorRows = results.filter((r) => r.status === "error").length;
  const successRows = results.filter((r) => r.status === "success").length;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {t("Bulk Import Employees")}
          </DialogTitle>
          <DialogDescription>
            {t("Import multiple employees from Excel file")}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-sm text-blue-900 dark:text-blue-100">
                    {t("Download Template First")}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {t("Use the template to ensure correct format")}
                  </p>
                </div>
              </div>
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t("Download Template")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">{t("Select Excel File")}</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t("Important Notes")}
              </h4>
              <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li>{t("Employee numbers must be unique")}</li>
                <li>{t("Company, department, and job names must exist in system")}</li>
                <li>{t("Dates must be in YYYY-MM-DD format")}</li>
                <li>{t("Existing employees will be skipped (no duplicates)")}</li>
                <li>{t("Invalid rows will be highlighted for correction")}</li>
                <li>{t("All employees will be added as ACTIVE with today's date")}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === "preview" && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  {t("Total Rows")}: {results.length}
                </p>
                <div className="flex gap-4 mt-1">
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {validRows} {t("Valid")}
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errorRows} {t("Errors")}
                  </span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg max-h-96 overflow-x-auto overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left">{t("Row")}</th>
                    <th className="px-2 py-2 text-left">{t("Employee #")}</th>
                    <th className="px-2 py-2 text-left">{t("Name")}</th>
                    <th className="px-2 py-2 text-left min-w-[130px]">{t("Nationality")}</th>
                    <th className="px-2 py-2 text-left min-w-[130px]">{t("Company")}</th>
                    <th className="px-2 py-2 text-left min-w-[130px]">{t("Department")}</th>
                    <th className="px-2 py-2 text-left min-w-[130px]">{t("Job")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Passport")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Card")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Emirates ID")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Residence")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Phone")}</th>
                    <th className="px-2 py-2 text-left whitespace-nowrap">{t("Email")}</th>
                    <th className="px-2 py-2 text-left">{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${
                        result.status === "error"
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <td className="px-2 py-2">{result.row}</td>
                      <td className="px-2 py-2 font-mono">
                        {String(result.data.employee_no || "")}
                      </td>
                      <td className="px-2 py-2">{String(result.data.name_en || "")}</td>
                      
                      {/* Nationality Dropdown */}
                      <td className="px-2 py-2 min-w-[130px]">
                        <select
                          className="w-full text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                          value={String(result.data.nationality || "")}
                          onChange={(e) => {
                            if (e.target.value === "__ADD_NEW__") {
                              setQuickAddDialog({
                                type: "nationality",
                                value: String(result.data.nationality || ""),
                                rowIndex: idx,
                              });
                            } else {
                              applyFieldChange(idx, { nationality: e.target.value || null });
                            }
                          }}
                        >
                          <option value="">{t("-- None --")}</option>
                          {nationalities.map((nat) => (
                            <option key={nat.id} value={nat.name_en}>
                              {nat.name_en}
                            </option>
                          ))}
                          <option value="__ADD_NEW__">➕ {t("Add New...")}</option>
                        </select>
                      </td>

                      {/* Company Dropdown */}
                      <td className="px-2 py-2 min-w-[130px]">
                        <select
                          className="w-full text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                          value={String(result.data.company_id || "")}
                          onChange={(e) => {
                            if (e.target.value === "__ADD_NEW__") {
                              setQuickAddDialog({
                                type: "company",
                                value: String(result.data.company_name || ""),
                                rowIndex: idx,
                              });
                            } else {
                              const selectedCompany = companies.find((c) => c.id === e.target.value);
                              applyFieldChange(idx, {
                                company_id: e.target.value || null,
                                company_name: selectedCompany?.name_en || null,
                              });
                            }
                          }}
                        >
                          <option value="">{t("-- None --")}</option>
                          {companies.map((comp) => (
                            <option key={comp.id} value={comp.id}>
                              {comp.name_en}
                            </option>
                          ))}
                          <option value="__ADD_NEW__">➕ {t("Add New...")}</option>
                        </select>
                      </td>

                      {/* Department Dropdown */}
                      <td className="px-2 py-2 min-w-[130px]">
                        <select
                          className="w-full text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                          value={String(result.data.department_id || "")}
                          onChange={(e) => {
                            if (e.target.value === "__ADD_NEW__") {
                              setQuickAddDialog({
                                type: "department",
                                value: String(result.data.department_name || ""),
                                rowIndex: idx,
                              });
                            } else {
                              const selectedDept = departments.find((d) => d.id === e.target.value);
                              applyFieldChange(idx, {
                                department_id: e.target.value || null,
                                department_name: selectedDept?.name_en || null,
                              });
                            }
                          }}
                        >
                          <option value="">{t("-- None --")}</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name_en}
                            </option>
                          ))}
                          <option value="__ADD_NEW__">➕ {t("Add New...")}</option>
                        </select>
                      </td>

                      {/* Job Dropdown */}
                      <td className="px-2 py-2 min-w-[130px]">
                        <select
                          className="w-full text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800"
                          value={String(result.data.job_id || "")}
                          onChange={(e) => {
                            if (e.target.value === "__ADD_NEW__") {
                              setQuickAddDialog({
                                type: "job",
                                value: String(result.data.job_name || ""),
                                rowIndex: idx,
                              });
                            } else {
                              const selectedJob = jobs.find((j) => j.id === e.target.value);
                              applyFieldChange(idx, {
                                job_id: e.target.value || null,
                                job_name: selectedJob?.name_en || null,
                              });
                            }
                          }}
                        >
                          <option value="">{t("-- None --")}</option>
                          {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.name_en}
                            </option>
                          ))}
                          <option value="__ADD_NEW__">➕ {t("Add New...")}</option>
                        </select>
                      </td>

                      {/* Document & contact fields — read-only preview so dates that
                          got auto-parsed from mixed formats can be checked
                          before import instead of only being visible after
                          the fact. */}
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div>{String(result.data.passport_no || "—")}</div>
                        <div className="text-muted-foreground">{String(result.data.passport_expiry || "")}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div>{String(result.data.card_no || "—")}</div>
                        <div className="text-muted-foreground">{String(result.data.card_expiry || "")}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div>{String(result.data.emirates_id || "—")}</div>
                        <div className="text-muted-foreground">{String(result.data.emirates_id_expiry || "")}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div>{String(result.data.residence_no || "—")}</div>
                        <div className="text-muted-foreground">{String(result.data.residence_expiry || "")}</div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{String(result.data.phone || "—")}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{String(result.data.email || "—")}</td>

                      <td className="px-2 py-2">
                        {revalidatingRow === idx ? (
                          <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t("Validating...")}
                          </span>
                        ) : result.status === "error" ? (
                          <div className="space-y-1">
                            {(() => {
                              // Split multiple errors if comma-separated
                              const errorMessages = (result.message || "").split(", ");
                              // Find FIRST error that can be Quick-Added
                              const firstQuickAddableError = errorMessages.find(msg => 
                                parseMissingDataError(msg) !== null
                              );
                              const missingData = firstQuickAddableError ? parseMissingDataError(firstQuickAddableError) : null;
                              
                              return (
                                <>
                                  <div className="flex items-start gap-2">
                                    <span className="text-red-600 dark:text-red-400 flex items-start gap-1 text-xs">
                                      <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      <span className="flex-1">{result.message}</span>
                                    </span>
                                  </div>
                                  {missingData && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs w-full"
                                      onClick={() => {
                                        setQuickAddDialog({
                                          type: missingData.type,
                                          value: missingData.value,
                                          rowIndex: idx,
                                        });
                                      }}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      {t("Add")} {missingData.type === "nationality" ? t("Nationality") : 
                                              missingData.type === "company" ? t("Company") : 
                                              missingData.type === "department" ? t("Department") : t("Job")}
                                    </Button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("Ready")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === "results" && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {successRows}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  {t("Imported")}
                </p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {errorRows}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  {t("Failed")}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border text-center">
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-xs text-muted-foreground">{t("Total")}</p>
              </div>
            </div>

            {errorRows > 0 && successRows > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {t("Some rows failed - this window will stay open so you can review them. Click Done when finished.")}
              </div>
            )}

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left">{t("Row")}</th>
                    <th className="px-2 py-2 text-left">{t("Employee #")}</th>
                    <th className="px-2 py-2 text-left">{t("Name")}</th>
                    <th className="px-2 py-2 text-left">{t("Result")}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      className={`border-t ${
                        result.status === "success"
                          ? "bg-green-50 dark:bg-green-900/20"
                          : result.status === "error"
                          ? "bg-red-50 dark:bg-red-900/20"
                          : ""
                      }`}
                    >
                      <td className="px-2 py-2">{result.row}</td>
                      <td className="px-2 py-2 font-mono">
                        {String(result.data.employee_no || "")}
                      </td>
                      <td className="px-2 py-2">{String(result.data.name_en || "")}</td>
                      <td className="px-2 py-2">
                        {result.status === "success" ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {result.message}
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {result.message}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "upload" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                {t("Cancel")}
              </Button>
              <Button onClick={parseFile} disabled={!file || importing}>
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("Parsing...")}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t("Parse File")}
                  </>
                )}
              </Button>
            </>
          )}

          {step === "preview" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload");
                  setResults([]);
                }}
              >
                {t("Back")}
              </Button>
              <Button
                onClick={handleImport}
                disabled={validRows === 0 || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("Importing...")}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t("Import")} {validRows} {t("Employees")}
                  </>
                )}
              </Button>
            </>
          )}

          {step === "results" && (
            <Button onClick={handleClose}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t("Done")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Quick Add Reference Data Dialog - Outside main dialog to avoid overlay conflicts */}
    {quickAddDialog && (
      <QuickAddReference
        open={!!quickAddDialog}
        onOpenChange={(open) => {
          if (!open) setQuickAddDialog(null);
        }}
        type={quickAddDialog.type}
        missingValue={quickAddDialog.value}
        onSuccess={async () => {
            // Close the quick-add dialog
            const rowIndex = quickAddDialog.rowIndex;
            const addedType = quickAddDialog.type;
            setQuickAddDialog(null);
            
            // Show loading state
            setRevalidatingRow(rowIndex);

            // Re-validate the specific row
            const rowToRevalidate = results[rowIndex];
            if (!rowToRevalidate) {
              setRevalidatingRow(null);
              return;
            }

            // Fetch ONLY the updated reference data type (performance optimization)
            let updatedCompanies = companies;
            let updatedDepartments = departments;
            let updatedJobs = jobs;
            let updatedNationalities = nationalities;

            if (addedType === "company") {
              const { data } = await supabase.from("companies").select("*");
              updatedCompanies = data || companies;
            } else if (addedType === "department") {
              const { data } = await supabase.from("departments").select("*");
              updatedDepartments = data || departments;
            } else if (addedType === "job") {
              const { data } = await supabase.from("jobs").select("*");
              updatedJobs = data || jobs;
            } else if (addedType === "nationality") {
              const { data } = await supabase.from("nationalities").select("*");
              updatedNationalities = data || nationalities;
            }

            // Re-validate with the freshly-fetched reference data. Resolve
            // the row's *_id fields against the new lists too (not just
            // presence-check), so the newly added item is actually usable.
            const row = { ...rowToRevalidate.data };

            const nationalityMatch = row.nationality
              ? (updatedNationalities || []).find(
                  (n) => n.name_en?.toLowerCase() === String(row.nationality).toLowerCase()
                )
              : null;
            const companyMatch = row.company_name
              ? (updatedCompanies || []).find(
                  (c) => c.name_en?.toLowerCase() === String(row.company_name).toLowerCase()
                )
              : null;
            const departmentMatch = row.department_name
              ? (updatedDepartments || []).find(
                  (d) => d.name_en?.toLowerCase() === String(row.department_name).toLowerCase()
                )
              : null;
            const jobMatch = row.job_name
              ? (updatedJobs || []).find(
                  (j) => j.name_en?.toLowerCase() === String(row.job_name).toLowerCase()
                )
              : null;

            const newData: Record<string, unknown> = {
              ...row,
              nationality: nationalityMatch?.name_en || row.nationality,
              company_id: companyMatch?.id || row.company_id,
              department_id: departmentMatch?.id || row.department_id,
              job_id: jobMatch?.id || row.job_id,
            };

            const refErrors = computeReferenceErrors(newData, {
              companies: updatedCompanies,
              departments: updatedDepartments,
              jobs: updatedJobs,
              nationalities: updatedNationalities,
            });
            const errors = [
              ...(rowToRevalidate.duplicateError ? [rowToRevalidate.duplicateError] : []),
              ...refErrors,
            ];

            const updatedResults = [...results];
            updatedResults[rowIndex] = {
              ...rowToRevalidate,
              status: errors.length > 0 ? "error" : "pending",
              message: errors.length > 0 ? errors.join(", ") : undefined,
              data: newData,
            };

            setResults(updatedResults);
            setRevalidatingRow(null);
          }}
        />
      )}
    </>
  );
}
