"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { Lock, Smartphone } from "lucide-react";

type Step = "credentials" | "totp";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, string> = { username, password };
      if (step === "totp") body.totpCode = totpCode;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 429) {
        setError(data.error ?? "Too many attempts. Try again later.");
        return;
      }

      if (!res.ok) {
        setError(data.error ?? "Invalid username or password");
        return;
      }

      // 2FA required — password was correct, show TOTP step
      if (data.requireTotp) {
        setStep("totp");
        return;
      }

      if (data.ok) {
        if (data.role === "employee") {
          router.push("/employee/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError(data.error ?? "Login failed");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-5 p-8">
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo-new.png" alt="Yerevan Real Estate" width={56} height={56} className="rounded-xl" />
          <h1 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            {step === "totp" ? "Two-Factor Auth" : "Staff Login"}
          </h1>
          <p className="text-center text-xs text-primary-500 dark:text-white/60">
            {step === "totp"
              ? "Enter the 6-digit code from your authenticator app"
              : "Super Admin · Admin · Employee"}
          </p>
        </div>

        {step === "credentials" && (
          <div className="space-y-3">
            <input
              required
              autoComplete="username"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white"
            />
            <input
              required
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white"
            />
          </div>
        )}

        {step === "totp" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-gold-50 p-4 dark:bg-gold-900/20">
                <Smartphone className="h-8 w-8 text-gold-500" />
              </div>
            </div>
            <input
              required
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-primary-100 px-3 py-3 text-center text-2xl font-mono tracking-widest focus:border-gold-400 focus:outline-none dark:border-white/10 dark:bg-primary-800 dark:text-white"
              autoFocus
            />
            <button
              type="button"
              onClick={() => { setStep("credentials"); setTotpCode(""); setError(null); }}
              className="w-full text-xs text-primary-400 hover:text-primary-600 dark:text-white/40 dark:hover:text-white/70 transition"
            >
              ← Back to login
            </button>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || (step === "totp" && totpCode.length !== 6)}
          className="btn-primary w-full disabled:opacity-60"
        >
          {submitting
            ? step === "totp" ? "Verifying…" : "Signing in…"
            : step === "totp" ? "Verify Code" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
