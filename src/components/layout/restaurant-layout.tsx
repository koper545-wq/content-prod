"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  CalendarCheck,
  FolderOpen,
  Settings,
  LogOut,
  Bell,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const SIDEBAR_ITEMS = [
  { href: "/restaurant/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/restaurant/campaigns", label: "Kampanie", icon: Megaphone },
  { href: "/restaurant/applications", label: "Aplikacje", icon: Users },
  { href: "/restaurant/bookings", label: "Rezerwacje", icon: CalendarCheck },
  { href: "/restaurant/umowy", label: "Umowy", icon: FileText },
  { href: "/restaurant/library", label: "Biblioteka", icon: FolderOpen },
  { href: "/restaurant/settings", label: "Ustawienia", icon: Settings },
];

const MOBILE_NAV = [
  { href: "/restaurant/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/restaurant/campaigns", label: "Kampanie", icon: Megaphone },
  { href: "/restaurant/bookings", label: "Rezerwacje", icon: CalendarCheck },
  { href: "/restaurant/settings", label: "Więcej", icon: Settings },
];

export function RestaurantLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setUnread(data.unreadCount || 0))
      .catch(() => {});
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUserName(data.nameDisplay || ""))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors">
            CONTENT
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">Panel restauracji</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          {userName && (
            <p className="px-3 text-xs text-gray-400 mb-2 truncate">{userName}</p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut size={20} />
            Wyloguj
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900">CONTENT</Link>
        <div className="flex items-center gap-3">
          <Link href="/restaurant/bookings" className="relative text-gray-400 hover:text-gray-600">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </Link>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 md:p-8 pt-16 md:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around h-16">
          {MOBILE_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                  active ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
