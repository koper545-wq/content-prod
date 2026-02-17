"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Users, AlertTriangle, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ openReports: 0, totalUsers: 0, bannedUsers: 0, pendingUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/reports?status=OPEN").then((r) => r.json()),
      fetch("/api/admin/users?page=1").then((r) => r.json()),
      fetch("/api/admin/users?status=BANNED&page=1").then((r) => r.json()),
      fetch("/api/admin/users?status=PENDING_VERIFICATION&page=1").then((r) => r.json()),
    ]).then(([rData, uData, bData, pData]) => {
      setStats({
        openReports: (rData.reports || []).length,
        totalUsers: uData.total || 0,
        bannedUsers: bData.total || 0,
        pendingUsers: pData.total || 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /></div></div>;
  }

  const cards = [
    { label: "Oczekujące wnioski", value: stats.pendingUsers, icon: UserCheck, color: "text-orange-500", href: "/admin/wnioski" },
    { label: "Otwarte raporty", value: stats.openReports, icon: Flag, color: "text-red-500", href: "/admin/reports" },
    { label: "Użytkownicy", value: stats.totalUsers, icon: Users, color: "text-blue-500", href: "/admin/users" },
    { label: "Zbanowani", value: stats.bannedUsers, icon: AlertTriangle, color: "text-yellow-500", href: "/admin/users?status=BANNED" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card hover className="p-5">
              <c.icon size={22} className={`${c.color} mb-3`} />
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
