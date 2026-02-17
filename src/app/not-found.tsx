import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SearchX size={40} className="text-orange-400" />
        </div>

        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Strona nie znaleziona</h2>
        <p className="text-sm text-gray-500 mb-8">
          Strona, której szukasz, nie istnieje lub została przeniesiona.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-orange-500 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            Strona główna
          </Link>
          <Link
            href="/login?demo=true"
            className="inline-flex items-center gap-2 text-gray-600 font-medium px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
          >
            Wypróbuj demo
          </Link>
        </div>
      </div>
    </div>
  );
}
