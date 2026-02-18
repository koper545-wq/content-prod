"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FOLLOWER_RANGE_LABELS, NICHE_OPTIONS } from "@/lib/utils";
import toast from "react-hot-toast";
import { LogOut, Film, Play, Image, ExternalLink, FolderOpen, UtensilsCrossed } from "lucide-react";

interface Profile {
  city: string;
  instagramUrl: string;
  tiktokUrl: string | null;
  portfolioUrl: string | null;
  followerRange: string;
  niches: string[];
  languages: string[];
  fullName: string | null;
  pesel: string | null;
}

interface User {
  id: string;
  nameDisplay: string;
  email: string;
}

interface PortfolioItem {
  type: string;
  url: string;
  description: string | null;
  thumbnailUrl: string | null;
  campaignTitle: string;
  restaurantName: string;
  submittedAt: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [city, setCity] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [followerRange, setFollowerRange] = useState("UNDER_2K");
  const [niches, setNiches] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["pl"]);
  const [fullName, setFullName] = useState("");
  const [pesel, setPesel] = useState("");
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/me/profile").then((r) => r.json()),
    ]).then(([uData, pData]) => {
      setUser(uData);
      if (pData.profile) {
        const p = pData.profile as Profile;
        setCity(p.city);
        setInstagramUrl(p.instagramUrl);
        setTiktokUrl(p.tiktokUrl || "");
        setPortfolioUrl(p.portfolioUrl || "");
        setFollowerRange(p.followerRange);
        setNiches(p.niches);
        setLanguages(p.languages);
        setFullName(p.fullName || "");
        setPesel(p.pesel || "");
      }
      // Fetch portfolio after we have the user
      if (uData?.id) {
        fetch(`/api/creators/${uData.id}`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => {
            if (d?.portfolio) setPortfolio(d.portfolio);
          })
          .catch(() => {});
      }
      setLoading(false);
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          instagramUrl,
          tiktokUrl: tiktokUrl || undefined,
          portfolioUrl: portfolioUrl || undefined,
          followerRange,
          niches,
          languages,
          fullName: fullName || undefined,
          pesel: pesel || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Profil zapisany!");
    } catch { toast.error("Błąd serwera"); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/2" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.nameDisplay}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
          <LogOut size={20} />
        </button>
      </div>

      <form onSubmit={handleSave}>
        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Profil twórcy</h3>

          <Input
            label="Miasto"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Warszawa"
            required
          />

          <Input
            label="Instagram URL"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            required
          />

          <Input
            label="TikTok URL (opcjonalnie)"
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://tiktok.com/@username"
          />

          <Input
            label="Portfolio URL (opcjonalnie)"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://portfolio.com"
          />

          <Select
            label="Zasięg obserwujących"
            value={followerRange}
            onChange={(e) => setFollowerRange(e.target.value)}
            options={Object.entries(FOLLOWER_RANGE_LABELS).map(([value, label]) => ({ value, label }))}
          />

          <TagInput
            label="Nisze"
            value={niches}
            onChange={setNiches}
            placeholder="Dodaj niszę..."
            suggestions={NICHE_OPTIONS}
          />

          <TagInput
            label="Języki"
            value={languages}
            onChange={setLanguages}
            placeholder="Dodaj język..."
            suggestions={["pl", "en", "de", "fr", "es", "it"]}
          />

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3">Dane do umów barterowych</p>
          </div>

          <Input
            label="Pełne imię i nazwisko"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Anna Maria Kowalska"
          />

          <Input
            label="PESEL"
            value={pesel}
            onChange={(e) => setPesel(e.target.value)}
            placeholder="92010112345"
            maxLength={11}
          />
        </Card>

        <Button type="submit" className="w-full mt-4" loading={saving}>
          Zapisz profil
        </Button>
      </form>

      {/* Portfolio section */}
      <Card className="p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Moje portfolio</h3>
          {portfolio.length > 0 && (
            <span className="text-xs text-gray-400">
              {portfolio.length} {portfolio.length === 1 ? "materiał" : portfolio.length < 5 ? "materiały" : "materiałów"}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mb-4">
          Portfolio buduje się automatycznie z zatwierdzonych content submissions. Restauracje widzą je na Twoim publicznym profilu.
        </p>

        {portfolio.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={36} />}
            title="Brak materiałów w portfolio"
            description="Gdy restauracja zatwierdzi Twój content, pojawi się tutaj automatycznie."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {portfolio.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.description || item.campaignTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      {item.type === "IG_REEL" || item.type === "TIKTOK" ? (
                        <Film size={24} className="text-gray-400" />
                      ) : item.type === "IG_STORY" ? (
                        <Play size={24} className="text-gray-400" />
                      ) : (
                        <Image size={24} className="text-gray-400" />
                      )}
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-sm">
                      {item.type === "IG_REEL" ? "Reel" : item.type === "IG_STORY" ? "Story" : item.type === "TIKTOK" ? "TikTok" : item.type}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                <div className="mt-1.5">
                  <p className="text-xs font-medium text-gray-900 line-clamp-1">
                    {item.description || item.campaignTitle}
                  </p>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <UtensilsCrossed size={10} />
                    {item.restaurantName}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
