"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CAMPAIGN_STATUS_LABELS } from "@/lib/utils";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";

interface Campaign {
  id: string;
  title: string;
  status: string;
  deliverablesJson: { reel?: number; stories?: number; photos?: number };
  restaurant: { id: string; name: string };
  _count: { applications: number; bookings: number; slots: number };
  createdAt: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurant/campaigns")
      .then((r) => r.json())
      .then((data) => { setCampaigns(data.campaigns || []); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="h-32 bg-gray-100 rounded-2xl" /><div className="h-32 bg-gray-100 rounded-2xl" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kampanie</h2>
        <Link href="/restaurant/campaigns/new">
          <Button size="sm"><Plus size={16} className="mr-1" /> Nowa kampania</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          icon={<Megaphone size={48} />}
          title="Brak kampanii"
          description="Utwórz swoją pierwszą kampanię barterową."
          action={
            <Link href="/restaurant/campaigns/new">
              <Button><Plus size={16} className="mr-1" /> Utwórz kampanię</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <Link key={c.id} href={`/restaurant/campaigns/${c.id}`}>
              <Card hover className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{c.title}</h3>
                  <Badge variant={c.status.toLowerCase()}>{CAMPAIGN_STATUS_LABELS[c.status]}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <DeliverableDisplay deliverables={c.deliverablesJson} />
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>{c._count.slots} terminów</span>
                    <span>{c._count.applications} aplikacji</span>
                    <span>{c._count.bookings} rezerwacji</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
