"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { UtensilsCrossed } from "lucide-react";

export default function RestaurantOnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/restaurant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          addressLine,
          city,
          instagramUrl: instagramUrl || undefined,
          websiteUrl: websiteUrl || undefined,
          phone: phone || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Błąd zapisu");
        return;
      }

      toast.success("Restauracja dodana!");
      router.push("/restaurant/dashboard");
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">CONTENT</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <UtensilsCrossed size={18} className="text-orange-500" />
            <p className="text-gray-600 font-medium">Dodaj swoją restaurację</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">Te dane zobaczą twórcy zainteresowani współpracą</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <Input
            label="Nazwa restauracji"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="np. Trattoria Bella"
            required
          />
          <Input
            label="Adres"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            placeholder="np. ul. Marszałkowska 42"
            required
          />
          <Input
            label="Miasto"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="np. Warszawa"
            required
          />
          <Input
            label="Instagram URL (opcjonalnie)"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/twoja_restauracja"
          />
          <Input
            label="Strona www (opcjonalnie)"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://twoja-restauracja.pl"
          />
          <Input
            label="Telefon (opcjonalnie)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+48 22 123 4567"
          />

          <Button type="submit" className="w-full" loading={loading}>
            Zapisz i przejdź dalej
          </Button>
        </form>
      </div>
    </div>
  );
}
