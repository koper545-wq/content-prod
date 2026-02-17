"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { UserCheck, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface PendingUser {
  id: string;
  nameDisplay: string;
  email: string;
  role: string;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  CREATOR: "Twórca",
  RESTAURANT_OWNER: "Restaurator",
};

export default function AdminWnioskiPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users?status=PENDING_VERIFICATION&page=1")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  async function handleVerify(userId: string, action: "approve" | "reject") {
    setActionLoading(`${userId}-${action}`);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Błąd");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success(action === "approve" ? "Użytkownik zatwierdzony" : "Użytkownik odrzucony");
    } catch {
      toast.error("Błąd serwera");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Wnioski o weryfikację</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Wnioski o weryfikację</h2>

      {users.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={48} />}
          title="Brak wniosków do weryfikacji"
          description="Wszystkie wnioski zostały rozpatrzone."
        />
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {user.nameDisplay}
                    </h3>
                    <Badge variant={user.role.toLowerCase()}>
                      {ROLE_LABELS[user.role] || user.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail size={12} />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleVerify(user.id, "approve")}
                    loading={actionLoading === `${user.id}-approve`}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Zatwierdź
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleVerify(user.id, "reject")}
                    loading={actionLoading === `${user.id}-reject`}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Odrzuć
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
