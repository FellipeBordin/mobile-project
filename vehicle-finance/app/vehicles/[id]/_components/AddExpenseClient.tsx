"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddExpenseClient({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/vehicles/${vehicleId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: Number(amount) }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Erro ao adicionar gasto.");
      return;
    }

    setDescription("");
    setAmount("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm font-semibold">Descrição</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: troca de óleo"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold">Valor (R$)</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Ex: 250"
          inputMode="decimal"
          required
        />
      </div>

      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

      <button
        disabled={loading}
        className="rounded-md bg-black px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Salvando..." : "Adicionar gasto"}
      </button>
    </form>
  );
}