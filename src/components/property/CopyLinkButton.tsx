"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { useLocale } from "next-intl";

interface Props {
  code: string;
  /** When true renders as a full-width button (used in sidebar). Default: inline pill. */
  fullWidth?: boolean;
}

export default function CopyLinkButton({ code, fullWidth = false }: Props) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/${locale}/listing/${code}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      el.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (fullWidth) {
    return (
      <button
        onClick={handleCopy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
          copied
            ? "border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400"
            : "border-primary-200 bg-white text-primary-700 hover:border-gold-400 hover:text-gold-600 dark:border-white/20 dark:bg-transparent dark:text-white/80 dark:hover:border-gold-400 dark:hover:text-gold-400"
        }`}
      >
        {copied ? (
          <><Check className="h-4 w-4" /> Link copied!</>
        ) : (
          <><Link2 className="h-4 w-4" /> Copy link</>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
        copied
          ? "border-green-400 text-green-600 dark:border-green-600 dark:text-green-400"
          : "border-primary-200 text-primary-600 hover:border-gold-400 hover:text-gold-600 dark:border-white/20 dark:text-white/60 dark:hover:border-gold-400 dark:hover:text-gold-400"
      }`}
    >
      {copied ? (
        <><Check className="h-3 w-3 text-green-500" /> <span className="text-green-600 dark:text-green-400">Copied!</span></>
      ) : (
        <><Link2 className="h-3 w-3" /> Copy link</>
      )}
    </button>
  );
}
