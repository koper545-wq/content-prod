"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Clock, Trash2, Check, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { formatDate, formatTime, CAMPAIGN_STATUS_LABELS, APPLICATION_STATUS_LABELS, BOOKING_STATUS_LABELS, FOLLOWER_RANGE_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Slot {
  id: string;
  startAt: string;
  endAt: string;
  capacity: number;
  bookedCount: number;
  status: string;
}

interface Application {
  id: string;
  status: string;
  message: string | null;
  preferredSlotIds: string[];
  createdAt: string;
  creator: { id: string; nameDisplay: string; email: string; creatorProfile: { instagramUrl: string; followerRange: string; niches: string[] } | null };
}

interface ContentSubmission {
  id: string;
  status: string;
  linksJson?: { type: string; url: string; description?: string }[];
  submittedAt?: string;
}

interface Booking {
  id: string;
  status: string;
  creator: {
    id: string;
    nameDisplay: string;
    creatorProfile: { instagramUrl: string; followerRange: string; city?: string } | null;
  };
  slot: { id: string; startAt: string; endAt: string };
  contentSubmission: ContentSubmission | null;
  checkinNote?: string | null;
}

type DeliverableItem = { type: string; quantity: number; description?: string };

interface Campaign {
  id: string;
  title: string;
  descriptionShort: string;
  offerValueDesc: string;
  deliverablesJson: { reel?: number; stories?: number; photos?: number } | DeliverableItem[];
  status: string;
  contentDeadlineDays: number;
  restaurant: { id: string; name: string };
  slots: Slot[];
  applications: Application[];
  bookings: Booking[];
}

