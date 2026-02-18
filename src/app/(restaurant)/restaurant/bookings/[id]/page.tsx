"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Clock, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";
import { formatDate, formatTime, BOOKING_STATUS_LABELS, AGREEMENT_STATUS_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

interface ContentLink {
  type: string;
  url: string;
}

interface Booking {
  id: string;
  status: string;
  confirmBy: string | null;
  contentDueAt: string | null;
  creator: { id: string; nameDisplay: string; email: string; creatorProfile: { instagramUrl: string; followerRange: string; niches: string[] } | null };
  campaign: { id: string; title: string; deliverablesJson: { reel?: number; stories?: number; photos?: number } };
  slot: { id: string; startAt: string; endAt: string };
  contentSubmission: { id: string; status: string; linksJson: ContentLink[] } | null;
  agreement: { id: string; status: string } | null;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  function fetchBooking() {
    fetch("/api/restaurant/bookings")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.bookings || []).find((b: Booking) => b.id === id);
        setBooking(found || null);
        setLoading(false);
      });
  }

  useEffect(() => { fetchBooking(); }, [id]);

  async function handleMarkVisited() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/restaurant/bookings/${id}/mark-visited`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Wizyta oznaczona!");
      fetchBooking();
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(false); }
  }

  async function handleApproveContent() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/restaurant/bookings/${id}/approve-content`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Content zatwierdzony!");
      fetchBooking();
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(false); }
  }

  async function handleCancel() {
    if (!confirm("Na pewno anulować?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Rezerwacja anulowana");
      fetchBooking();
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(false); }
  }

  if (loading || !booking) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/2" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← Wróć
      </button>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rezerwacja</h2>
        <Badge variant={booking.status.toLowerCase()}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Twórca</h3>
        <div className="text-sm text-gray-700">
          <a href={`/creators/${booking.creator.id}`} className="font-medium hover:text-orange-500 transition-colors">{booking.creator.nameDisplay}</a>
          <p className="text-gray-500">{booking.creator.email}</p>
          {booking.creator.creatorProfile && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <span>{booking.creator.creatorProfile.followerRange} · {booking.creator.creatorProfile.niches.join(", ")}</span>
              <span>·</span>
              <a href={booking.creator.creatorProfile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                Instagram
              </a>
              <span>·</span>
              <a href={`/creators/${booking.creator.id}`} className="text-orange-500 hover:underline">
                Profil
              </a>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Wizyta</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />{formatDate(booking.slot.startAt)}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />{formatTime(booking.slot.startAt)} – {formatTime(booking.slot.endAt)}
          </div>
        </div>
        <div className="mt-3">
          <DeliverableDisplay deliverables={booking.campaign.deliverablesJson} size="md" />
        </div>
      </Card>

      {booking.contentSubmission && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Wysłany content</h3>
          <Badge variant={booking.contentSubmission.status.toLowerCase()} className="mb-3">
            {booking.contentSubmission.status === "SUBMITTED" ? "Oczekuje na zatwierdzenie" : booking.contentSubmission.status === "APPROVED" ? "Zatwierdzony" : "Do poprawy"}
          </Badge>
          <div className="space-y-2">
            {(booking.contentSubmission.linksJson as ContentLink[]).map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-orange-500 hover:underline">
                <ExternalLink size={14} /> {link.type} – {link.url}
              </a>
            ))}
          </div>
        </Card>
      )}

      {booking.agreement && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-orange-500" />
              <h3 className="font-semibold text-gray-900 text-sm">Umowa barterowa</h3>
            </div>
            <Badge variant={booking.agreement.status.toLowerCase()}>
              {AGREEMENT_STATUS_LABELS[booking.agreement.status] || booking.agreement.status}
            </Badge>
          </div>
          <Link href={`/restaurant/umowa/${booking.agreement.id}`} className="mt-2 inline-flex items-center gap-1 text-sm text-orange-500 hover:text-orange-600 font-medium">
            Zobacz umowę →
          </Link>
          {booking.agreement.status === "PENDING_RESTAURANT" && (
            <p className="text-xs text-orange-600 mt-1">⚡ Umowa czeka na Twój podpis</p>
          )}
        </Card>
      )}

      <div className="space-y-2 mt-6">
        {booking.status === "CONFIRMED" && (
          <Button className="w-full" onClick={handleMarkVisited} loading={actionLoading}>
            Oznacz wizytę jako odbytą
          </Button>
        )}
        {booking.status === "CONTENT_SUBMITTED" && (
          <Button className="w-full" onClick={handleApproveContent} loading={actionLoading}>
            Zatwierdź content
          </Button>
        )}
        {["BOOKED", "CONFIRMED"].includes(booking.status) && (
          <Button variant="danger" className="w-full" onClick={handleCancel} loading={actionLoading}>
            Anuluj rezerwację
          </Button>
        )}
      </div>
    </div>
  );
}
