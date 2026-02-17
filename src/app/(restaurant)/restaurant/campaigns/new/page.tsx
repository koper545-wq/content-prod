"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/shared/calendar";
import { Clock, Trash2, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

interface Restaurant {
  id: string;
  name: string;
}

interface PendingSlot {
  dateKey: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDatePl(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(y, m - 1, d));
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [title, setTitle] = useState("");
  const [descriptionShort, setDescriptionShort] = useState("");
  const [descriptionDetails, setDescriptionDetails] = useState("");
  const [offerValueDesc, setOfferValueDesc] = useState("");
  const [reelCount, setReelCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [photosCount, setPhotosCount] = useState(0);
  const [contentDeadlineDays, setContentDeadlineDays] = useState(7);
  const [cancellationPolicy, setCancellationPolicy] = useState("FLEX");
  const [loading, setLoading] = useState(false);

  // Calendar slots
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotStartTime, setSlotStartTime] = useState("12:00");
  const [slotEndTime, setSlotEndTime] = useState("14:00");
  const [slotCapacity, setSlotCapacity] = useState(2);
  const [pendingSlots, setPendingSlots] = useState<PendingSlot[]>([]);

  const todayKey = toDateKey(new Date());

  useEffect(() => {
    fetch("/api/restaurant/me")
      .then((r) => r.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        if (data.restaurants?.length > 0) {
          setRestaurantId(data.restaurants[0].id);
        }
      });
  }, []);

  function handleDateClick(dateKey: string) {
    setSelectedDate(dateKey === selectedDate ? null : dateKey);
  }

  function handleAddSlot() {
    if (!selectedDate) return;
    if (slotStartTime >= slotEndTime) {
      toast.error("Godzina zakończenia musi być po rozpoczęciu");
      return;
    }
    setPendingSlots((prev) => [
      ...prev,
      { dateKey: selectedDate, startTime: slotStartTime, endTime: slotEndTime, capacity: slotCapacity },
    ]);
    setSelectedDate(null);
    toast.success("Termin dodany");
  }

  function handleRemoveSlot(index: number) {
    setPendingSlots((prev) => prev.filter((_, i) => i !== index));
  }

  const slotDates = pendingSlots.map((s) => s.dateKey);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pendingSlots.length === 0) {
      toast.error("Dodaj przynajmniej jeden termin");
      return;
    }
    setLoading(true);

    try {
      // 1. Create campaign
      const res = await fetch("/api/restaurant/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          title,
          descriptionShort,
          descriptionDetails: descriptionDetails || undefined,
          offerValueDesc,
          deliverables: { reel: reelCount, stories: storiesCount, photos: photosCount },
          contentDeadlineDays,
          cancellationPolicy,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      const campaignId = data.campaign?.id || "demo-camp-new";

      // 2. Create slots
      for (const slot of pendingSlots) {
        const startAt = new Date(`${slot.dateKey}T${slot.startTime}`).toISOString();
        const endAt = new Date(`${slot.dateKey}T${slot.endTime}`).toISOString();
        await fetch(`/api/restaurant/campaigns/${campaignId}/slots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startAt, endAt, capacity: slot.capacity }),
        });
      }

      toast.success("Kampania utworzona z terminami!");
      router.push(`/restaurant/campaigns/${campaignId}`);
    } catch {
      toast.error("Błąd serwera");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nowa kampania</h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {restaurants.length > 1 && (
          <Select
            label="Restauracja"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
          />
        )}

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Informacje podstawowe</h3>
          <Input label="Tytuł kampanii" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="np. Kolacja za reel" required />
          <Textarea label="Krótki opis" value={descriptionShort} onChange={(e) => setDescriptionShort(e.target.value)} placeholder="Co oferujesz twórcy?" required rows={3} />
          <Textarea label="Szczegółowy opis (opcjonalnie)" value={descriptionDetails} onChange={(e) => setDescriptionDetails(e.target.value)} placeholder="Dodatkowe wytyczne..." rows={4} />
          <Input label="Wartość oferty" value={offerValueDesc} onChange={(e) => setOfferValueDesc(e.target.value)} placeholder="np. Kolacja dla 2 osób (do 200 PLN)" required />
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Deliverables</h3>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Reels" type="number" min={0} value={reelCount} onChange={(e) => setReelCount(Number(e.target.value))} />
            <Input label="Stories" type="number" min={0} value={storiesCount} onChange={(e) => setStoriesCount(Number(e.target.value))} />
            <Input label="Zdjęcia" type="number" min={0} value={photosCount} onChange={(e) => setPhotosCount(Number(e.target.value))} />
          </div>
        </Card>

        {/* Calendar-based slot creation */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Dostępne terminy</h3>
          </div>
          <p className="text-xs text-gray-500 -mt-2">Kliknij datę w kalendarzu, ustaw godziny i dodaj termin.</p>

          <Calendar
            selectedDates={selectedDate ? [selectedDate] : []}
            markedDates={slotDates}
            onDateClick={handleDateClick}
            minDate={todayKey}
          />

          {/* Inline slot picker */}
          {selectedDate && (
            <div className="bg-orange-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-orange-800">
                {formatDatePl(selectedDate)}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Od</label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Do</label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Miejsc</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={slotCapacity}
                    onChange={(e) => setSlotCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none"
                  />
                </div>
              </div>
              <Button type="button" size="sm" onClick={handleAddSlot}>
                Dodaj termin
              </Button>
            </div>
          )}

          {/* Pending slots list */}
          {pendingSlots.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Dodane terminy ({pendingSlots.length})
              </p>
              {pendingSlots
                .sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.startTime.localeCompare(b.startTime))
                .map((slot, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{formatDatePl(slot.dateKey)}</span>
                      <span className="text-gray-500">
                        <Clock size={12} className="inline mr-0.5" />
                        {slot.startTime}–{slot.endTime}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{slot.capacity} {slot.capacity === 1 ? "miejsce" : slot.capacity < 5 ? "miejsca" : "miejsc"}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveSlot(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Ustawienia</h3>
          <Input label="Dni na dostarczenie contentu" type="number" min={1} max={30} value={contentDeadlineDays} onChange={(e) => setContentDeadlineDays(Number(e.target.value))} />
          <Select
            label="Polityka anulowania"
            value={cancellationPolicy}
            onChange={(e) => setCancellationPolicy(e.target.value)}
            options={[
              { value: "FLEX", label: "Elastyczna (darmowe anulowanie do 24h)" },
              { value: "STRICT", label: "Sztywna (anulowanie = strike)" },
            ]}
          />
        </Card>

        <Button type="submit" className="w-full" loading={loading}>
          Utwórz kampanię
        </Button>
      </form>
    </div>
  );
}