function normalizeDeliverables(d: Campaign["deliverablesJson"]): DeliverableItem[] {
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

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("12:00");
  const [slotEndTime, setSlotEndTime] = useState("14:00");
  const [slotCapacity, setSlotCapacity] = useState(1);
  const [slotLoading, setSlotLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedSlotForAccept, setSelectedSlotForAccept] = useState("");
  const [acceptLoading, setAcceptLoading] = useState(false);
  // Roster state
  const [visitChecked, setVisitChecked] = useState<Record<string, boolean>>({});
  const [deliverableChecked, setDeliverableChecked] = useState<Record<string, boolean>>({});
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  function fetchCampaign() {
    fetch(`/api/restaurant/campaigns/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCampaign(data.campaign);
        setLoading(false);
        // Init visit checkboxes from booking status
        const vc: Record<string, boolean> = {};
        const dc: Record<string, boolean> = {};
        (data.campaign?.bookings || []).forEach((b: Booking) => {
          vc[b.id] = b.status === "VISITED" || b.status === "COMPLETED";
          // Auto-check deliverables if content approved
          if (b.contentSubmission?.status === "APPROVED") {
            const delivs = normalizeDeliverables(data.campaign.deliverablesJson);
            delivs.forEach((_: DeliverableItem, i: number) => { dc[`${b.id}-${i}`] = true; });
          }
        });
        setVisitChecked(vc);
        setDeliverableChecked(dc);
      });
  }

  useEffect(() => { fetchCampaign(); }, [id]);

  async function handlePublish() {
    const res = await fetch(`/api/restaurant/campaigns/${id}/publish`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("Kampania opublikowana!");
    fetchCampaign();
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault();
    setSlotLoading(true);
    try {
      const startAt = new Date(`${slotDate}T${slotStartTime}`).toISOString();
      const endAt = new Date(`${slotDate}T${slotEndTime}`).toISOString();
      const res = await fetch(`/api/restaurant/campaigns/${id}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt, endAt, capacity: slotCapacity }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Termin dodany!");
      setShowSlotModal(false);
      fetchCampaign();
    } catch { toast.error("Błąd serwera"); }
    finally { setSlotLoading(false); }
  }

  async function handleDeleteSlot(slotId: string) {
    if (!confirm("Usunąć termin?")) return;
    const res = await fetch(`/api/restaurant/campaigns/${id}/slots?slotId=${slotId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { toast.error(data.error); return; }
    toast.success("Termin usunięty");
    fetchCampaign();
  }

  async function handleAcceptApp() {
    if (!selectedApp || !selectedSlotForAccept) return;
    setAcceptLoading(true);
    try {
      const res = await fetch(`/api/restaurant/applications/${selectedApp.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: selectedSlotForAccept }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success("Aplikacja zaakceptowana!");
      setShowAcceptModal(false);
      fetchCampaign();
    } catch { toast.error("Błąd serwera"); }
    finally { setAcceptLoading(false); }
  }

  async function handleRejectApp(appId: string) {
    if (!confirm("Odrzucić aplikację?")) return;
    const res = await fetch(`/api/restaurant/applications/${appId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (!res.ok) { toast.error("Błąd"); return; }
    toast.success("Aplikacja odrzucona");
    fetchCampaign();
  }

  async function handleMarkVisited(bookingId: string) {
    setVisitChecked((prev) => ({ ...prev, [bookingId]: !prev[bookingId] }));
    await fetch(`/api/restaurant/bookings/${bookingId}/mark-visited`, { method: "POST" });
    toast.success("Wizyta oznaczona");
  }

  async function handleApproveContent(bookingId: string) {
    const res = await fetch(`/api/restaurant/bookings/${bookingId}/approve-content`, { method: "POST" });
    if (!res.ok) { toast.error("Błąd"); return; }
    toast.success("Content zatwierdzony!");
    fetchCampaign();
  }

  if (loading || !campaign) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/2" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  const availableSlots = campaign.slots.filter((s) => s.status === "OPEN" && s.bookedCount < s.capacity);
  const deliverables = normalizeDeliverables(campaign.deliverablesJson);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{campaign.title}</h2>
          <p className="text-sm text-gray-500">{campaign.restaurant.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={campaign.status.toLowerCase()}>{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
          {(campaign.status === "DRAFT" || campaign.status === "PAUSED") && (
            <Button size="sm" onClick={handlePublish}>Publikuj</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Slots */}
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Terminy ({campaign.slots.length})</h3>
            <button onClick={() => setShowSlotModal(true)} className="text-orange-500 hover:text-orange-600">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {campaign.slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                <div>
                  <div className="font-medium text-gray-900">{formatDate(slot.startAt)}</div>
                  <div className="text-gray-500 text-xs">
                    <Clock size={10} className="inline mr-0.5" />
                    {formatTime(slot.startAt)}–{formatTime(slot.endAt)} · {slot.bookedCount}/{slot.capacity}
                  </div>
                </div>
                {slot.bookedCount === 0 && (
                  <button onClick={() => handleDeleteSlot(slot.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Applications */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Aplikacje ({campaign.applications.length})</h3>
          {campaign.applications.length === 0 ? (
            <p className="text-sm text-gray-500">Brak aplikacji</p>
          ) : (
            <div className="space-y-3">
              {campaign.applications.map((app) => (
                <div key={app.id} className="p-3 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 text-sm">{app.creator.nameDisplay}</span>
                      {app.creator.creatorProfile && (
                        <span className="text-xs text-gray-500 ml-2">
                          {FOLLOWER_RANGE_LABELS[app.creator.creatorProfile.followerRange] || app.creator.creatorProfile.followerRange}
                        </span>
                      )}
                    </div>
                    <Badge variant={app.status.toLowerCase()}>{APPLICATION_STATUS_LABELS[app.status]}</Badge>
                  </div>
                  {app.message && <p className="text-xs text-gray-600 mb-2">{app.message}</p>}
                  {app.status === "APPLIED" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => { setSelectedApp(app); setShowAcceptModal(true); }}>
                        Akceptuj
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRejectApp(app.id)}>
                        Odrzuć
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Roster — Creator bookings with checkboxes */}
      {campaign.bookings.length > 0 && (
        <Card className="p-4 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Roster twórców ({campaign.bookings.length})</h3>
          <div className="space-y-3">
            {campaign.bookings.map((b) => {
              const isExpanded = expandedBooking === b.id;
              const visited = visitChecked[b.id] || false;

              return (
                <div key={b.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedBooking(isExpanded ? null : b.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">
                        {b.creator.nameDisplay.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{b.creator.nameDisplay}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                          {b.creator.creatorProfile && (
                            <>
                              <span>{FOLLOWER_RANGE_LABELS[b.creator.creatorProfile.followerRange] || b.creator.creatorProfile.followerRange}</span>
                              {b.creator.creatorProfile.city && <span>· {b.creator.creatorProfile.city}</span>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={b.status.toLowerCase()}>{BOOKING_STATUS_LABELS[b.status] || b.status}</Badge>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
                      {/* Visit info */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <Clock size={12} className="inline mr-1" />
                          {formatDate(b.slot.startAt)} · {formatTime(b.slot.startAt)}–{formatTime(b.slot.endAt)}
                        </div>
                        <div className="flex items-center gap-3">
                          <a
                            href={`/creators/${b.creator.id}`}
                            className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Profil <ExternalLink size={10} />
                          </a>
                          {b.creator.creatorProfile?.instagramUrl && (
                            <a
                              href={b.creator.creatorProfile.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Instagram <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Visit checkbox */}
                      <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-orange-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={visited}
                          onChange={() => handleMarkVisited(b.id)}
                          className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Wizyta odbyła się</span>
                        {visited && <Check size={14} className="text-green-500 ml-auto" />}
                      </label>

                      {/* Deliverables checklist */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Deliverables</p>
                        <div className="space-y-2">
                          {deliverables.map((d, i) => {
                            const key = `${b.id}-${i}`;
                            const checked = deliverableChecked[key] || false;
                            const autoChecked = b.contentSubmission?.status === "APPROVED";

                            return (
                              <label
                                key={i}
                                className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-orange-300 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked || autoChecked}
                                  onChange={() => setDeliverableChecked((prev) => ({ ...prev, [key]: !prev[key] }))}
                                  disabled={autoChecked}
                                  className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <span className={`text-sm ${checked || autoChecked ? "line-through text-gray-400" : "text-gray-700"}`}>
                                  {d.quantity}x {getDeliverableLabel(d.type)}
                                </span>
                                {d.description && <span className="text-xs text-gray-400 ml-auto">{d.description}</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Content submission actions */}
                      {b.contentSubmission && (
                        <div className="p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">Content dostarczony</p>
                              <p className="text-xs text-gray-500">Status: {b.contentSubmission.status}</p>
                            </div>
                            {b.contentSubmission.status === "SUBMITTED" && (
                              <Button size="sm" onClick={() => handleApproveContent(b.id)}>
                                Zatwierdź content
                              </Button>
                            )}
                            {b.contentSubmission.status === "APPROVED" && (
                              <Badge variant="active">Zatwierdzony</Badge>
                            )}
                          </div>
                          {b.contentSubmission.linksJson && b.contentSubmission.linksJson.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {b.contentSubmission.linksJson.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {link.description || link.type} <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {!b.contentSubmission && visited && (
                        <p className="text-xs text-gray-400 italic">Oczekiwanie na dostarczenie contentu przez twórcę...</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Add Slot Modal */}
      <Modal open={showSlotModal} onClose={() => setShowSlotModal(false)} title="Dodaj termin">
        <form onSubmit={handleAddSlot} className="space-y-4">
          <Input label="Data" type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Od" type="time" value={slotStartTime} onChange={(e) => setSlotStartTime(e.target.value)} required />
            <Input label="Do" type="time" value={slotEndTime} onChange={(e) => setSlotEndTime(e.target.value)} required />
          </div>
          <Input label="Pojemność" type="number" min={1} max={10} value={slotCapacity} onChange={(e) => setSlotCapacity(Number(e.target.value))} required />
          <Button type="submit" className="w-full" loading={slotLoading}>Dodaj termin</Button>
        </form>
      </Modal>

      {/* Accept Application Modal */}
      <Modal open={showAcceptModal} onClose={() => setShowAcceptModal(false)} title="Akceptuj aplikację">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Wybierz termin dla <strong>{selectedApp?.creator.nameDisplay}</strong>:
          </p>
          <div className="space-y-2">
            {availableSlots.map((slot) => (
              <label key={slot.id} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer hover:bg-gray-50 ${selectedSlotForAccept === slot.id ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}>
                <input
                  type="radio"
                  name="slot"
                  checked={selectedSlotForAccept === slot.id}
                  onChange={() => setSelectedSlotForAccept(slot.id)}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm">
                  {formatDate(slot.startAt)} · {formatTime(slot.startAt)}–{formatTime(slot.endAt)}
                  <span className="text-gray-500 ml-1">({slot.capacity - slot.bookedCount} wolnych)</span>
                </span>
              </label>
            ))}
          </div>
          <Button className="w-full" onClick={handleAcceptApp} loading={acceptLoading} disabled={!selectedSlotForAccept}>
            Potwierdź akceptację
          </Button>
        </div>
      </Modal>
    </div>
  );
}
