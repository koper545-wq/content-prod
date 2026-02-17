"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "@/components/shared/calendar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatTime, BOOKING_STATUS_LABELS } from "@/lib/utils";

interface Booking {
  id: string;
  status: string;
  campaign: { id: string; title: string };
  slot: { id: string; startAt: string; endAt: string };
  restaurant?: { name: string; city: string; addressLine: string };
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDatePl(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(new Date(y, m - 1, d));
}

export default function CreatorCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me/bookings")
      .then((r) => r.json())
      .then((data) => {
        setBookings(data.bookings || []);
        setLoading(false);
      });
  }, []);

  // Group bookings by date
  const bookingsByDate: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const dk = toDateKey(new Date(b.slot.startAt));
    if (!bookingsByDate[dk]) bookingsByDate[dk] = [];
    bookingsByDate[dk].push(b);
  });

  const markedDates = Object.keys(bookingsByDate);
  const filteredBookings = selectedDay ? bookingsByDate[selectedDay] || [] : bookings;

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime()
  );

  function handleDateClick(dateKey: string) {
    setSelectedDay(selectedDay === dateKey ? null : dateKey);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Kalendarz wizyt</h2>

      <Calendar
        selectedDates={selectedDay ? [selectedDay] : []}
        markedDates={markedDates}
        onDateClick={handleDateClick}
        className="mb-4"
      />

      {selectedDay && (
        <p className="text-sm text-gray-500 mb-3 capitalize">
          {formatDatePl(selectedDay)}
          <button onClick={() => setSelectedDay(null)} className="ml-2 text-orange-500 hover:text-orange-600 text-xs">
            Pokaż wszystkie
          </button>
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : sortedBookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays size={48} />}
          title={selectedDay ? "Brak wizyt tego dnia" : "Brak zaplanowanych wizyt"}
          description="Gdy Twoja aplikacja zostanie zaakceptowana i potwierdzisz wizytę, pojawi się tutaj."
        />
      ) : (
        <div className="space-y-3">
          {sortedBookings.map((booking) => {
            const dk = toDateKey(new Date(booking.slot.startAt));
            return (
              <Link key={booking.id} href={`/creator/booking/${booking.id}`}>
                <Card hover className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{booking.campaign.title}</h3>
                    <Badge variant={booking.status.toLowerCase()}>{BOOKING_STATUS_LABELS[booking.status] || booking.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} />
                      {formatDatePl(dk)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTime(booking.slot.startAt)}–{formatTime(booking.slot.endAt)}
                    </span>
                    {booking.restaurant && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {booking.restaurant.name}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
