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
  /** Opt-in only — fetches each employee's avatar_url and embeds a small
   *  thumbnail. Off by default: on a Supabase free-tier project this pulls
   *  real egress bandwidth for every photo, every export, so it shouldn't
   *  happen silently. */
  includePhotos?: boolean;
  /** Called with (loaded, total) while photos are being fetched, so the UI
   *  can show progress instead of freezing on a big export. */
  onPhotoProgress?: (loaded: number, total: number) => void;
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const COLOR = {
  brand: [30, 64, 175] as [number, number, number], // blue-800
  dark: [15, 23, 42] as [number, number, number], // slate-900
  muted: [100, 116, 139] as [number, number, number], // slate-500
  border: [226, 232, 240] as [number, number, number], // slate-200
  zebra: [248, 250, 252] as [number, number, number], // slate-50
  green: [21, 128, 61] as [number, number, number], // green-700
  greenBg: [220, 252, 231] as [number, number, number], // green-100
  amber: [180, 83, 9] as [number, number, number], // amber-700
  red: [185, 28, 28] as [number, number, number], // red-700
  gray: [107, 114, 128] as [number, number, number], // gray-500
  photoPlaceholder: [226, 232, 240] as [number, number, number], // slate-200
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

const PHOTO_COL_KEY = "__photo__";
const PHOTO_COL_WIDTH_MM = 16; // table column width
const PHOTO_THUMB_PX = 96; // source-side square thumbnail resolution before JPEG compression
const PHOTO_ROW_HEIGHT_MM = 15; // forces every row tall enough to fit the thumbnail
const PHOTO_FETCH_CONCURRENCY = 6; // caps parallel requests against Supabase Storage

// ---------------------------------------------------------------------------
// Date helpers
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

function statusColors(status: DocStatus): { text: [number, number, number] } {
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
// Photo helpers — fetch once, downscale hard, embed as a small JPEG so the
// PDF stays light and we don't re-transmit full-resolution avatars.
// ---------------------------------------------------------------------------

async function fetchAvatarThumbnail(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = document.createElement("canvas");
    canvas.width = PHOTO_THUMB_PX;
    canvas.height = PHOTO_THUMB_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Center-crop to a square so avatars aren't stretched
    const srcSize = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - srcSize) / 2;
    const sy = (bitmap.height - srcSize) / 2;
    ctx.drawImage(bitmap, sx, sy, srcSize, srcSize, 0, 0, PHOTO_THUMB_PX, PHOTO_THUMB_PX);

    return canvas.toDataURL("image/jpeg", 0.55);
  } catch {
    return null; // broken URL / CORS / network hiccup — just skip this one photo
  }
}

async function fetchThumbnailsWithLimit(
  urls: (string | null | undefined)[],
  onProgress?: (loaded: number, total: number) => void
): Promise<(string | null)[]> {
  const results: (string | null)[] = new Array(urls.length).fill(null);
  const total = urls.filter(Boolean).length;
  let loaded = 0;
  let cursor = 0;

  async function worker() {
    while (cursor < urls.length) {
      const i = cursor++;
      const url = urls[i];
      if (url) {
        results[i] = await fetchAvatarThumbnail(url);
        loaded++;
        onProgress?.(loaded, total);
      }
    }
  }

  const workerCount = Math.min(PHOTO_FETCH_CONCURRENCY, Math.max(1, total));
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Main export function
// ---------------------------------------------------------------------------

export async function exportEmployeesToPdf({
  employees,
  fields: fieldsIn,
  title,
  subtitle,
  filtersApplied,
  generatedBy,
  includePhotos = false,
  onPhotoProgress,
}: PdfExportOptions): Promise<void> {
  if (!employees || employees.length === 0) {
    alert("No data to export");
    return;
  }

  // English-only report: silently drop any unsupported (Arabic) fields
  const baseFields = fieldsIn.filter((f) => !UNSUPPORTED_PDF_FIELDS.has(f.key));
  if (baseFields.length === 0) {
    alert("Select at least one field supported in PDF (Arabic-only fields aren't supported).");
    return;
  }

  // Photos, if requested, are fetched up front (async) so autoTable can lay
  // out the whole document synchronously afterwards.
  let photoDataUrls: (string | null)[] = [];
  if (includePhotos) {
    photoDataUrls = await fetchThumbnailsWithLimit(
      employees.map((e) => e.avatar_url),
      onPhotoProgress
    );
  }

  const fields: PdfFieldDef[] = includePhotos
    ? [{ key: PHOTO_COL_KEY, label: "Photo" }, ...baseFields]
    : baseFields;

  // Initials fallback for employees with no photo (or a failed fetch),
  // matching the app's own avatar-initial convention.
  const employeeInitials: string[] = employees.map(
    (e) => (e.name_en || e.name_ar || "?").trim().charAt(0).toUpperCase() || "?"
  );

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
        case PHOTO_COL_KEY:
          row.push(""); // drawn as an image in didDrawCell, not as text
          break;
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
    if (f.key === PHOTO_COL_KEY) columnStyles[idx] = { cellWidth: PHOTO_COL_WIDTH_MM, halign: "center" };
    else if (NARROW_FIELDS.has(f.key)) columnStyles[idx] = { cellWidth: "auto", minCellWidth: 16 };
    else if (WIDE_FIELDS.has(f.key)) columnStyles[idx] = { cellWidth: "auto", minCellWidth: 26 };
  });

  autoTable(doc, {
    startY: cursorY + 4,
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
      ...(includePhotos ? { minCellHeight: PHOTO_ROW_HEIGHT_MM } : {}),
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
    didDrawCell: (data) => {
      if (!includePhotos || data.section !== "body") return;
      const fieldKey = fields[data.column.index]?.key;
      if (fieldKey !== PHOTO_COL_KEY) return;

      const dataUrl = photoDataUrls[data.row.index];
      const cell = data.cell;
      const size = Math.min(cell.height, cell.width) - 3; // small padding
      const x = cell.x + (cell.width - size) / 2;
      const y = cell.y + (cell.height - size) / 2;
      const cx = x + size / 2;
      const cy = y + size / 2;
      const r = size / 2;

      if (dataUrl) {
        try {
          // Clip to a circle so the thumbnail matches the app's round
          // avatar style instead of a hard-edged square.
          doc.saveGraphicsState();
          doc.circle(cx, cy, r, null);
          (doc as any).clip();
          (doc as any).discardPath?.();
          doc.addImage(dataUrl, "JPEG", x, y, size, size);
          doc.restoreGraphicsState();
        } catch {
          // corrupt image data or clip unsupported — draw unclipped as a fallback
          try {
            doc.addImage(dataUrl, "JPEG", x, y, size, size);
          } catch {
            // give up silently, cell stays blank rather than breaking the export
          }
        }
      } else {
        // No photo on file (or the fetch failed) — show an initial, same as
        // the app's own avatar placeholder, instead of a blank circle.
        doc.setFillColor(...COLOR.brand);
        doc.circle(cx, cy, r, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(employeeInitials[data.row.index] || "?", cx, cy + 1.2, { align: "center" });
      }
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
