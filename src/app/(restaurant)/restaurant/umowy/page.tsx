"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AGREEMENT_STATUS_LABELS, formatDate } from "@/lib/utils";

interface Agreement {
  id: string;
  campaignTitle: string;
  creatorFullName: string;
  status: string;
  createdAt: string;
  restaurantSignedAt: string | null;
  creatorSignedAt: string | null;
}

export default function RestaurantAgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurant/agreements")
      .then((r) => r.json())
      .then((data) => {
        setAgreements(data.agreements || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl w-1/3" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <FileText size={20} className="text-orange-500" />
        <h2 className="text-2xl font-bold text-gray-900">Umowy</h2>
      </div>

      {agreements.length === 0 ? (
        <EmptyState
          icon={<FileText size={36} />}
          title="Brak umów"
          description="Umowy pojawią się po zaakceptowaniu aplikacji twórców."
        />
      ) : (
        <div className="space-y-3">
          {agreements.map((a) => (
            <Link key={a.id} href={`/restaurant/umowa/${a.id}`}>
              <Card className="p-4 hover:border-orange-200 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{a.campaignTitle}</h3>
                  <Badge variant={a.status.toLowerCase()}>
                    {AGREEMENT_STATUS_LABELS[a.status] || a.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{a.creatorFullName}</span>
                  <span>{formatDate(a.createdAt)}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
