"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderOpen, Film, Camera, Clock, AlertTriangle } from "lucide-react";
import { formatDate, formatTime, BOOKING_STATUS_LABELS, APPLICATION_STATUS_LABELS } from "@/lib/utils";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";

interface Application {
  id: string;
  status: string;
  createdAt: string;
  campaign: {
    id: string;
    title: string;
    descriptionShort: string;
    deliverablesJson: { reel?: number; stories?: number; photos?: number } | { type: string; quantity: number; description?: string }[];
    status: string;
    restaurant: { id: string; name: string; city: string };
  };
}

interface Booking {
  id: string;
  status: string;
  confirmBy: string | null;
  contentDueAt: string | null;
  createdAt: string;
  campaign: { id: string; title: string; deliverablesJson: { reel?: number; stories?: number; photos?: number } | { type: string; quantity: number; description?: string }[]; contentDeadlineDays: number };
  restaurant?: { id: string; name: string; city: string; addressLine: string };
  slot: { id: string; startAt: string; endAt: string };
  contentSubmission: { id: string; status: string } | null;
}

type DeliverableItem = { type: string; quantity: number; description?: string };

function normalizeDeliverables(d: Booking["campaign"]["deliverablesJson"]): DeliverableItem[] {
  if (Array.isArray(d)) return d;
  const items: DeliverableItem[] = [];
  if (d && typeof d === "object") {
    const obj = d as { reel?: number; stories?: number; photos?: number };
    if (obj.reel) items.push({ type: "IG_REEL", quantity: obj.reel });
    if (obj.stories) items.push({ type: "IG_STORY", quantity: obj.stories });
    if (obj.photos) items.push({ type: "PHOTO", quantity: obj.photos });
  }
  return items;
}

function getDeliverableLabel(type: string): string {
  const map: Record<string, string> = { IG_REEL: "Reel", IG_STORY: "Stories", TIKTOK: "TikTok", PHOTO: "Zdjęcie", OTHER: "Inne" };
  return map[type] || type;
}

function getDeliverableIcon(type: string) {
  if (type === "IG_REEL" || type === "TIKTOK") return Film;
  return Camera;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function deadlineBadge(days: number) {
  if (days <= 1) return { color: "bg-red-100 text-red-700", text: days <= 0 ? "Termin minął!" : "Zostało < 1 dzień" };
  if (days <= 3) return { color: "bg-yellow-100 text-yellow-700", text: `Za ${days} dni` };
  return { color: "bg-gray-100 text-gray-600", text: `Za ${days} dni` };
}

export default function MojePage() {
  const [tab, setTab] = useState<"bookings" | "applications" | "deliverables">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/me/bookings").then((r) => r.json()),
      fetch("/api/me/applications").then((r) => r.json()),
    ]).then(([bData, aData]) => {
      setBookings(bData.bookings || []);
      setApplications(aData.applications || []);
      setLoading(false);
    });
  }, []);

  // Deliverables = bookings with status VISITED or CONTENT_PENDING that have no content submission
  const pendingDeliverables = bookings.filter(
    (b) => (b.status === "VISITED" || b.status === "CONTENT_PENDING") && !b.contentSubmission
  );

  const submittedDeliverables = bookings.filter(
    (b) => b.contentSubmission && b.contentSubmission.status === "SUBMITTED"
  );

  const allDeliverables = [...pendingDeliverables, ...submittedDeliverables];

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Moje</h2>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        <button
          onClick={() => setTab("bookings")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "bookings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Rezerwacje ({bookings.length})
        </button>
        <button
          onClick={() => setTab("applications")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === "applications" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Aplikacje ({applications.length})
        </button>
        <button
          onClick={() => setTab("deliverables")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors relative ${
            tab === "deliverables" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
          }`}
        >
          Do zrobienia
          {pendingDeliverables.length > 0 && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full">
              {pendingDeliverables.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tab === "bookings" ? (
        bookings.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={48} />}
            title="Brak rezerwacji"
            description="Gdy Twoja aplikacja zostanie zaakceptowana, rezerwacja pojawi się tutaj."
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link key={booking.id} href={`/creator/booking/${booking.id}`}>
                <Card hover className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{booking.campaign.title}</h3>
                      <p className="text-xs text-gray-500">{booking.restaurant?.name} · {booking.restaurant?.city}</p>
                    </div>
                    <Badge variant={booking.status.toLowerCase()}>{BOOKING_STATUS_LABELS[booking.status] || booking.status}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {formatDate(booking.slot.startAt)} · {formatTime(booking.slot.startAt)}–{formatTime(booking.slot.endAt)}
                  </div>
                  <DeliverableDisplay deliverables={booking.campaign.deliverablesJson} />
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : tab === "applications" ? (
        applications.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={48} />}
            title="Brak aplikacji"
            description="Aplikuj na kampanię w zakładce Feed."
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Link key={app.id} href={`/creator/campaign/${app.campaign.id}`}>
                <Card hover className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{app.campaign.title}</h3>
                      <p className="text-xs text-gray-500">{app.campaign.restaurant.name} · {app.campaign.restaurant.city}</p>
                    </div>
                    <Badge variant={app.status.toLowerCase()}>{APPLICATION_STATUS_LABELS[app.status] || app.status}</Badge>
                  </div>
                  <DeliverableDisplay deliverables={app.campaign.deliverablesJson} />
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Deliverables tab */
        allDeliverables.length === 0 ? (
          <EmptyState
            icon={<Film size={48} />}
            title="Brak oczekujących deliverables"
            description="Gdy odwiedzisz restaurację, tutaj pojawią się materiały do dostarczenia."
          />
        ) : (
          <div className="space-y-4">
            {/* Pending deliverables */}
            {pendingDeliverables.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-orange-500" />
                  Do dostarczenia ({pendingDeliverables.length})
                </p>
                <div className="space-y-3">
                  {pendingDeliverables.map((booking) => {
                    const deliverables = normalizeDeliverables(booking.campaign.deliverablesJson);
                    const days = booking.contentDueAt ? daysUntil(booking.contentDueAt) : null;
                    const badge = days !== null ? deadlineBadge(days) : null;

                    return (
                      <Card key={booking.id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{booking.campaign.title}</h3>
                            <p className="text-xs text-gray-500">{booking.restaurant?.name}</p>
                          </div>
                          {badge && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${badge.color}`}>
                              <Clock size={10} />
                              {badge.text}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 mb-3">
                          {deliverables.map((d, i) => {
                            const Icon = getDeliverableIcon(d.type);
                            return (
                              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                <Icon size={14} className="text-gray-400" />
                                <span>{d.quantity}x {getDeliverableLabel(d.type)}</span>
                                {d.description && <span className="text-xs text-gray-400">— {d.description}</span>}
                              </div>
                            );
                          })}
                        </div>

                        <Link
                          href={`/creator/booking/${booking.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
                        >
                          Wyślij content →
                        </Link>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submitted deliverables */}
            {submittedDeliverables.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Wysłane, oczekują na akceptację ({submittedDeliverables.length})
                </p>
                <div className="space-y-3">
                  {submittedDeliverables.map((booking) => (
                    <Card key={booking.id} className="p-4 opacity-75">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{booking.campaign.title}</h3>
                          <p className="text-xs text-gray-500">{booking.restaurant?.name}</p>
                        </div>
                        <Badge variant="active">Wysłany</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
