import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Globe, Users, ExternalLink } from "lucide-react";

export function NationalitiesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [affectedEmployeesCount, setAffectedEmployeesCount] = useState(0);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    name_en: "",
    name_ar: "",
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [linkedFilter, setLinkedFilter] = useState<"all" | "linked" | "unlinked">("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["nationalities"],
    queryFn: async () => {
      // Fetch nationalities
      const { data: nationalities, error } = await supabase
        .from("nationalities")
        .select("*")
        .order("name_en");
      if (error) throw error;

      // Fetch employee counts for each nationality (by name_en)
      const { data: employees } = await supabase
        .from("employees")
        .select("nationality");

      // Count employees per nationality
      const nationalityCounts = employees?.reduce((acc: any, emp: any) => {
        if (emp.nationality) {
          acc[emp.nationality] = (acc[emp.nationality] || 0) + 1;
        }
        return acc;
      }, {}) || {};

      // Attach counts to nationalities
      return nationalities?.map((nat: any) => ({
        ...nat,
        employee_count: nationalityCounts[nat.name_en] || 0,
      }));
    },
  });

  // Filter items based on search and linked status
  const filteredItems = items?.filter((item: any) => {
    const matchesSearch =
      searchTerm === "" ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name_ar.includes(searchTerm);

    const matchesLinked =
      linkedFilter === "all" ||
      (linkedFilter === "linked" && item.employee_count > 0) ||
      (linkedFilter === "unlinked" && item.employee_count === 0);

    return matchesSearch && matchesLinked;
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        // When editing: Update all employee records with old nationality name to new name
        const oldName = editingItem.name_en;
        const newName = data.name_en;

        // Step 1: Update employees if nationality name changed
        if (oldName !== newName) {
          const { error: updateEmployeesError } = await supabase
            .from("employees")
            .update({ nationality: newName })
            .eq("nationality", oldName);

          if (updateEmployeesError) throw updateEmployeesError;
        }

        // Step 2: Update the nationality record
        const { error } = await supabase
          .from("nationalities")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("nationalities").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] }); // Refresh employees too
      setIsDialogOpen(false);
      setFormData({ code: "", name_en: "", name_ar: "" });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, get the nationality name_en
      const { data: nationality } = await supabase
        .from("nationalities")
        .select("name_en")
        .eq("id", id)
        .single();

      if (nationality) {
        // Step 1: Set nationality to NULL for all employees with this nationality
        const { error: updateError } = await supabase
          .from("employees")
          .update({ nationality: null })
          .eq("nationality", nationality.name_en);

        if (updateError) throw updateError;
      }

      // Step 2: Delete the nationality
      const { error } = await supabase
        .from("nationalities")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: any) => {
      alert(error.message);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    },
  });

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      name_en: item.name_en,
      name_ar: item.name_ar,
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ code: "", name_en: "", name_ar: "" });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleDelete = async (item: any) => {
    // Get the count of employees with this nationality
    const { count } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("nationality", item.name_en);

    setAffectedEmployeesCount(count || 0);
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  const totalEmployees = items?.reduce((sum: number, n: any) => sum + (n.employee_count || 0), 0) || 0;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            {i18n.language === "ar" ? "الجنسيات" : "Nationalities"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items?.length || 0} nationalities &bull; {totalEmployees} employees
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {i18n.language === "ar" ? "إضافة جنسية" : "Add Nationality"}
        </Button>
      </div>

      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={i18n.language === "ar" ? "بحث..." : "Search by code or name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={linkedFilter}
            onChange={(e) => setLinkedFilter(e.target.value as "all" | "linked" | "unlinked")}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">{i18n.language === "ar" ? "كل الجنسيات" : "All Nationalities"}</option>
            <option value="linked">{i18n.language === "ar" ? "مع موظفين" : "With Employees"}</option>
            <option value="unlinked">{i18n.language === "ar" ? "بدون موظفين" : "Without Employees"}</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name (EN)</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Name (AR)</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employees</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No nationalities found</td></tr>
            )}
            {filteredItems?.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors group">
                <td className="p-3"><Badge variant="outline" className="font-mono text-xs">{item.code}</Badge></td>
                <td className="p-3"><p className="font-semibold text-sm">{item.name_en}</p></td>
                <td className="p-3 hidden md:table-cell"><p className="text-sm text-muted-foreground" dir="rtl">{item.name_ar}</p></td>
                <td className="p-3 text-center">
                  {item.employee_count > 0 ? (
                    <button
                      onClick={() => navigate(`/employees?nationality=${encodeURIComponent(item.name_en)}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium transition-colors"
                    >
                      <Users className="w-3 h-3" />{item.employee_count}<ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  ) : <span className="text-xs text-muted-foreground">0</span>}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} className="h-8 w-8 p-0 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? i18n.language === "ar"
                  ? "تعديل الجنسية"
                  : "Edit Nationality"
                : i18n.language === "ar"
                ? "إضافة جنسية"
                : "Add Nationality"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? i18n.language === "ar"
                  ? "تعديل معلومات الجنسية"
                  : "Edit nationality information"
                : i18n.language === "ar"
                ? "إضافة جنسية جديدة للنظام"
                : "Add a new nationality to the system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">
                {i18n.language === "ar" ? "الرمز" : "Code"}
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder={i18n.language === "ar" ? "مثال: UAE" : "e.g., UAE"}
                required
              />
            </div>
            <div>
              <Label htmlFor="name_en">
                {i18n.language === "ar" ? "الاسم بالإنجليزية" : "English Name"}
              </Label>
              <Input
                id="name_en"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                placeholder={
                  i18n.language === "ar"
                    ? "الإمارات العربية المتحدة"
                    : "United Arab Emirates"
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="name_ar">
                {i18n.language === "ar" ? "الاسم بالعربية" : "Arabic Name"}
              </Label>
              <Input
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                placeholder={
                  i18n.language === "ar"
                    ? "الإمارات العربية المتحدة"
                    : "الإمارات العربية المتحدة"
                }
                required
                dir="rtl"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {i18n.language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? i18n.language === "ar"
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : i18n.language === "ar"
                  ? "حفظ"
                  : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {i18n.language === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription>
              {i18n.language === "ar"
                ? `هل أنت متأكد من حذف الجنسية "${itemToDelete?.name_ar}"؟`
                : `Are you sure you want to delete nationality "${itemToDelete?.name_en}"?`}
            </DialogDescription>
            {affectedEmployeesCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-semibold text-yellow-800">
                  {i18n.language === "ar"
                    ? `⚠️ تحذير: ${affectedEmployeesCount} موظف مرتبط بهذه الجنسية`
                    : `⚠️ Warning: ${affectedEmployeesCount} employee(s) linked to this nationality`}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {i18n.language === "ar"
                    ? "سيتم إزالة حقل الجنسية من سجلات الموظفين (لن يتم حذف بيانات الموظفين)"
                    : "Nationality field will be removed from employee records (employees won't be deleted)"}
                </p>
              </div>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {i18n.language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? i18n.language === "ar"
                  ? "جاري الحذف..."
                  : "Deleting..."
                : i18n.language === "ar"
                ? "حذف"
                : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
