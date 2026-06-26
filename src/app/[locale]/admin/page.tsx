"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4 p-8">
        <div className="flex flex-col items-center gap-2">
          <Lock className="h-8 w-8 text-gold-500" />
          <h1 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            {t("loginTitle")}
          </h1>
        </div>
        <input
          required
          placeholder={t("username")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800"
        />
        <input
          required
          type="password"
          placeholder={t("password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-primary-800"
        />
        {error && <p className="text-sm text-red-600">{t("invalid")}</p>}
        <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
          {t("loginBtn")}
        </button>
      </form>
    </div>
  );
}
