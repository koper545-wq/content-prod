"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Users, CalendarCheck, CheckCircle, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface Stats {
  activeCampaigns: number;
  pendingApplications: number;
  upcomingBookings: number;
  completedBookings: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ activeCampaigns: 0, pendingApplications: 0, upcomingBookings: 0, completedBookings: 0 });
  const [hasRestaurant, setHasRestaurant] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/restaurant/me").then((r) => r.json()),
      fetch("/api/restaurant/campaigns").then((r) => r.json()),
      fetch("/api/restaurant/bookings").then((r) => r.json()),
    ]).then(([rData, cData, bData]) => {
      if (!rData.restaurants || rData.restaurants.length === 0) {
        setHasRestaurant(false);
        setLoading(false);
        return;
      }

      const campaigns = cData.campaigns || [];
      const bookings = bData.bookings || [];

      setStats({
        activeCampaigns: campaigns.filter((c: { status: string }) => c.status === "ACTIVE").length,
        pendingApplications: campaigns.reduce((acc: number, c: { _count: { applications: number } }) => acc + c._count.applications, 0),
        upcomingBookings: bookings.filter((b: { status: string }) => ["BOOKED", "CONFIRMED"].includes(b.status)).length,
        completedBookings: bookings.filter((b: { status: string }) => b.status === "COMPLETED").length,
      });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="grid grid-cols-2 gap-4"><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /><div className="h-28 bg-gray-100 rounded-2xl" /></div></div>;
  }

  if (!hasRestaurant) {
    return (
      <EmptyState
        icon={<Megaphone size={48} />}
        title="Dodaj swoją restaurację"
        description="Aby tworzyć kampanie barterowe, najpierw dodaj swoją restaurację."
        action={
          <Link href="/restaurant/settings">
            <Button><Plus size={16} className="mr-1" /> Dodaj restaurację</Button>
          </Link>
        }
      />
    );
  }

  const statCards = [
    { label: "Aktywne kampanie", value: stats.activeCampaigns, icon: Megaphone, color: "text-orange-500", href: "/restaurant/campaigns" },
    { label: "Nowe aplikacje", value: stats.pendingApplications, icon: Users, color: "text-blue-500", href: "/restaurant/applications" },
    { label: "Nadchodzące wizyty", value: stats.upcomingBookings, icon: CalendarCheck, color: "text-green-500", href: "/restaurant/bookings" },
    { label: "Ukończone", value: stats.completedBookings, icon: CheckCircle, color: "text-purple-500", href: "/restaurant/bookings?status=COMPLETED" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Link href="/restaurant/campaigns/new">
          <Button size="sm"><Plus size={16} className="mr-1" /> Nowa kampania</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card hover className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={22} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
