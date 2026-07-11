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
import { Plus, Edit, Trash2, Search, Filter, Users, ExternalLink, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function JobsPage() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [linkFilter, setLinkFilter] = useState<"all" | "linked" | "unlinked">("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: employeeCounts } = useQuery({
    queryKey: ["job-employee-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("job_id")
        .not("job_id", "is", null);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach((emp: any) => {
        counts[emp.job_id] = (counts[emp.job_id] || 0) + 1;
      });
      return counts;
    },
  });

  const filteredItems = items?.filter((item: any) => {
    const employeeCount = employeeCounts?.[item.id] || 0;
    if (linkFilter === "linked" && employeeCount === 0) return false;
    if (linkFilter === "unlinked" && employeeCount > 0) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesCode = item.code.toLowerCase().includes(searchLower);
      const matchesNameEn = item.name_en.toLowerCase().includes(searchLower);
      const matchesNameAr = item.name_ar.toLowerCase().includes(searchLower);
      if (!matchesCode && !matchesNameEn && !matchesNameAr) return false;
    }
    
    return true;
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
        const { error } = await supabase
          .from("jobs")
          .update(data)
          .eq("id", editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("jobs").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setIsDialogOpen(false);
      setFormData({ code: "", name_en: "", name_ar: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Step 1: Set job_id to NULL for all employees with this job
      const { error: updateError } = await supabase
        .from("employees")
        .update({ job_id: null })
        .eq("job_id", id);

      if (updateError) throw updateError;

      // Step 2: Delete the job
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
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
    // Get the count of employees with this job
    const { count } = await supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("job_id", item.id);

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

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            {t("jobs.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items?.length || 0} job positions
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {t("jobs.addJob")}
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by code or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {(["all", "linked", "unlinked"] as const).map((v) => (
              <Button key={v} variant={linkFilter === v ? "default" : "outline"} size="sm" onClick={() => setLinkFilter(v)} className="capitalize">{v}</Button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Job Title</th>
              <th className="text-left p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Arabic Name</th>
              <th className="text-center p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Employees</th>
              <th className="text-right p-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems?.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No job positions found</td></tr>
            )}
            {filteredItems?.map((item: any) => {
              const empCount = employeeCounts?.[item.id] || 0;
              return (
                <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors group">
                  <td className="p-3"><Badge variant="outline" className="font-mono text-xs">{item.code}</Badge></td>
                  <td className="p-3"><p className="font-semibold text-sm">{item.name_en}</p></td>
                  <td className="p-3 hidden md:table-cell"><p className="text-sm text-muted-foreground" dir="rtl">{item.name_ar}</p></td>
                  <td className="p-3 text-center">
                    {empCount > 0 ? (
                      <button onClick={() => navigate(`/employees?job=${item.id}`)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium transition-colors">
                        <Users className="w-3 h-3" />{empCount}<ExternalLink className="w-3 h-3 opacity-60" />
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
              );
            })}
          </tbody>
        </table>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("common.edit") : t("jobs.addJob")}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Edit job position information"
                : "Add a new job position to the system"}
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
                ? `هل أنت متأكد من حذف الوظيفة "${itemToDelete?.name_ar}"؟`
                : `Are you sure you want to delete job "${itemToDelete?.name_en}"?`}
            </DialogDescription>
            {affectedEmployeesCount > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-semibold text-yellow-800">
                  {i18n.language === "ar"
                    ? `⚠️ تحذير: ${affectedEmployeesCount} موظف مرتبط بهذه الوظيفة`
                    : `⚠️ Warning: ${affectedEmployeesCount} employee(s) linked to this job`}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {i18n.language === "ar"
                    ? "سيتم إزالة حقل الوظيفة من سجلات الموظفين (لن يتم حذف بيانات الموظفين)"
                    : "Job field will be removed from employee records (employees won't be deleted)"}
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
