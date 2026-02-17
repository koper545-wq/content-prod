"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { Utensils, Camera, Shield, Loader2, ArrowRight } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    key: "creator",
    label: "Twórca",
    name: "Anna Kowalska",
    desc: "Przeglądaj kampanie, aplikuj na kolaboracje, wysyłaj content",
    icon: Camera,
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200 hover:border-purple-400 hover:bg-purple-50/80",
    iconBgClass: "bg-purple-100 text-purple-600",
    badgeClass: "bg-purple-100 text-purple-700",
  },
  {
    key: "restaurant",
    label: "Restauracja",
    name: "Trattoria Bella",
    desc: "Zarządzaj kampaniami, slotami, akceptuj twórców, sprawdzaj content",
    icon: Utensils,
    bgClass: "bg-orange-50",
    borderClass: "border-orange-200 hover:border-orange-400 hover:bg-orange-50/80",
    iconBgClass: "bg-orange-100 text-orange-600",
    badgeClass: "bg-orange-100 text-orange-700",
  },
  {
    key: "admin",
    label: "Admin",
    name: "Panel administracyjny",
    desc: "Raporty, zarządzanie użytkownikami, moderacja platformy",
    icon: Shield,
    bgClass: "bg-gray-50",
    borderClass: "border-gray-200 hover:border-gray-400 hover:bg-gray-100/80",
    iconBgClass: "bg-gray-200 text-gray-600",
    badgeClass: "bg-gray-200 text-gray-700",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState<string | null>(null);

  async function handleDemoLogin(accountKey: string) {
    setLoadingAccount(accountKey);

    try {
      const res = await fetch("/api/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: accountKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Błąd logowania");
        return;
      }

      toast.success("Zalogowano!");

      switch (data.user.role) {
        case "CREATOR":
          router.push("/creator/feed");
          break;
        case "RESTAURANT_OWNER":
          router.push("/restaurant/dashboard");
          break;
        case "ADMIN":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setLoadingAccount(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Błąd logowania");
        return;
      }

      toast.success("Zalogowano!");

      // Redirect based on onboarding status
      if (data.onboardingComplete === false) {
        if (data.user.role === "CREATOR") {
          router.push("/onboarding/creator");
        } else if (data.user.role === "RESTAURANT_OWNER") {
          router.push("/onboarding/restaurant");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        switch (data.user.role) {
          case "CREATOR":
            router.push("/creator/feed");
            break;
          case "RESTAURANT_OWNER":
            router.push("/restaurant/dashboard");
            break;
          case "ADMIN":
            router.push("/admin/dashboard");
            break;
          default:
            router.push("/");
        }
      }
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  }

  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === "true";

  // Demo mode — clean, presentation-ready (only if enabled via env var)
  if (isDemo && demoEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <Link href="/" className="text-3xl font-bold text-gray-900">
              CONTENT
            </Link>
            <p className="text-gray-500 mt-2">Wybierz konto, aby zobaczyć platformę</p>
          </div>

          <div className="space-y-4">
            {DEMO_ACCOUNTS.map((account) => {
              const isLoading = loadingAccount === account.key;
              const isDisabled = loadingAccount !== null;

              return (
                <button
                  key={account.key}
                  onClick={() => handleDemoLogin(account.key)}
                  disabled={isDisabled}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-lg disabled:opacity-60 cursor-pointer ${account.borderClass}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${account.iconBgClass}`}
                    >
                      {isLoading ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : (
                        <account.icon size={22} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{account.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${account.badgeClass}`}>
                          {account.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{account.desc}</p>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Zaloguj się na własne konto
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Regular login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-orange-500 transition-colors">
            CONTENT
          </Link>
          <p className="text-gray-500 mt-2">Zaloguj się do swojego konta</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            required
          />
          <Input
            label="Hasło"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Zaloguj się
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Nie masz konta?{" "}
          <Link href="/register" className="text-orange-500 font-medium hover:underline">
            Zarejestruj się
          </Link>
        </p>

        {demoEnabled && (
          <p className="text-center text-xs text-gray-400 mt-2">
            <Link href="/login?demo=true" className="hover:text-orange-500 transition-colors">
              Wypróbuj demo →
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
