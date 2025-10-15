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
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    name_en: "",
    name_ar: "",
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["nationalities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("nationalities")
        .select("*")
        .order("name_en");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingItem) {
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
      setIsDialogOpen(false);
      setFormData({ code: "", name_en: "", name_ar: "" });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("nationalities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nationalities"] });
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

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {i18n.language === "ar" ? "الجنسيات" : "Nationalities"}
          </h1>
          <p className="text-gray-500 mt-1">
            {i18n.language === "ar" 
              ? `${items?.length || 0} جنسية` 
              : `${items?.length || 0} nationalities`}
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          {i18n.language === "ar" ? "إضافة جنسية" : "Add Nationality"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items?.map((item: any) => (
          <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {i18n.language === "ar" ? item.name_ar : item.name_en}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{item.code}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id, i18n.language === "ar" ? item.name_ar : item.name_en)}
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
                ? i18n.language === "ar" ? "تعديل الجنسية" : "Edit Nationality"
                : i18n.language === "ar" ? "إضافة جنسية" : "Add Nationality"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? i18n.language === "ar" ? "تعديل معلومات الجنسية" : "Edit nationality information"
                : i18n.language === "ar" ? "إضافة جنسية جديدة للنظام" : "Add a new nationality to the system"}
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
                placeholder={i18n.language === "ar" ? "الإمارات العربية المتحدة" : "United Arab Emirates"}
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
                placeholder={i18n.language === "ar" ? "الإمارات العربية المتحدة" : "الإمارات العربية المتحدة"}
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
                  ? i18n.language === "ar" ? "جاري الحفظ..." : "Saving..."
                  : i18n.language === "ar" ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
