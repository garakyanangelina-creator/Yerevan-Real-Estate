"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm({ propertyId }: { propertyId?: string }) {
  const t = useTranslations("contact");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Phase 2: POST to /api/contact-requests with { ...form, propertyId }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card p-6 text-center text-primary-700 dark:text-white/80">
        {t("success")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6">
      <input
        required
        placeholder={t("name")}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800"
      />
      <input
        required
        type="tel"
        placeholder={t("phone")}
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800"
      />
      <input
        type="email"
        placeholder={t("email")}
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800"
      />
      <textarea
        required
        rows={4}
        placeholder={t("message")}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full rounded-lg border border-primary-100 px-3 py-2.5 text-sm outline-none focus:border-gold-400 dark:border-white/10 dark:bg-primary-800"
      />
      {propertyId && (
        <input type="hidden" name="propertyId" value={propertyId} />
      )}
      <button type="submit" className="btn-primary w-full">
        {t("send")}
      </button>
    </form>
  );
}
