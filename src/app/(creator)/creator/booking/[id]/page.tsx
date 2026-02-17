"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";
import { formatDate, formatTime, formatDateTime, BOOKING_STATUS_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Booking {
  id: string;
  status: string;
  confirmBy: string | null;
  contentDueAt: string | null;
  campaign: { id: string; title: string; deliverablesJson: { reel?: number; stories?: number; photos?: number }; contentDeadlineDays: number };
  restaurant: { id: string; name: string; city: string; addressLine: string };
  slot: { id: string; startAt: string; endAt: string };
  contentSubmission: { id: string; status: string; linksJson: unknown } | null;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me/bookings")
      .then((r) => r.json())
      .then((data) => {
        const found = (data.bookings || []).find((b: Booking) => b.id === id);
        setBooking(found || null);
        setLoading(false);
      });
  }, [id]);

  async function handleConfirm() {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/confirm`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Wizyta potwierdzona!");
      setBooking((b) => b ? { ...b, status: "CONFIRMED" } : b);
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(false); }
  }

  async function handleCancel() {
    if (!confirm("Na pewno chcesz anulować rezerwację?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Rezerwacja anulowana");
      setBooking((b) => b ? { ...b, status: "CANCELLED_BY_CREATOR" } : b);
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(false); }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-2/3" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  if (!booking) {
    return <p className="text-gray-500 text-center py-8">Rezerwacja nie znaleziona</p>;
  }

  const canConfirm = booking.status === "BOOKED" || booking.status === "CONFIRMATION_PENDING";
  const canCancel = ["BOOKED", "CONFIRMATION_PENDING", "CONFIRMED"].includes(booking.status);
  const canSubmit = booking.status === "VISITED" || booking.status === "CONTENT_PENDING";

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← Wróć
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{booking.campaign.title}</h2>
        <Badge variant={booking.status.toLowerCase()}>{BOOKING_STATUS_LABELS[booking.status]}</Badge>
      </div>

      {canConfirm && booking.confirmBy && (
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 text-sm p-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          Potwierdź wizytę do {formatDateTime(booking.confirmBy)}
        </div>
      )}

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Szczegóły wizyty</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            {booking.restaurant.name} · {booking.restaurant.addressLine}, {booking.restaurant.city}
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            {formatDate(booking.slot.startAt)}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            {formatTime(booking.slot.startAt)} – {formatTime(booking.slot.endAt)}
          </div>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Deliverables</h3>
        <DeliverableDisplay deliverables={booking.campaign.deliverablesJson} size="md" />
        {booking.contentDueAt && (
          <p className="text-xs text-gray-500 mt-2">
            Termin na content: {formatDate(booking.contentDueAt)}
          </p>
        )}
      </Card>

      {booking.contentSubmission && (
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">Wysłany content</h3>
          <Badge variant={booking.contentSubmission.status.toLowerCase()}>
            {booking.contentSubmission.status === "SUBMITTED" ? "Oczekuje" : booking.contentSubmission.status === "APPROVED" ? "Zatwierdzony" : "Do poprawy"}
          </Badge>
        </Card>
      )}

      <div className="space-y-2 mt-6">
        {canConfirm && (
          <Button className="w-full" onClick={handleConfirm} loading={actionLoading}>
            Potwierdź wizytę
          </Button>
        )}
        {canSubmit && (
          <Link href={`/creator/submit?bookingId=${booking.id}`}>
            <Button className="w-full">Wyślij content</Button>
          </Link>
        )}
        {canCancel && (
          <Button variant="danger" className="w-full" onClick={handleCancel} loading={actionLoading}>
            Anuluj rezerwację
          </Button>
        )}
      </div>
    </div>
  );
}
