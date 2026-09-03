"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, MessageSquare, CheckCheck } from "lucide-react";

interface ContactRequest {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  propertyId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchContacts() {
    const res = await fetch("/api/admin/contacts");
    const data = await res.json();
    setContacts(data.contacts ?? []);
    setLoading(false);
  }

  async function markRead(id: string) {
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, isRead: true } : c));
  }

  useEffect(() => { fetchContacts(); }, []);

  const unread = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between border-b border-primary-100 pb-4 dark:border-white/10">
        <div>
          <h1 className="font-serif text-xl font-semibold text-primary-900 dark:text-white">
            Contact Requests
          </h1>
          {unread > 0 && (
            <p className="text-sm text-gold-600 dark:text-gold-400">{unread} unread</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      ) : contacts.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <MessageSquare className="h-12 w-12 text-primary-200" />
          <p className="text-primary-500 dark:text-white/60">No contact requests yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className={`card p-5 ${!c.isRead ? "border-l-4 border-l-gold-400" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-primary-900 dark:text-white">{c.name}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-primary-600 dark:text-white/70">
                    <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-gold-600">
                      <Phone className="h-3.5 w-3.5" /> {c.phone}
                    </a>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-gold-600">
                        <Mail className="h-3.5 w-3.5" /> {c.email}
                      </a>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-primary-700 dark:text-white/80">{c.message}</p>
                  {c.propertyId && (
                    <p className="text-xs text-primary-400">Property: #{c.propertyId.slice(0, 6).toUpperCase()}</p>
                  )}
                  <p className="text-xs text-primary-400 dark:text-white/30">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
                {!c.isRead && (
                  <button
                    onClick={() => markRead(c.id)}
                    title="Mark as read"
                    className="shrink-0 rounded-lg border border-primary-100 p-2 text-primary-400 hover:border-gold-400 hover:text-gold-600 dark:border-white/10"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
