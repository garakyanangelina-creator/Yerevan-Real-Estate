"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { useLocale } from "next-intl";

export default function CopyLinkButton({ code }: { code: string }) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/${locale}/listing/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older mobile browsers
      const el = document.createElement("textarea");
      el.value = url;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-full border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-600 transition hover:border-gold-400 hover:text-gold-600 dark:border-white/20 dark:text-white/60 dark:hover:border-gold-400 dark:hover:text-gold-400"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600 dark:text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Link2 className="h-3 w-3" />
          Copy link
        </>
      )}
    </button>
  );
}
