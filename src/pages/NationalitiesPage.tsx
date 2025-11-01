import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, Edit, Trash2 } from "lucide-react";

export function NationalitiesPage() {
  const { t, i18n } = useTranslation();
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
      <div className="flex items-center justify-center h-64">Loading...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {i18n.language === "ar" ? "الجنسيات" : "Nationalities"}
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            {i18n.language === "ar"
              ? `${filteredItems?.length || 0} من ${items?.length || 0} جنسية`
              : `${filteredItems?.length || 0} of ${items?.length || 0} nationalities`}
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="gap-2 w-full sm:w-auto h-11 md:h-10 touch-manipulation active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          {i18n.language === "ar" ? "إضافة جنسية" : "Add Nationality"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {i18n.language === "ar" ? "بحث" : "Search"}
            </Label>
            <Input
              placeholder={i18n.language === "ar" ? "بحث بالرمز أو الاسم..." : "Search by code or name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {i18n.language === "ar" ? "حالة الربط بالموظفين" : "Employee Link Status"}
            </Label>
            <select
              value={linkedFilter}
              onChange={(e) => setLinkedFilter(e.target.value as "all" | "linked" | "unlinked")}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">{i18n.language === "ar" ? "كل الجنسيات" : "All Nationalities"}</option>
              <option value="linked">{i18n.language === "ar" ? "مع موظفين" : "With Employees"}</option>
              <option value="unlinked">{i18n.language === "ar" ? "بدون موظفين" : "Without Employees"}</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems?.map((item: any) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {i18n.language === "ar" ? item.name_ar : item.name_en}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.code}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.employee_count > 0
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}>
                    {item.employee_count} {i18n.language === "ar" ? "موظف" : "employee"}{item.employee_count !== 1 ? (i18n.language === "ar" ? "ين" : "s") : ""}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEdit(item)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {i18n.language === "ar"
              ? "لا توجد جنسيات. اضغط على 'إضافة جنسية' للبدء."
              : "No nationalities found. Click 'Add Nationality' to get started."}
          </p>
        </div>
      )}

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
