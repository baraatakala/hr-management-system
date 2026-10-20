import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
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
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function LoginPage() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(t("auth.emailRequired"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setMessage(t("auth.resetEmailSent"));
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
          <CardTitle className="text-2xl font-bold">{t("app.title")}</CardTitle>
          <CardDescription>{isForgotPassword ? t("auth.forgotPassword") : t("auth.signIn")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isForgotPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
  
            )}
            {message && (
              <div className="text-sm text-green-700 dark:text-green-400" role="status">
                {message}
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? t("common.loading")
                : isForgotPassword
                  ? t("auth.sendResetLink")
                  : t("auth.signIn")}
            </Button>
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 underline underline-offset-4 hover:text-blue-800 dark:text-blue-400"
                onClick={() => {
                  setIsForgotPassword((value) => !value);
                  setError("");
                  setMessage("");
                }}
              >
                {isForgotPassword ? t("auth.backToSignIn") : t("auth.forgotPassword")}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
