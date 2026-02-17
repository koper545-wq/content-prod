"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Report {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  booking: {
    id: string;
    creator: { id: string; nameDisplay: string; email: string };
    campaign: { id: string; title: string };
    restaurant: { id: string; name: string };
  };
}

const REPORT_TYPE_LABELS: Record<string, string> = {
  NO_SHOW: "Nie pojawił się",
  BAD_BEHAVIOR: "Złe zachowanie",
  NO_CONTENT: "Brak contentu",
  OTHER: "Inne",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function fetchReports() {
    setLoading(true);
    fetch(`/api/admin/reports?status=${statusFilter}`)
      .then((r) => r.json())
      .then((data) => { setReports(data.reports || []); setLoading(false); });
  }

  useEffect(() => { fetchReports(); }, [statusFilter]);

  async function handleAction(reportId: string, action: "resolve" | "reject" | "strike") {
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(action === "strike" ? "Strike nadany" : action === "resolve" ? "Raport rozwiązany" : "Raport odrzucony");
      fetchReports();
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(null); }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Raporty</h2>

      <div className="flex gap-2 mb-6">
        {["OPEN", "RESOLVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {s === "OPEN" ? "Otwarte" : s === "RESOLVED" ? "Rozwiązane" : "Odrzucone"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <EmptyState icon={<Flag size={48} />} title="Brak raportów" description="Nie ma raportów do rozpatrzenia." />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Badge variant={report.type.toLowerCase()}>{REPORT_TYPE_LABELS[report.type]}</Badge>
                  <span className="text-xs text-gray-500 ml-2">{formatDate(report.createdAt)}</span>
                </div>
                <Badge variant={report.status.toLowerCase()}>{report.status}</Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{report.description}</p>
              <div className="text-xs text-gray-500 mb-3">
                <p>Twórca: <strong>{report.booking.creator.nameDisplay}</strong> ({report.booking.creator.email})</p>
                <p>Kampania: {report.booking.campaign.title} · {report.booking.restaurant.name}</p>
              </div>
              {report.status === "OPEN" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="danger" onClick={() => handleAction(report.id, "strike")} loading={actionLoading === report.id}>
                    Strike
                  </Button>
                  <Button size="sm" onClick={() => handleAction(report.id, "resolve")} loading={actionLoading === report.id}>
                    Rozwiąż
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAction(report.id, "reject")} loading={actionLoading === report.id}>
                    Odrzuć
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
