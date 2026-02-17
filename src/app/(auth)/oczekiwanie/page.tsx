import Link from "next/link";
import { Hourglass } from "lucide-react";

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">CONTENT</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
              <Hourglass size={32} className="text-orange-500" />
            </div>
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Twoje konto czeka na weryfikację
          </h2>

          <p className="text-sm text-gray-500 leading-relaxed">
            Dziękujemy za rejestrację! Administrator sprawdzi Twoje zgłoszenie
            i aktywuje konto. Otrzymasz email z potwierdzeniem.
          </p>

          <div className="pt-2">
            <Link
              href="/login"
              className="text-sm text-orange-500 font-medium hover:underline"
            >
              Wróć do logowania
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
