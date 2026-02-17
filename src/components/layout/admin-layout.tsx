"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Flag, Users, UserCheck, LogOut } from "lucide-react";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/wnioski", label: "Wnioski", icon: UserCheck },
  { href: "/admin/reports", label: "Raporty", icon: Flag },
  { href: "/admin/users", label: "Użytkownicy", icon: Users },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-gray-900 hover:text-orange-500 transition-colors">
            CONTENT
          </Link>
          <p className="text-xs text-red-500 font-semibold mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
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
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
        <div className="flex items-center justify-around h-16">
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
