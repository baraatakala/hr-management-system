import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, AlertCircle } from "lucide-react";

interface ReferenceItem {
  id: string;
  code: string;
  name_en: string;
  name_ar: string;
}

interface QuickAddReferenceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "nationality" | "company" | "department" | "job";
  missingValue: string;
  onSuccess: (newItem: ReferenceItem) => void;
}

export function QuickAddReference({
  open,
  onOpenChange,
  type,
  missingValue,
  onSuccess,
}: QuickAddReferenceProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: "",
    name_en: missingValue,
    name_ar: "",
  });
  const [error, setError] = useState<string | null>(null);

  const getTableName = (): "nationalities" | "companies" | "departments" | "jobs" => {
    if (type === "nationality") return "nationalities";
    if (type === "company") return "companies";
    if (type === "department") return "departments";
    return "jobs";
  };

  const getDisplayName = () => {
    if (type === "nationality") return "Nationality";
    if (type === "company") return "Company";
    if (type === "department") return "Department";
    if (type === "job") return "Job Title";
    return "";
  };

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      setError(null);

      // Validate
      if (!data.code.trim()) {
        throw new Error("Code is required");
      }
      if (!data.name_en.trim()) {
        throw new Error("English name is required");
      }
      if (!data.name_ar.trim()) {
        throw new Error("Arabic name is required");
      }

      const tableName = getTableName();
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({
          code: data.code.trim().toUpperCase(),
          name_en: data.name_en.trim(),
          name_ar: data.name_ar.trim(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error(`Code "${data.code}" already exists`);
        }
        throw error;
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalidate queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });

      // Call the success callback with the new item
      onSuccess(result as ReferenceItem);

      // Reset form
      setFormData({
        code: "",
        name_en: "",
        name_ar: "",
      });

      // Close dialog
      onOpenChange(false);
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to add item";
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const handleCancel = () => {
    setError(null);
    setFormData({
      code: "",
      name_en: missingValue,
      name_ar: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            {t("Quick Add")} {getDisplayName()}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            {t("The")} {type} <strong>"{missingValue}"</strong> {t("was not found in your database. Add it now to continue with the import.")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900 dark:text-red-100">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">
              {t("Code")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              placeholder={
                type === "nationality"
                  ? "e.g., GER"
                  : type === "company"
                  ? "e.g., COMP001"
                  : type === "department"
                  ? "e.g., DEPT001"
                  : "e.g., JOB001"
              }
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              required
              maxLength={50}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              {t("Unique identifier (will be converted to uppercase)")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en">
              {t("Name (English)")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_en"
              placeholder={
                type === "nationality"
                  ? "e.g., Germany"
                  : type === "company"
                  ? "e.g., Tech Solutions LLC"
                  : type === "department"
                  ? "e.g., Marketing"
                  : "e.g., Software Engineer"
              }
              value={formData.name_en}
              onChange={(e) =>
                setFormData({ ...formData, name_en: e.target.value })
              }
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_ar">
              {t("Name (Arabic)")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name_ar"
              placeholder={
                type === "nationality"
                  ? "e.g., ألمانيا"
                  : type === "company"
                  ? "e.g., شركة التقنية ذ.م.م"
                  : type === "department"
                  ? "e.g., التسويق"
                  : "e.g., مهندس برمجيات"
              }
              value={formData.name_ar}
              onChange={(e) =>
                setFormData({ ...formData, name_ar: e.target.value })
              }
              required
              maxLength={255}
              dir="rtl"
              className="text-right"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={addMutation.isPending}
            >
              {t("Skip & Continue")}
            </Button>
            <Button type="submit" disabled={addMutation.isPending}>
              {addMutation.isPending ? t("Adding...") : `${t("Add")} ${getDisplayName()}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
