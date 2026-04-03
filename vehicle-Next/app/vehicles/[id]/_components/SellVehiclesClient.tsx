"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SellVehicleClient({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [soldPrice, setSoldPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/vehicles/${vehicleId}/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soldPrice: Number(soldPrice) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao marcar vendido.");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-semibold">Valor de venda (R$)</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          value={soldPrice}
          onChange={(e) => setSoldPrice(e.target.value)}
          placeholder="Ex: 32000"
          inputMode="decimal"
          required
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

      <button
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Marcar como vendido"}
      </button>
    </form>
  );
}