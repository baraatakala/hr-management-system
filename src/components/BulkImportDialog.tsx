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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import dayjs from "dayjs";

interface ImportRow {
  row: number;
  data: Record<string, unknown>;
  status: "pending" | "success" | "error" | "warning";
  message?: string;
  employeeId?: string;
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
}

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  companies: Company[];
  departments: Department[];
  jobs: Job[];
  nationalities: Nationality[];
}

export function BulkImportDialog({
  open,
  onOpenChange,
  onSuccess,
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

  // Download Excel template
  const downloadTemplate = () => {
    // Use ACTUAL job names from database for realistic template
    const actualJobs = jobs.length > 0 ? jobs : [];
    
    const templateData = [
      {
        employee_no: "TEST001",
        name_en: "Ahmed Mohammed",
        name_ar: "أحمد محمد",
        nationality: "United Arab Emirates",
        company_name: "HR Group Main",
        department_name: "Human Resources",
        job_name: actualJobs.find(j => j.name_en?.includes("Manager"))?.name_en || "General Manager",
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
        nationality: "Egypt",
        company_name: "HR Group Main",
        department_name: "Finance",
        job_name: actualJobs.find(j => j.name_en?.includes("Account"))?.name_en || "Accountant",
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
        nationality: "Syria",
        company_name: "HR Group Branch A",
        department_name: "IT",
        job_name: actualJobs.find(j => j.name_en?.includes("Computer") || j.name_en?.includes("Engineer"))?.name_en || "Secretary",
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

    // Add instructions sheet
    const instructions = [
      { Field: "employee_no", Required: "YES", Description: "Unique employee ID (e.g., TEST001, EMP001)" },
      { Field: "name_en", Required: "YES", Description: "Full name in English" },
      { Field: "name_ar", Required: "YES", Description: "Full name in Arabic" },
      { Field: "nationality", Required: "YES", Description: "Exact nationality name: United Arab Emirates, Egypt, Syria, India, etc." },
      { Field: "company_name", Required: "NO", Description: "Exact company name (optional): HR Group Main, HR Group Branch A, HR Group Branch B" },
      { Field: "department_name", Required: "NO", Description: "Exact department name (optional): Human Resources, Finance, IT, Operations" },
      { Field: "job_name", Required: "NO", Description: "Exact job title (optional): Manager, Senior Specialist, Specialist, Assistant" },
      { Field: "passport_no", Required: "NO", Description: "Passport number (e.g., N01234567)" },
      { Field: "passport_expiry", Required: "NO", Description: "Passport expiry date (YYYY-MM-DD format only)" },
      { Field: "card_no", Required: "NO", Description: "Work permit/Labor card number (e.g., WC123456)" },
      { Field: "card_expiry", Required: "NO", Description: "Work permit expiry (YYYY-MM-DD format only)" },
      { Field: "emirates_id", Required: "NO", Description: "Emirates ID (format: 784-YYYY-NNNNNNN-N)" },
      { Field: "emirates_id_expiry", Required: "NO", Description: "Emirates ID expiry (YYYY-MM-DD format only)" },
      { Field: "residence_no", Required: "NO", Description: "Residence permit number (e.g., 101/2023/1234567)" },
      { Field: "residence_expiry", Required: "NO", Description: "Residence permit expiry (YYYY-MM-DD format only)" },
      { Field: "phone", Required: "NO", Description: "Phone with country code (e.g., +971501234567)" },
      { Field: "email", Required: "NO", Description: "Email address (e.g., name@company.ae)" },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "Employee_Import_Template.xlsx");
  };

  // Validate and parse date
  const parseDate = (value: unknown): string | null => {
    if (!value) return null;
    
    // Handle Excel serial dates
    if (typeof value === "number") {
      const date = XLSX.SSF.parse_date_code(value);
      return dayjs(`${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`).format("YYYY-MM-DD");
    }
    
    // Handle string dates
    const parsed = dayjs(value as string);
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

      const parsedRows: ImportRow[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as Record<string, unknown>;
        const rowNumber = i + 2; // Excel row (accounting for header)

        // Validate required fields
        const errors: string[] = [];
        if (!row.employee_no?.toString().trim()) errors.push("Employee number required");
        if (!row.name_en?.toString().trim()) errors.push("Name (EN) required");
        if (!row.name_ar?.toString().trim()) errors.push("Name (AR) required");
        if (!row.nationality?.toString().trim()) errors.push("Nationality required");
        // Company, department, and job are optional (nullable in database)

        // Check for duplicates in database
        const { data: existing } = await supabase
          .from("employees")
          .select("id, employee_no")
          .eq("employee_no", row.employee_no?.toString().trim())
          .maybeSingle();

        if (existing) {
          errors.push(`Employee ${row.employee_no} already exists`);
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
        if (!company && row.company_name) {
          errors.push(`Company "${row.company_name}" not found. Available: ${companies.map(c => c.name_en).join(", ")}`);
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
        if (!department && row.department_name) {
          errors.push(`Department "${row.department_name}" not found. Available: ${departments.map(d => d.name_en).join(", ")}`);
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
        if (!job && row.job_name) {
          // Suggest similar jobs based on last word
          const searchTerm = row.job_name.toString().toLowerCase().trim();
          const lastWord = searchTerm.split(/\s+/).pop() || "";
          const similarJobs = jobs.filter((j) => 
            j.name_en?.toLowerCase().includes(lastWord) ||
            j.name_en?.toLowerCase().split(/\s+/).some(word => word === lastWord)
          );
          
          if (similarJobs.length > 0) {
            errors.push(`Job "${row.job_name}" not found. Did you mean: ${similarJobs.map(j => j.name_en).slice(0, 5).join(", ")}?`);
          } else {
            errors.push(`Job "${row.job_name}" not found. Available: ${jobs.map(j => j.name_en).join(", ")}`);
          }
        }

        // Match nationality
        const nationality = nationalities.find(
          (n) =>
            n.name_en?.toLowerCase() === row.nationality?.toString().toLowerCase() ||
            n.name_ar === row.nationality
        );
        if (!nationality && row.nationality) {
          errors.push(`Nationality "${row.nationality}" not found`);
        }

        parsedRows.push({
          row: rowNumber,
          data: {
            employee_no: row.employee_no?.toString().trim(),
            name_en: row.name_en?.toString().trim(),
            name_ar: row.name_ar?.toString().trim(),
            nationality: nationality?.name_en || row.nationality,
            company_id: company?.id || null,
            department_id: department?.id || null,
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
            added_date: dayjs().format("YYYY-MM-DD"), // Current date as default
            is_active: true, // Active by default
          },
          status: errors.length > 0 ? "error" : "pending",
          message: errors.join("; "),
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
        const { data, error } = await supabase
          .from("employees")
          .insert(result.data as never)
          .select()
          .single();

        if (error) throw error;

        updatedResults[i].status = "success";
        updatedResults[i].message = "Imported successfully";
        updatedResults[i].employeeId = data.id;
        successCount++;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Import failed";
        updatedResults[i].status = "error";
        updatedResults[i].message = message;
      }

      setResults([...updatedResults]);
    }

    setImporting(false);

    // Show summary
    if (successCount > 0) {
      setTimeout(() => {
        onSuccess();
      }, 2000);
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

            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left">{t("Row")}</th>
                    <th className="px-2 py-2 text-left">{t("Employee #")}</th>
                    <th className="px-2 py-2 text-left">{t("Name")}</th>
                    <th className="px-2 py-2 text-left">{t("Company")}</th>
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
                      <td className="px-2 py-2">{result.data.company_id ? "✓" : "✗"}</td>
                      <td className="px-2 py-2">
                        {result.status === "error" ? (
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            {result.message}
                          </span>
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
  );
}
