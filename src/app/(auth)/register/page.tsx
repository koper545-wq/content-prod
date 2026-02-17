"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CREATOR" | "RESTAURANT_OWNER">("CREATOR");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Błąd rejestracji");
        return;
      }

      toast.success("Konto utworzone! Czekaj na weryfikację.");
      router.push("/oczekiwanie");
    } catch {
      toast.error("Błąd połączenia z serwerem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CONTENT</h1>
          <p className="text-gray-500 mt-2">Utwórz nowe konto</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Jestem</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("CREATOR")}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  role === "CREATOR"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Twórcą
              </button>
              <button
                type="button"
                onClick={() => setRole("RESTAURANT_OWNER")}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  role === "RESTAURANT_OWNER"
                    ? "border-orange-500 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Restauratorem
              </button>
            </div>
          </div>

          <Input
            label="Imię i nazwisko"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jan Kowalski"
            required
          />
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
            placeholder="Min. 6 znaków"
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" loading={loading}>
            Zarejestruj się
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Masz już konto?{" "}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
