"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

interface Restaurant {
  id: string;
  name: string;
  addressLine: string;
  city: string;
  instagramUrl: string | null;
  websiteUrl: string | null;
  phone: string | null;
  companyName: string | null;
  nip: string | null;
  companyAddress: string | null;
}

export default function SettingsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  function fetchRestaurants() {
    fetch("/api/restaurant/me")
      .then((r) => r.json())
      .then((data) => {
        setRestaurants(data.restaurants || []);
        setLoading(false);
      });
  }

  function startEdit(r: Restaurant) {
    setEditingId(r.id);
    setName(r.name);
    setAddressLine(r.addressLine);
    setCity(r.city);
    setInstagramUrl(r.instagramUrl || "");
    setWebsiteUrl(r.websiteUrl || "");
    setPhone(r.phone || "");
    setCompanyName(r.companyName || "");
    setNip(r.nip || "");
    setCompanyAddress(r.companyAddress || "");
  }

  function startAdd() {
    setEditingId(null);
    setShowAddForm(true);
    setName("");
    setAddressLine("");
    setCity("");
    setInstagramUrl("");
    setWebsiteUrl("");
    setPhone("");
    setCompanyName("");
    setNip("");
    setCompanyAddress("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const res = await fetch("/api/restaurant/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, name, addressLine, city, instagramUrl: instagramUrl || null, websiteUrl: websiteUrl || null, phone: phone || null, companyName: companyName || null, nip: nip || null, companyAddress: companyAddress || null }),
        });
        if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
        toast.success("Zapisano!");
        setEditingId(null);
      } else {
        const res = await fetch("/api/restaurant/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, addressLine, city, instagramUrl: instagramUrl || undefined, websiteUrl: websiteUrl || undefined, phone: phone || undefined, companyName: companyName || undefined, nip: nip || undefined, companyAddress: companyAddress || undefined }),
        });
        if (!res.ok) { const d = await res.json(); toast.error(d.error); return; }
        toast.success("Restauracja dodana!");
        setShowAddForm(false);
      }
      fetchRestaurants();
    } catch { toast.error("Błąd serwera"); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-100 rounded-xl w-1/3" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Ustawienia</h2>
        <Button size="sm" onClick={startAdd}><Plus size={16} className="mr-1" /> Dodaj restaurację</Button>
      </div>

      {restaurants.map((r) => (
        <Card key={r.id} className="p-4 mb-4">
          {editingId === r.id ? (
            <form onSubmit={handleSave} className="space-y-4">
              <Input label="Nazwa" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Adres" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
              <Input label="Miasto" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input label="Instagram URL" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
              <Input label="Strona www" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Nazwa firmy" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Sp. z o.o. / SA" />
              <Input label="NIP" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="1234567890" maxLength={10} />
              <Input label="Adres firmy" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="ul. Przykładowa 1, 00-001 Warszawa" />
              <div className="flex gap-2">
                <Button type="submit" loading={saving}>Zapisz</Button>
                <Button variant="ghost" type="button" onClick={() => setEditingId(null)}>Anuluj</Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{r.name}</h3>
                <Button size="sm" variant="ghost" onClick={() => startEdit(r)}>Edytuj</Button>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{r.addressLine}, {r.city}</p>
                {r.phone && <p>Tel: {r.phone}</p>}
                {r.instagramUrl && <p>IG: {r.instagramUrl}</p>}
                {r.websiteUrl && <p>Web: {r.websiteUrl}</p>}
                {r.companyName && <p>Firma: {r.companyName}</p>}
                {r.nip && <p>NIP: {r.nip}</p>}
                {r.companyAddress && <p>Adres firmy: {r.companyAddress}</p>}
              </div>
            </div>
          )}
        </Card>
      ))}

      {showAddForm && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Nowa restauracja</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Nazwa" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nazwa restauracji" required />
            <Input label="Adres" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="ul. Przykładowa 1" required />
            <Input label="Miasto" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Warszawa" required />
            <Input label="Instagram URL" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." />
            <Input label="Strona www" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://..." />
            <Input label="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+48..." />
            <Input label="Nazwa firmy" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Sp. z o.o. / SA" />
            <Input label="NIP" value={nip} onChange={(e) => setNip(e.target.value)} placeholder="1234567890" maxLength={10} />
            <Input label="Adres firmy" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="ul. Przykładowa 1, 00-001 Warszawa" />
            <div className="flex gap-2">
              <Button type="submit" loading={saving}>Dodaj</Button>
              <Button variant="ghost" type="button" onClick={() => setShowAddForm(false)}>Anuluj</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
