"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Users, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface User {
  id: string;
  email: string;
  nameDisplay: string;
  role: string;
  status: string;
  suspendedUntil: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  creatorProfile: { strikesCount: number; followerRange: string } | null;
}

function UsersContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  function fetchUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", page.toString());

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      });
  }

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);

  async function handleAction(userId: string, action: "ban" | "suspend" | "activate") {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, days: 14 }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
      toast.success(action === "ban" ? "Użytkownik zbanowany" : action === "suspend" ? "Użytkownik zawieszony" : "Użytkownik aktywowany");
      fetchUsers();
    } catch { toast.error("Błąd serwera"); }
    finally { setActionLoading(null); }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Użytkownicy</h2>

      <div className="flex flex-wrap gap-2 mb-4">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Wszystkie role</option>
          <option value="CREATOR">Twórcy</option>
          <option value="RESTAURANT_OWNER">Restauratorzy</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Wszystkie statusy</option>
          <option value="ACTIVE">Aktywni</option>
          <option value="SUSPENDED">Zawieszeni</option>
          <option value="BANNED">Zbanowani</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={<Users size={48} />} title="Brak użytkowników" />
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">{user.nameDisplay}</span>
                    <Badge variant={user.role.toLowerCase()}>{user.role}</Badge>
                    <Badge variant={user.status.toLowerCase()}>{user.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {user.email} · Dołączył: {formatDate(user.createdAt)}
                    {user.creatorProfile && ` · Strikes: ${user.creatorProfile.strikesCount}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  {user.status !== "ACTIVE" && (
                    <Button size="sm" variant="ghost" onClick={() => handleAction(user.id, "activate")} loading={actionLoading === user.id}>
                      Aktywuj
                    </Button>
                  )}
                  {user.status === "ACTIVE" && (
                    <Button size="sm" variant="ghost" onClick={() => handleAction(user.id, "suspend")} loading={actionLoading === user.id}>
                      Zawieś
                    </Button>
                  )}
                  {user.status !== "BANNED" && (
                    <Button size="sm" variant="danger" onClick={() => handleAction(user.id, "ban")} loading={actionLoading === user.id}>
                      Ban
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Poprzednia</Button>
              <span className="text-sm text-gray-500">{page} / {totalPages}</span>
              <Button size="sm" variant="ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Następna</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />}>
      <UsersContent />
    </Suspense>
  );
}
