"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, FolderOpen, User, Bell, LogOut, CalendarDays } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/creator/feed", label: "Feed", icon: Compass },
  { href: "/creator/kalendarz", label: "Kalendarz", icon: CalendarDays },
  { href: "/creator/moje", label: "Moje", icon: FolderOpen },
  { href: "/creator/profil", label: "Profil", icon: User },
];

export function CreatorLayout({ children }: { children: ReactNode }) {
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:text-orange-500 transition-colors">
            CONTENT
          </Link>
          <div className="flex items-center gap-3">
            {userName && (
              <span className="text-xs text-gray-500 hidden sm:block">{userName}</span>
            )}
            <Link href="/creator/moje" className="relative text-gray-400 hover:text-gray-600">
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
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 safe-area-pb">
        <div className="flex items-center justify-around max-w-lg mx-auto h-16">
          {NAV_ITEMS.map((item) => {
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
