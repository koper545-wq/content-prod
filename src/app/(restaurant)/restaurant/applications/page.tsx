"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, ExternalLink } from "lucide-react";
import { APPLICATION_STATUS_LABELS, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Campaign {
  id: string;
  title: string;
  status: string;
  applications: Application[];
  _count: { applications: number };
}

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  creator: { id: string; nameDisplay: string; email: string; creatorProfile: { instagramUrl: string; followerRange: string; niches: string[] } | null };
}

export default function ApplicationsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchData() {
    fetch("/api/restaurant/campaigns")
      .then((r) => r.json())
      .then(async (data) => {
        const campaignsData = data.campaigns || [];
        // Fetch details for campaigns with pending applications
        const detailed = await Promise.all(
          campaignsData
            .filter((c: Campaign) => c._count.applications > 0)
            .map((c: Campaign) =>
              fetch(`/api/restaurant/campaigns/${c.id}`)
                .then((r) => r.json())
                .then((d) => d.campaign)
            )
        );
        setCampaigns(detailed.filter(Boolean));
        setLoading(false);
      });
  }

  useEffect(() => { fetchData(); }, []);

  async function handleReject(appId: string) {
    if (!confirm("Odrzucić aplikację?")) return;
    const res = await fetch(`/api/restaurant/applications/${appId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) { toast.error("Błąd"); return; }
    toast.success("Aplikacja odrzucona");
    fetchData();
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  const allPendingApps = campaigns.flatMap((c) =>
    c.applications
      .filter((a) => a.status === "APPLIED")
      .map((a) => ({ ...a, campaignTitle: c.title, campaignId: c.id }))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Aplikacje</h2>

      {allPendingApps.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="Brak nowych aplikacji"
          description="Gdy twórcy zaaplikują na Twoje kampanie, zobaczysz ich tutaj."
        />
      ) : (
        <div className="space-y-3">
          {allPendingApps.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <a href={`/creators/${app.creator.id}`} className="font-semibold text-gray-900 text-sm hover:text-orange-500 transition-colors inline-flex items-center gap-1">
                    {app.creator.nameDisplay}
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                  <p className="text-xs text-gray-500">
                    {app.campaignTitle} · {formatDate(app.createdAt)}
                  </p>
                </div>
                <Badge variant="applied">{APPLICATION_STATUS_LABELS[app.status]}</Badge>
              </div>
              {app.creator.creatorProfile && (
                <div className="text-xs text-gray-500 mb-2">
                  {app.creator.creatorProfile.followerRange} · {app.creator.creatorProfile.niches.join(", ")}
                  {app.creator.creatorProfile.instagramUrl && (
                    <> · <a href={app.creator.creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Instagram</a></>
                  )}
                </div>
              )}
              {app.message && <p className="text-sm text-gray-600 mb-3">{app.message}</p>}
              <div className="flex gap-2">
                <a href={`/restaurant/campaigns/${app.campaignId}`}>
                  <Button size="sm">Rozpatrz</Button>
                </a>
                <Button size="sm" variant="ghost" onClick={() => handleReject(app.id)}>Odrzuć</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
