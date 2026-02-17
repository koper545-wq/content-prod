"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FOLLOWER_RANGE_LABELS, NICHE_OPTIONS } from "@/lib/utils";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";

const FOLLOWER_OPTIONS = Object.entries(FOLLOWER_RANGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [followerRange, setFollowerRange] = useState("FROM_2K_TO_10K");
  const [niches, setNiches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleNiche(niche: string) {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (niches.length === 0) {
      toast.error("Wybierz przynajmniej jedną niszę");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          instagramUrl,
          tiktokUrl: tiktokUrl || undefined,
          portfolioUrl: portfolioUrl || undefined,
          followerRange,
          niches,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Błąd zapisu");
        return;
      }

      toast.success("Profil uzupełniony!");
      router.push("/creator/feed");
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CONTENT</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Sparkles size={18} className="text-orange-500" />
            <p className="text-gray-600 font-medium">Uzupełnij swój profil twórcy</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">Te dane pomogą restauracjom Cię znaleźć</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <Input
            label="Miasto"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="np. Warszawa"
            required
          />
          <Input
            label="Instagram URL"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/twoj_profil"
            required
          />
          <Input
            label="TikTok URL (opcjonalnie)"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://tiktok.com/@twoj_profil"
          />
          <Input
            label="Portfolio / strona (opcjonalnie)"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://twoja-strona.pl"
          />
          <Select
            label="Zasięg followersów"
            value={followerRange}
            onChange={(e) => setFollowerRange(e.target.value)}
            options={FOLLOWER_OPTIONS}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nisze</label>
            <div className="flex flex-wrap gap-2">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    niches.includes(niche)
                      ? "bg-orange-50 border-orange-400 text-orange-600"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
            {niches.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">Wybierz min. 1 niszę</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Zapisz i przejdź dalej
          </Button>
        </form>
      </div>
    </div>
  );
}
