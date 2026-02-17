"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Globe, Instagram, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { DeliverableDisplay } from "@/components/shared/deliverables-display";
import { formatDate, formatTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface Slot {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
}

interface Campaign {
  id: string;
  title: string;
  descriptionShort: string;
  descriptionDetails: string | null;
  offerValueDesc: string;
  deliverablesJson: { reel?: number; stories?: number; photos?: number };
  contentDeadlineDays: number;
  cancellationPolicy: string;
  restaurant: {
    id: string;
    name: string;
    city: string;
    addressLine: string;
    instagramUrl: string | null;
    websiteUrl: string | null;
  };
  slots: Slot[];
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [existingApp, setExistingApp] = useState<{ id: string; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCampaign(data.campaign);
        setExistingApp(data.existingApplication);
        setLoading(false);
      });
  }, [id]);

  async function handleApply() {
    setApplying(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredSlotIds: selectedSlots, message: message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success("Aplikacja wysłana!");
      setShowApply(false);
      setExistingApp({ id: data.application.id, status: "APPLIED" });
    } catch {
      toast.error("Błąd serwera");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-2/3" /><div className="h-32 bg-gray-100 rounded-2xl" /><div className="h-24 bg-gray-100 rounded-2xl" /></div>;
  }

  if (!campaign) {
    return <p className="text-gray-500 text-center py-8">Kampania nie znaleziona</p>;
  }

  const availableSlots = campaign.slots.filter((s) => s.bookedCount < s.capacity);

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← Wróć
      </button>

      <h2 className="text-xl font-bold text-gray-900 mb-1">{campaign.title}</h2>
      <p className="text-sm text-gray-500 mb-4">{campaign.restaurant.name}</p>

      <Card className="p-4 mb-4">
        <p className="text-sm text-gray-700 mb-3">{campaign.descriptionShort}</p>
        {campaign.descriptionDetails && (
          <p className="text-sm text-gray-600">{campaign.descriptionDetails}</p>
        )}
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Deliverables</h3>
        <DeliverableDisplay deliverables={campaign.deliverablesJson} size="md" />
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">
            {campaign.offerValueDesc}
          </span>
          <span className="text-xs text-gray-500">
            · {campaign.contentDeadlineDays} dni na content
          </span>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Restauracja</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-gray-400" />
            {campaign.restaurant.addressLine}, {campaign.restaurant.city}
          </div>
          {campaign.restaurant.instagramUrl && (
            <div className="flex items-center gap-2">
              <Instagram size={14} className="text-gray-400" />
              <a href={campaign.restaurant.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Instagram</a>
            </div>
          )}
          {campaign.restaurant.websiteUrl && (
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-gray-400" />
              <a href={campaign.restaurant.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">Strona www</a>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">
          <Calendar size={14} className="inline mr-1" />
          Dostępne terminy ({availableSlots.length})
        </h3>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-gray-500">Brak dostępnych terminów</p>
        ) : (
          <div className="space-y-2">
            {availableSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <span className="font-medium text-gray-900">{formatDate(slot.startAt)}</span>
                  <span className="text-gray-500 ml-2">
                    <Clock size={12} className="inline mr-0.5" />
                    {formatTime(slot.startAt)} – {formatTime(slot.endAt)}
                  </span>
                </div>
                <Badge variant="active">
                  {slot.capacity - slot.bookedCount} miejsc
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {existingApp ? (
        <div className="text-center py-3">
          <Badge variant={existingApp.status.toLowerCase() as "applied" | "accepted" | "rejected"}>
            Aplikacja: {existingApp.status === "APPLIED" ? "Wysłana" : existingApp.status === "ACCEPTED" ? "Zaakceptowana" : "Odrzucona"}
          </Badge>
        </div>
      ) : availableSlots.length > 0 ? (
        <Button className="w-full" onClick={() => setShowApply(true)}>
          Aplikuj na kampanię
        </Button>
      ) : null}

      <Modal open={showApply} onClose={() => setShowApply(false)} title="Aplikuj na kampanię">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferowane terminy *
            </label>
            <div className="space-y-2">
              {availableSlots.map((slot) => (
                <label key={slot.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedSlots.includes(slot.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSlots([...selectedSlots, slot.id]);
                      } else {
                        setSelectedSlots(selectedSlots.filter((s) => s !== slot.id));
                      }
                    }}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm">
                    {formatDate(slot.startAt)} · {formatTime(slot.startAt)}–{formatTime(slot.endAt)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Wiadomość (opcjonalnie)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Przedstaw się restauracji..."
            />
          </div>
          <Button
            className="w-full"
            onClick={handleApply}
            loading={applying}
            disabled={selectedSlots.length === 0}
          >
            Wyślij aplikację
          </Button>
        </div>
      </Modal>
    </div>
  );
}
