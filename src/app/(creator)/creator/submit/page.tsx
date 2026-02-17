"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface ContentLink {
  type: "IG_REEL" | "IG_STORY" | "TIKTOK" | "OTHER";
  url: string;
}

function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [links, setLinks] = useState<ContentLink[]>([{ type: "IG_REEL", url: "" }]);
  const [loading, setLoading] = useState(false);

  function addLink() {
    setLinks([...links, { type: "IG_REEL", url: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(index: number, field: keyof ContentLink, value: string) {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bookingId) { toast.error("Brak ID rezerwacji"); return; }

    const validLinks = links.filter((l) => l.url.trim());
    if (validLinks.length === 0) { toast.error("Dodaj przynajmniej jeden link"); return; }

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/submit-content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: validLinks }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Content wysłany!");
      router.push(`/creator/booking/${bookingId}`);
    } catch { toast.error("Błąd serwera"); }
    finally { setLoading(false); }
  }

  if (!bookingId) {
    return <p className="text-gray-500 text-center py-8">Brak ID rezerwacji w URL</p>;
  }

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← Wróć
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Wyślij content</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {links.map((link, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Link #{i + 1}</h4>
              {links.length > 1 && (
                <button type="button" onClick={() => removeLink(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Typ</label>
                <select
                  value={link.type}
                  onChange={(e) => updateLink(i, "type", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="IG_REEL">Instagram Reel</option>
                  <option value="IG_STORY">Instagram Story</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="OTHER">Inny</option>
                </select>
              </div>
              <Input
                label="URL"
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                required
              />
            </div>
          </Card>
        ))}

        <button
          type="button"
          onClick={addLink}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors"
        >
          <Plus size={16} /> Dodaj kolejny link
        </button>

        <Button type="submit" className="w-full" loading={loading}>
          Wyślij content
        </Button>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />}>
      <SubmitForm />
    </Suspense>
  );
}
