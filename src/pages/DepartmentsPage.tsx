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

export function DepartmentsPage() {
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

  const { data: items, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        const { error } = await supabase
          .from("departments")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("departments").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setIsDialogOpen(false);
      setFormData({ code: "", name_en: "", name_ar: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Step 1: Set department_id to NULL for all employees in this department
      const { error: updateError } = await supabase
        .from("employees")
        .update({ department_id: null })
        .eq("department_id", id);

      if (updateError) throw updateError;

      // Step 2: Delete the department
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
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

  const handleDelete = async (item: any) => {
    // Get the count of employees in this department
    const { count } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("department_id", item.id);
    
    setAffectedEmployeesCount(count || 0);
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
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

  if (isLoading) return <div>{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{t("departments.title")}</h1>
        <Button 
          onClick={handleAdd}
          className="w-full sm:w-auto h-11 md:h-10 touch-manipulation active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("departments.addDepartment")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: any) => (
          <Card key={item.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  {i18n.language === "ar" ? item.name_ar : item.name_en}
                </h3>
                <p className="text-sm text-muted-foreground">{item.code}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("common.edit") : t("departments.addDepartment")}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Edit department information"
                : "Add a new department to the system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t("companies.code")}</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>{t("companies.nameEn")}</Label>
              <Input
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>{t("companies.nameAr")}</Label>
              <Input
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? t("common.loading")
                  : t("common.save")}
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
                ? `هل أنت متأكد من حذف القسم "${itemToDelete?.name_ar}"؟`
                : `Are you sure you want to delete department "${itemToDelete?.name_en}"?`}
              {affectedEmployeesCount > 0 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-semibold text-yellow-800">
                    {i18n.language === "ar"
                      ? `⚠️ تحذير: ${affectedEmployeesCount} موظف مرتبط بهذا القسم`
                      : `⚠️ Warning: ${affectedEmployeesCount} employee(s) linked to this department`}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {i18n.language === "ar"
                      ? "سيتم إزالة حقل القسم من سجلات الموظفين (لن يتم حذف بيانات الموظفين)"
                      : "Department field will be removed from employee records (employees won't be deleted)"}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("common.loading")
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
