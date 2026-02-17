"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";

interface Campaign {
  id: string;
  title: string;
  descriptionShort: string;
  offerValueDesc: string;
  deliverablesJson: { reel?: number; stories?: number; photos?: number };
  status: string;
  restaurant: { id: string; name: string; city: string; instagramUrl: string | null };
  slots: { id: string; startAt: string; endAt: string; capacity: number; bookedCount: number }[];
  _count: { applications: number };
}

export default function FeedPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);

    const res = await fetch(`/api/campaigns?${params}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchCampaigns();
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Odkrywaj kampanie</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj kampanii..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Miasto"
            className="w-24 pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          <SlidersHorizontal size={16} />
        </button>
      </form>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="Brak kampanii"
          description="Nie znaleziono kampanii pasujących do Twoich kryteriów."
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/creator/campaign/${campaign.id}`}>
              <Card hover className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                    <p className="text-sm text-gray-500">
                      {campaign.restaurant.name} · {campaign.restaurant.city}
                    </p>
                  </div>
                  <Badge variant="active">
                    {campaign.slots.filter((s) => s.bookedCount < s.capacity).length} terminów
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {campaign.descriptionShort}
                </p>
                <div className="flex items-center justify-between">
                  <DeliverableDisplay deliverables={campaign.deliverablesJson} />
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
                    {campaign.offerValueDesc}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
