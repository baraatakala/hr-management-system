import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";
import dayjs from "dayjs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfFieldDef {
  key: string;
  label: string;
}

export type DocStatus = "valid" | "expiring" | "expired" | "missing";

export interface PdfExportOptions {
  /** Raw employee rows (with joined companies/departments/jobs) */
  employees: any[];
  /** Fields chosen by the user, in display order. Arabic fields are ignored
   *  even if present — jsPDF's built-in fonts can't shape Arabic glyphs, so
   *  this report is English-only by design. */
  fields: PdfFieldDef[];
  /** Report title, e.g. "Employee Directory Report" */
  title: string;
  /** e.g. "All Employees" or "Selected Employees (12)" */
  subtitle: string;
  /** Human readable list of active filters, empty array if none */
  filtersApplied: string[];
  /** Name/email of the person generating the report */
  generatedBy?: string;
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const COLOR = {
  brand: [30, 64, 175] as [number, number, number], // blue-800
  brandLight: [219, 234, 254] as [number, number, number], // blue-100
  dark: [15, 23, 42] as [number, number, number], // slate-900
  muted: [100, 116, 139] as [number, number, number], // slate-500
  border: [226, 232, 240] as [number, number, number], // slate-200
  zebra: [248, 250, 252] as [number, number, number], // slate-50
  green: [21, 128, 61] as [number, number, number], // green-700
  greenBg: [220, 252, 231] as [number, number, number], // green-100
  amber: [180, 83, 9] as [number, number, number], // amber-700
  amberBg: [254, 243, 199] as [number, number, number], // amber-100
  red: [185, 28, 28] as [number, number, number], // red-700
  redBg: [254, 226, 226] as [number, number, number], // red-100
  gray: [107, 114, 128] as [number, number, number], // gray-500
};

const EXPIRY_FIELD_KEYS = [
  "passport_expiry",
  "card_expiry",
  "emirates_id_expiry",
  "residence_expiry",
];

// Fields not supported in the PDF report (Arabic glyphs render as boxes with
// jsPDF's built-in fonts). Always stripped, regardless of what was selected
// in the export dialog.
const UNSUPPORTED_PDF_FIELDS = new Set(["name_ar"]);

// Fields that get their own dedicated width treatment
const NARROW_FIELDS = new Set(["employee_no", "status", "nationality"]);
const WIDE_FIELDS = new Set(["name_en", "email"]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Every date is formatted through an explicit "en" locale instance so that
// a page-wide Arabic dayjs locale (set elsewhere in the app for the UI)
// never leaks into the PDF — jsPDF's fonts can't render non-Latin glyphs,
// which previously produced garbled text in the report header.
function en(input?: string | number | Date | null) {
  return dayjs(input).locale("en");
}

export function getDocStatus(expiry?: string | null): DocStatus {
  if (!expiry) return "missing";
  const days = en(expiry).diff(en(), "day");
  if (days < 0) return "expired";
  if (days <= 30) return "expiring";
  return "valid";
}

function statusColors(status: DocStatus): { text: [number, number, number]; bg?: [number, number, number] } {
  switch (status) {
    case "expired":
      return { text: COLOR.red };
    case "expiring":
      return { text: COLOR.amber };
    case "valid":
      return { text: COLOR.green };
    default:
      return { text: COLOR.gray };
  }
}

function fmtDate(d?: string | null) {
  return d ? en(d).format("DD/MM/YYYY") : "N/A";
}

function fmtDateTime(d?: string | null) {
  return d ? en(d).format("DD/MM/YYYY HH:mm") : "";
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export function exportEmployeesToPdf({
  employees,
  fields: fieldsIn,
  title,
  subtitle,
  filtersApplied,
  generatedBy,
}: PdfExportOptions): void {
  if (!employees || employees.length === 0) {
    alert("No data to export");
    return;
  }

  // English-only report: silently drop any unsupported (Arabic) fields
  const fields = fieldsIn.filter((f) => !UNSUPPORTED_PDF_FIELDS.has(f.key));
  if (fields.length === 0) {
    alert("Select at least one field supported in PDF (Arabic-only fields aren't supported).");
    return;
  }

  // Landscape, larger paper for wide field sets so columns stay readable
  const paperFormat = fields.length > 11 ? "a3" : "a4";
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: paperFormat });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // -------------------------------------------------------------------------
  // Precompute summary statistics (used in the header band)
  // -------------------------------------------------------------------------
  const total = employees.length;
  const active = employees.filter((e) => e.is_active).length;
  const inactive = total - active;

  const docSummary = EXPIRY_FIELD_KEYS.map((fieldKey) => {
    const label =
      fieldKey === "passport_expiry"
        ? "Passport"
        : fieldKey === "card_expiry"
        ? "Work Card"
        : fieldKey === "emirates_id_expiry"
        ? "Emirates ID"
        : "Residence";
    let valid = 0,
      expiring = 0,
      expired = 0,
      missing = 0;
    employees.forEach((e) => {
      const status = getDocStatus(e[fieldKey]);
      if (status === "valid") valid++;
      else if (status === "expiring") expiring++;
      else if (status === "expired") expired++;
      else missing++;
    });
    return { label, valid, expiring, expired, missing };
  });

  // -------------------------------------------------------------------------
  // Build table rows + a parallel status map (for cell coloring)
  // -------------------------------------------------------------------------
  const head = [fields.map((f) => f.label)];
  const body: string[][] = [];
  const rowStatusMap: Record<string, DocStatus>[] = [];

  employees.forEach((emp) => {
    const row: string[] = [];
    const statusRow: Record<string, DocStatus> = {};

    fields.forEach((f) => {
      switch (f.key) {
        case "employee_no":
          row.push(emp.employee_no || "");
          break;
        case "name_en":
          row.push(emp.name_en || "");
          break;
        case "nationality":
          row.push(emp.nationality || "");
          break;
        case "status":
          row.push(emp.is_active ? "Active" : "Inactive");
          break;
        case "added_date":
          row.push(fmtDate(emp.added_date));
          break;
        case "updated_at":
          row.push(fmtDateTime(emp.updated_at));
          break;
        case "company":
          row.push(emp.companies?.name_en || "");
          break;
        case "department":
          row.push(emp.departments?.name_en || "");
          break;
        case "job":
          row.push(emp.jobs?.name_en || "");
          break;
        case "passport_no":
          row.push(emp.passport_no || "N/A");
          break;
        case "passport_expiry":
          row.push(fmtDate(emp.passport_expiry));
          statusRow["passport_expiry"] = getDocStatus(emp.passport_expiry);
          break;
        case "card_no":
          row.push(emp.card_no || "N/A");
          break;
        case "card_expiry":
          row.push(fmtDate(emp.card_expiry));
          statusRow["card_expiry"] = getDocStatus(emp.card_expiry);
          break;
        case "emirates_id":
          row.push(emp.emirates_id || "N/A");
          break;
        case "emirates_id_expiry":
          row.push(fmtDate(emp.emirates_id_expiry));
          statusRow["emirates_id_expiry"] = getDocStatus(emp.emirates_id_expiry);
          break;
        case "residence_no":
          row.push(emp.residence_no || "N/A");
          break;
        case "residence_expiry":
          row.push(fmtDate(emp.residence_expiry));
          statusRow["residence_expiry"] = getDocStatus(emp.residence_expiry);
          break;
        case "email":
          row.push(emp.email || "");
          break;
        case "phone":
          row.push(emp.phone || "");
          break;
        default:
          row.push("");
      }
    });

    body.push(row);
    rowStatusMap.push(statusRow);
  });

  // -------------------------------------------------------------------------
  // Header / cover band drawn once, then reused via `didDrawPage` for repeat
  // -------------------------------------------------------------------------
  const HEADER_HEIGHT = 30;

  const drawHeader = (pageNo: number, pageCount: number) => {
    // Brand bar
    doc.setFillColor(...COLOR.brand);
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, margin, 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(subtitle, margin, 19);

    // Numeric-only date format (no MMM/dddd) so this line never depends on
    // dayjs's globally-set locale, which may be Arabic elsewhere in the app.
    const generatedLine = `Generated ${en().format("DD/MM/YYYY HH:mm")}${
      generatedBy ? `  -  by ${generatedBy}` : ""
    }`;
    doc.setFontSize(8);
    doc.text(generatedLine, margin, 25.5);

    // Right-aligned record count + page number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`${total} Employee${total === 1 ? "" : "s"}`, pageWidth - margin, 12, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Page ${pageNo} of ${pageCount}`, pageWidth - margin, 19, { align: "right" });
    doc.text("HR Management System", pageWidth - margin, 25.5, { align: "right" });
  };

  // -------------------------------------------------------------------------
  // Summary band (page 1 only) — active/inactive + per-document breakdown
  // -------------------------------------------------------------------------
  let cursorY = HEADER_HEIGHT + 6;

  doc.setTextColor(...COLOR.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Summary", margin, cursorY);
  cursorY += 4.5;

  // Active / inactive chips
  const chipY = cursorY;
  const chips: { label: string; value: number; color: [number, number, number]; bg: [number, number, number] }[] = [
    { label: "Active", value: active, color: COLOR.green, bg: COLOR.greenBg },
    { label: "Inactive", value: inactive, color: COLOR.gray, bg: [241, 245, 249] },
  ];
  let chipX = margin;
  chips.forEach((c) => {
    const w = 30;
    doc.setFillColor(...c.bg);
    doc.roundedRect(chipX, chipY - 3.5, w, 6, 1, 1, "F");
    doc.setTextColor(...c.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${c.label}: ${c.value}`, chipX + w / 2, chipY, { align: "center" });
    chipX += w + 3;
  });

  // Document status table (compact) using autoTable
  autoTable(doc, {
    startY: chipY + 4,
    margin: { left: margin, right: margin },
    head: [["Document", "Valid", "Expiring (30d)", "Expired", "Missing"]],
    body: docSummary.map((d) => [d.label, String(d.valid), String(d.expiring), String(d.expired), String(d.missing)]),
    theme: "grid",
    styles: { fontSize: 7.5, cellPadding: 1.4, lineColor: COLOR.border, lineWidth: 0.1 },
    headStyles: { fillColor: COLOR.dark, textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { textColor: COLOR.green, halign: "center" },
      2: { textColor: COLOR.amber, halign: "center" },
      3: { textColor: COLOR.red, halign: "center" },
      4: { textColor: COLOR.gray, halign: "center" },
    },
    tableWidth: 110,
  });

  // @ts-ignore - jspdf-autotable augments doc with lastAutoTable
  cursorY = (doc as any).lastAutoTable.finalY + 5;

  // Filters applied note
  if (filtersApplied.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.dark);
    doc.text("Filters applied:", margin, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLOR.muted);
    const filtersText = filtersApplied.join("   |   ");
    const wrapped = doc.splitTextToSize(filtersText, pageWidth - margin * 2 - 28);
    doc.text(wrapped, margin + 28, cursorY);
    cursorY += 4 * wrapped.length + 2;
  }

  // -------------------------------------------------------------------------
  // Main data table
  // -------------------------------------------------------------------------
  const columnStyles: Record<number, any> = {};
  fields.forEach((f, idx) => {
    if (NARROW_FIELDS.has(f.key)) columnStyles[idx] = { cellWidth: "auto", minCellWidth: 16 };
    else if (WIDE_FIELDS.has(f.key)) columnStyles[idx] = { cellWidth: "auto", minCellWidth: 26 };
  });

  autoTable(doc, {
    startY: cursorY + 2,
    margin: { left: margin, right: margin, top: HEADER_HEIGHT + 4 },
    head,
    body,
    theme: "striped",
    styles: {
      fontSize: fields.length > 14 ? 6.5 : 7.5,
      cellPadding: 1.6,
      lineColor: COLOR.border,
      lineWidth: 0.1,
      textColor: COLOR.dark,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: {
      fillColor: COLOR.brand,
      textColor: 255,
      fontStyle: "bold",
      fontSize: fields.length > 14 ? 7 : 8,
    },
    alternateRowStyles: { fillColor: COLOR.zebra },
    columnStyles,
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const fieldKey = fields[data.column.index]?.key;
      if (!fieldKey || !EXPIRY_FIELD_KEYS.includes(fieldKey)) return;
      const status = rowStatusMap[data.row.index]?.[fieldKey];
      if (!status) return;
      const c = statusColors(status);
      data.cell.styles.textColor = c.text;
      data.cell.styles.fontStyle = status === "expired" || status === "expiring" ? "bold" : "normal";
    },
    didDrawPage: () => {
      // header + footer drawn per page after autoTable finishes laying out that page
    },
  });

  // -------------------------------------------------------------------------
  // Draw header + footer on every page (after content so we know page count)
  // -------------------------------------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawHeader(i, pageCount);

    // Footer
    doc.setDrawColor(...COLOR.border);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLOR.muted);
    doc.text(
      "Confidential - for internal HR use only. Generated automatically by the HR Management System.",
      margin,
      pageHeight - 4
    );
    doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 4, { align: "right" });
  }

  const filename = `${title.replace(/\s+/g, "_")}_${en().format("YYYY-MM-DD_HHmm")}.pdf`;
  doc.save(filename);
}
