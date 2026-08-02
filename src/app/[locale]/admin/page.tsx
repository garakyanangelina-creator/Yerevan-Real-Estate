"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.role === "employee") {
          router.push("/employee/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setError("Invalid username or password");
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
          <Image src="/logo.svg" alt="Yerevan Real Estate" width={56} height={56} className="rounded-xl" />
          <h1 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            Staff Login
          </h1>
          <p className="text-center text-xs text-primary-500 dark:text-white/60">
            Super Admin · Admin · Employee
          </p>
        </div>

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

        {error && (
          <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
            <Lock className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
