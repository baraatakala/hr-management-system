import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import { CheckCircle, XCircle, Clock, Send, Loader2, Trash2, AlertTriangle } from "lucide-react";

export function RemindersPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, employees(name_en, name_ar, email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Delete single reminder mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      setDeletingId(null);
    },
  });

  // Delete all sent reminders
  const deleteAllSentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reminders")
        .delete()
        .eq("status", "sent");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  // Delete all reminders
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      // Get all reminder IDs first
      const { data: allReminders } = await supabase
        .from("reminders")
        .select("id");
      
      if (!allReminders || allReminders.length === 0) return;
      
      // Delete all records
      const { error } = await supabase
        .from("reminders")
        .delete()
        .in("id", allReminders.map(r => r.id));
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
  });

  const handleSendReminders = async () => {
    setIsSending(true);
    setSendResult(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token =
        session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reminders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );

      const result = await response.json();
      setSendResult(result);

      // Refresh the reminders list
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    } catch (error) {
      console.error("Error sending reminders:", error);
      setSendResult({ error: "Failed to send reminders" });
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string, employeeName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the reminder for ${employeeName}?`
      )
    ) {
      setDeletingId(id);
      deleteMutation.mutate(id);
    }
  };

  const handleDeleteAllSent = () => {
    const sentCount = reminders?.filter((r: any) => r.status === "sent").length;
    if (
      confirm(
        `Are you sure you want to delete all ${sentCount} sent reminders? This action cannot be undone.`
      )
    ) {
      deleteAllSentMutation.mutate();
    }
  };

  const handleDeleteAll = () => {
    if (
      confirm(
        `Are you sure you want to delete ALL ${reminders?.length} reminders? This action cannot be undone.`
      )
    ) {
      deleteAllMutation.mutate();
    }
  };

  if (isLoading) {
    return <div>{t("common.loading")}</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t("reminders.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reminders?.length || 0} total reminders
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendReminders}
            disabled={isSending}
            className="gap-2"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reminders Now
              </>
            )}
          </Button>
          <Button
            onClick={handleDeleteAllSent}
            disabled={
              deleteAllSentMutation.isPending ||
              !reminders?.some((r: any) => r.status === "sent")
            }
            variant="outline"
            className="gap-2 text-orange-600 hover:text-orange-700"
          >
            {deleteAllSentMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete Sent
              </>
            )}
          </Button>
          <Button
            onClick={handleDeleteAll}
            disabled={deleteAllMutation.isPending || !reminders?.length}
            variant="destructive"
            className="gap-2"
          >
            {deleteAllMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete All
              </>
            )}
          </Button>
        </div>
      </div>

      {sendResult && (
        <Card
          className={sendResult.error ? "border-red-500" : "border-green-500"}
        >
          <CardContent className="pt-6">
            {sendResult.error ? (
              <div className="text-red-600">
                <p className="font-bold">Error sending reminders</p>
                <p>{sendResult.error}</p>
              </div>
            ) : (
              <div className="text-green-600">
                <p className="font-bold">✅ Success!</p>
                <p>Processed {sendResult.processed} reminder(s)</p>
                {sendResult.results && sendResult.results.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {sendResult.results.map((r: any, i: number) => (
                      <li key={i} className="text-sm">
                        • {r.employee} - {r.document} - {r.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("reminders.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">{t("reminders.employee")}</th>
                  <th className="text-left p-3">{t("reminders.type")}</th>
                  <th className="text-left p-3">{t("reminders.targetDate")}</th>
                  <th className="text-left p-3">{t("reminders.status")}</th>
                  <th className="text-left p-3">{t("reminders.sentAt")}</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders?.map((reminder: any) => {
                  const employeeName =
                    i18n.language === "ar"
                      ? reminder.employees?.name_ar
                      : reminder.employees?.name_en;
                  return (
                    <tr
                      key={reminder.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-3">{employeeName || "Unknown"}</td>
                      <td className="p-3 capitalize">
                        {reminder.type.replace("_", " ")}
                      </td>
                      <td className="p-3">
                        {dayjs(reminder.target_date).format("MMM D, YYYY")}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(reminder.status)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              reminder.status
                            )}`}
                          >
                            {t(`reminders.${reminder.status}`)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {reminder.sent_at
                          ? dayjs(reminder.sent_at).format("MMM D, YYYY h:mm A")
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDelete(reminder.id, employeeName || "this reminder")
                          }
                          disabled={
                            deleteMutation.isPending && deletingId === reminder.id
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deleteMutation.isPending && deletingId === reminder.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!reminders || reminders.length === 0) && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Reminders
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  There are no email reminders in the system yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
