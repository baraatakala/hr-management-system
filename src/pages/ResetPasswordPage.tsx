import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setHasSession(Boolean(session));
        setCheckingSession(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
      setCheckingSession(false);
      if (sessionError) {
        setError(sessionError.message);
      } else if (!session) {
        setError(t("auth.invalidResetLink"));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }
    if (!hasSession) {
      setError(t("auth.invalidResetLink"));
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // End the recovery session so the user must sign in with the new password.
      await supabase.auth.signOut();
      setComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.resetEmailFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {complete ? t("auth.passwordUpdated") : t("auth.resetPassword")}
          </CardTitle>
          <CardDescription>{t("app.title")}</CardDescription>
        </CardHeader>
        <CardContent>
          {checkingSession ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("common.loading")}</p>
          ) : complete ? (
            <Button className="w-full" onClick={() => navigate("/login")}>
              {t("auth.backToSignIn")}
            </Button>
          ) : !hasSession ? (
            <div className="space-y-4">
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {error || t("auth.invalidResetLink")}
              </p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                {t("auth.backToSignIn")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("auth.resetPassword")}</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t("auth.confirmPassword")}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("common.loading") : t("auth.resetPassword")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
