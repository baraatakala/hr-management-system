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
import { Plus, Edit, Trash2, Users, Search, Building2, ExternalLink } from "lucide-react";

export function CompaniesPage() {
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
    queryKey: ["companies"],
    queryFn: async () => {
      // Fetch companies with employee count
      const { data, error } = await supabase
        .from("companies")
        .select("*, employees(count)")
        .order("code");
      if (error) throw error;
      
      // Transform data to include employee count
      return data?.map((item: any) => ({
        ...item,
        employee_count: item.employees?.[0]?.count || 0,
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
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("companies").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setIsDialogOpen(false);
      setFormData({ code: "", name_en: "", name_ar: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // First, set company_id to NULL for all employees using this company
      const { error: updateError } = await supabase
        .from("employees")
        .update({ company_id: null })
        .eq("company_id", id);

      if (updateError) throw updateError;

      // Then delete the company
      const { error } = await supabase.from("companies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
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
    // Get count of affected employees
    const { count } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("company_id", item.id);

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

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalEmployees = items?.reduce((sum: number, c: any) => sum + (c.employee_count || 0), 0) || 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            {t("companies.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items?.length || 0} companies &bull; {totalEmployees} total employees
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("companies.addCompany")}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{items?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Companies</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Employees</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{items?.filter((c: any) => c.employee_count > 0).length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Active Companies</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">{items?.filter((c: any) => c.employee_count === 0).length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Empty Companies</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
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
            <option value="all">All Companies</option>
            <option value="linked">With Employees ({items?.filter((c: any) => c.employee_count > 0).length || 0})</option>
            <option value="unlinked">Without Employees ({items?.filter((c: any) => c.employee_count === 0).length || 0})</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Arabic Name</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employees</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No companies found
                </td>
              </tr>
            )}
            {filteredItems?.map((item: any) => (
              <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors group">
                <td className="p-3">
                  <Badge variant="outline" className="font-mono text-xs">{item.code}</Badge>
                </td>
                <td className="p-3">
                  <div>
                    <p className="font-semibold text-sm">{item.name_en}</p>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <p className="text-sm text-muted-foreground" dir="rtl">{item.name_ar}</p>
                </td>
                <td className="p-3 text-center">
                  {item.employee_count > 0 ? (
                    <button
                      onClick={() => navigate(`/employees?company=${item.id}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium transition-colors"
                    >
                      <Users className="w-3 h-3" />
                      {item.employee_count}
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">0</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item)} className="h-8 w-8 p-0 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
              {editingItem ? t("common.edit") : t("companies.addCompany")}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Edit company information"
                : "Add a new company to the system"}
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
                ? `هل أنت متأكد من حذف الشركة "${itemToDelete?.name_ar}"؟`
                : `Are you sure you want to delete company "${itemToDelete?.name_en}"?`}
            </DialogDescription>
            {affectedEmployeesCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                  {i18n.language === "ar"
                    ? `⚠️ تحذير: ${affectedEmployeesCount} موظف مرتبط بهذه الشركة`
                    : `⚠️ Warning: ${affectedEmployeesCount} employee(s) linked to this company`}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  {i18n.language === "ar"
                    ? "سيتم إزالة الشركة من بيانات الموظفين (لن يتم حذف الموظفين)"
                    : "Company field will be removed from employee records (employees won't be deleted)"}
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
