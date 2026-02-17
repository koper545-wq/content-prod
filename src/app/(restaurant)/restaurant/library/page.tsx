"use client";

import { useEffect, useState } from "react";
import { FolderOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface ContentLink {
  type: string;
  url: string;
}

interface LibraryItem {
  id: string;
  campaign: { id: string; title: string };
  creator: { id: string; nameDisplay: string; creatorProfile: { instagramUrl: string } | null };
  contentSubmission: { id: string; linksJson: ContentLink[]; submittedAt: string } | null;
  updatedAt: string;
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/restaurant/library")
      .then((r) => r.json())
      .then((data) => { setItems(data.bookings || []); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Biblioteka contentu</h2>

      {items.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={48} />}
          title="Brak contentu"
          description="Zatwierdzony content od twórców pojawi się tutaj."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{item.campaign.title}</h3>
                  <p className="text-xs text-gray-500">
                    {item.creator.nameDisplay} · {formatDate(item.updatedAt)}
                  </p>
                </div>
                {item.creator.creatorProfile?.instagramUrl && (
                  <a href={item.creator.creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 text-xs hover:underline">
                    Instagram
                  </a>
                )}
              </div>
              {item.contentSubmission && (
                <div className="space-y-1.5">
                  {(item.contentSubmission.linksJson as ContentLink[]).map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-orange-500 hover:underline">
                      <ExternalLink size={12} /> {link.type}
                    </a>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
