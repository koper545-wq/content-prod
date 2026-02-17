"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatTime, BOOKING_STATUS_LABELS } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  creator: { id: string; nameDisplay: string; email: string };
  campaign: { id: string; title: string };
  slot: { id: string; startAt: string; endAt: string };
  contentSubmission: { id: string; status: string } | null;
}

const STATUS_TABS = [
  { value: "", label: "Wszystkie" },
  { value: "CONFIRMED", label: "Potwierdzone" },
  { value: "VISITED", label: "Po wizycie" },
  { value: "CONTENT_SUBMITTED", label: "Content" },
  { value: "COMPLETED", label: "Zakończone" },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/restaurant/bookings?${params}`)
      .then((r) => r.json())
      .then((data) => { setBookings(data.bookings || []); setLoading(false); });
  }, [statusFilter]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Rezerwacje</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setLoading(true); setStatusFilter(tab.value); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? "bg-orange-50 text-orange-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck size={48} />}
          title="Brak rezerwacji"
          description="Rezerwacje pojawią się po zaakceptowaniu aplikacji."
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link key={b.id} href={`/restaurant/bookings/${b.id}`}>
              <Card hover className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">{b.creator.nameDisplay}</span>
                    <span className="text-xs text-gray-500 ml-2">{b.campaign.title}</span>
                  </div>
                  <Badge variant={b.status.toLowerCase()}>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(b.slot.startAt)} · {formatTime(b.slot.startAt)}–{formatTime(b.slot.endAt)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
