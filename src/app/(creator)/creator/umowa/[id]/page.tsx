"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AGREEMENT_STATUS_LABELS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Agreement {
  id: string;
  bookingId: string;
  campaignTitle: string;
  restaurantCompanyName: string;
  restaurantNip: string;
  restaurantAddress: string;
  creatorFullName: string;
  creatorPesel: string;
  deliverablesJson: unknown;
  offerDescription: string;
  contentDeadlineDays: number;
  status: string;
  restaurantSignedAt: string | null;
  creatorSignedAt: string | null;
  createdAt: string;
}

export default function CreatorAgreementPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    fetch(`/api/agreements/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgreement(data.agreement || null);
        setHtml(data.html || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleSign() {
    if (!confirm("Czy na pewno chcesz podpisać tę umowę?")) return;
    setSigning(true);
    try {
      const res = await fetch(`/api/agreements/${id}/sign`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Nie udało się podpisać");
        return;
      }
      toast.success("Umowa podpisana!");
      // Refresh agreement data
      const refreshRes = await fetch(`/api/agreements/${id}`);
      const refreshData = await refreshRes.json();
      setAgreement(refreshData.agreement);
      setHtml(refreshData.html || "");
    } catch {
      toast.error("Błąd serwera");
    } finally {
      setSigning(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded-xl w-2/3" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!agreement) {
    return <p className="text-gray-500 text-center py-8">Umowa nie znaleziona</p>;
  }

  const canSign = agreement.status === "PENDING_CREATOR";
  const isSigned = agreement.status === "SIGNED";

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-gray-500 mb-4 hover:text-gray-700">
        ← Wróć
      </button>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">Umowa barterowa</h2>
        </div>
        <Badge variant={agreement.status.toLowerCase()}>
          {AGREEMENT_STATUS_LABELS[agreement.status] || agreement.status}
        </Badge>
      </div>

      {canSign && (
        <div className="flex items-center gap-2 bg-orange-50 text-orange-800 text-sm p-3 rounded-xl mb-4">
          <AlertCircle size={16} />
          Restauracja podpisała umowę. Teraz Twoja kolej!
        </div>
      )}

      {isSigned && (
        <div className="flex items-center gap-2 bg-green-50 text-green-800 text-sm p-3 rounded-xl mb-4">
          <CheckCircle size={16} />
          Umowa podpisana przez obie strony
        </div>
      )}

      {agreement.status === "PENDING_RESTAURANT" && (
        <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 text-sm p-3 rounded-xl mb-4">
          <Clock size={16} />
          Oczekiwanie na podpis restauracji
        </div>
      )}

      <Card className="p-0 mb-4 overflow-hidden">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="agreement-html"
        />
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2">Szczegóły</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            <span className="text-gray-400">Kampania:</span>
            <p className="font-medium text-gray-900">{agreement.campaignTitle}</p>
          </div>
          <div>
            <span className="text-gray-400">Termin na content:</span>
            <p className="font-medium text-gray-900">{agreement.contentDeadlineDays} dni od wizyty</p>
          </div>
        </div>
      </Card>

      {canSign && (
        <Button className="w-full" onClick={handleSign} loading={signing}>
          <CheckCircle size={16} className="mr-2" />
          Podpisz umowę
        </Button>
      )}
    </div>
  );
}
