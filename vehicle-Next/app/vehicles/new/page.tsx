"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVehiclePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        plate,
        purchasePrice: Number(purchasePrice),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao cadastrar.");
      return;
    }

    router.push("/vehicles");
    router.refresh();
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Novo veículo</h1>
          <a href="/vehicles" className="text-sm underline">
            Voltar
          </a>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 rounded-lg border p-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Nome</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Gol G6 do leilão"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Placa</label>
            <input
              className="w-full rounded-md border px-3 py-2 uppercase"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="ABC1D23"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Valor de compra (R$)</label>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Ex: 25000"
              inputMode="decimal"
              required
            />
          </div>

          {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

          <button
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
      </div>
    </main>
  );
}