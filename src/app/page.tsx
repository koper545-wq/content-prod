import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Utensils,
  Camera,
  Handshake,
  CalendarCheck,
  FolderOpen,
  Shield,
  ArrowRight,
  Star,
  Users,
  Zap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await getSession();

  // If logged in, redirect to dashboard
  if (session) {
    switch (session.role) {
      case "CREATOR":
        redirect("/creator/feed");
      case "RESTAURANT_OWNER":
        redirect("/restaurant/dashboard");
      case "ADMIN":
        redirect("/admin/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">CONTENT</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              Zaloguj
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
            >
              Zarejestruj
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50" />
        <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap size={14} /> Platforma barterowa MVP
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-3xl mx-auto">
            Restauracje <span className="text-orange-500">&times;</span> Twórcy
            <br />
            <span className="text-orange-500">barterowa</span> kolaboracja
          </h1>
          <p className="text-lg text-gray-600 mt-6 max-w-xl mx-auto leading-relaxed">
            Restauracja oferuje darmowy posiłek. Twórca tworzy content na social media.
            Bez przelewów, bez faktur — czysty barter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
            >
              Rozpocznij za darmo <ArrowRight size={18} />
            </Link>
            <Link
              href="/login?demo=true"
              className="inline-flex items-center gap-2 bg-white text-gray-700 font-medium px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Star size={16} className="text-orange-500" /> Wypróbuj demo
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Jak to działa?
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-lg mx-auto">
            Prosty proces w 4 krokach — od kampanii do gotowego contentu.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                icon: Utensils,
                title: "Restauracja tworzy kampanię",
                desc: "Opisuje ofertę barterową, deliverables (reel, stories, zdjęcia) i dodaje dostępne terminy wizyt.",
              },
              {
                step: "2",
                icon: Users,
                title: "Twórca aplikuje",
                desc: "Przegląda kampanie w feedzie, wybiera preferowane terminy i wysyła zgłoszenie.",
              },
              {
                step: "3",
                icon: CalendarCheck,
                title: "Wizyta i posiłek",
                desc: "Restauracja akceptuje twórcę, przypisuje termin. Twórca potwierdza i przychodzi na wizytę.",
              },
              {
                step: "4",
                icon: Camera,
                title: "Content i zatwierdzenie",
                desc: "Twórca publikuje content i wysyła linki. Restauracja zatwierdza — kolaboracja zakończona!",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mb-4">
                  {item.step}
                </div>
                <item.icon size={24} className="text-orange-400 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two sides */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Restaurant side */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-8">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Utensils size={14} /> Dla restauracji
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Marketing w zamian za posiłek
              </h3>
              <ul className="space-y-3">
                {[
                  "Tworzysz kampanię z opisem oferty i wymaganiami",
                  "Dodajesz terminy wizyt z pojemnością",
                  "Przeglądasz aplikacje i akceptujesz twórców",
                  "Zatwierdzasz gotowy content do biblioteki",
                  "Budujesz bibliotekę contentu od twórców",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Creator side */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Camera size={14} /> Dla twórców
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Darmowe jedzenie za content
              </h3>
              <ul className="space-y-3">
                {[
                  "Przeglądasz kampanie w swoim mieście",
                  "Aplikujesz na wybrane kolaboracje",
                  "Potwierdzasz wizytę i korzystasz z oferty",
                  "Tworzysz reels, stories lub zdjęcia",
                  "Wysyłasz linki do opublikowanego contentu",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">
            Wszystko czego potrzebujesz
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Handshake, title: "System barterowy", desc: "Brak płatności — restauracja daje posiłek, twórca daje content." },
              { icon: CalendarCheck, title: "Zarządzanie slotami", desc: "Terminy wizyt z pojemnością, automatyczne potwierdzenia." },
              { icon: Camera, title: "Tracking contentu", desc: "Deadline na dostarczenie, linki do opublikowanych materiałów." },
              { icon: FolderOpen, title: "Biblioteka contentu", desc: "Cały zatwierdzony content w jednym miejscu dla restauracji." },
              { icon: Shield, title: "System strike'ów", desc: "1 strike = 14 dni blokady, 2 = 30 dni, 3 = ban permanentny." },
              { icon: Users, title: "Panel admina", desc: "Raporty, zarządzanie użytkownikami, rozwiązywanie sporów." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <f.icon size={24} className="text-orange-500 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sprawdź jak to działa
          </h2>
          <p className="text-gray-500 mb-8">
            Wypróbuj demo z gotowymi kontami — twórcy, restauracji i admina.
            Bez rejestracji, zero zobowiązań.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login?demo=true"
              className="inline-flex items-center gap-2 bg-orange-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
            >
              <Star size={16} /> Wypróbuj demo
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-gray-600 font-medium px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Stwórz własne konto
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            CONTENT — platforma barterowa restauracje &times; twórcy. MVP 2025.
          </p>
        </div>
      </footer>
    </div>
  );
}
