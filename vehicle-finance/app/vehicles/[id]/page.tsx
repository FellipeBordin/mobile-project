export const dynamic = "force-dynamic";

import AddExpenseClient from "./_components/AddExpenseClient";
import SellVehicleClient from "./_components/SellVehiclesClient";

type VehicleDetail = {
  id: string;
  name: string;
  plate: string;
  status: "IN_STOCK" | "SOLD";
  purchasePrice: number;
  totalExpenses: number;
  totalInvested: number;
  soldPrice: number | null;
  profit: number | null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

async function getVehicle(id: string): Promise<VehicleDetail | null> {
  const res = await fetch("http://localhost:3000/api/vehicles", { cache: "no-store" });
  const list: VehicleDetail[] = await res.json();
  return list.find((v) => v.id === id) ?? null;
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);

  if (!vehicle) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-xl">
          <a href="/vehicles" className="text-sm underline">Voltar</a>
          <p className="mt-4">Veículo não encontrado.</p>
        </div>
      </main>
    );
  }

  const isSold = vehicle.status === "SOLD";
  const profit = vehicle.profit ?? 0;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="flex items-start justify-between gap-3">
          <div>
            <a href="/vehicles" className="text-sm underline">Voltar</a>
            <h1 className="mt-2 text-2xl font-bold">{vehicle.name}</h1>
            <p className="text-sm text-gray-600">Placa: {vehicle.plate}</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isSold ? "bg-gray-200 text-gray-800" : "bg-green-100 text-green-800"
            }`}
          >
            {isSold ? "Vendido" : "Em estoque"}
          </span>
        </header>

        <section className="rounded-lg border p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Compra</span>
            <span className="font-semibold">{formatBRL(vehicle.purchasePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Gastos</span>
            <span className="font-semibold">{formatBRL(vehicle.totalExpenses)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total investido</span>
            <span className="font-bold">{formatBRL(vehicle.totalInvested)}</span>
          </div>

          {isSold && vehicle.soldPrice != null && (
            <>
              <div className="flex justify-between">
                <span>Venda</span>
                <span className="font-bold">{formatBRL(vehicle.soldPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resultado</span>
                <span className={`font-extrabold ${profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatBRL(profit)}
                </span>
              </div>
            </>
          )}
        </section>

        {!isSold && (
          <>
            <section className="rounded-lg border p-4 space-y-3">
              <h2 className="font-semibold">Adicionar gasto</h2>
              <form action={`/vehicles/${id}/add-expense`} method="post" />
              <AddExpenseClient vehicleId={id} />
            </section>

            <section className="rounded-lg border p-4 space-y-3">
              <h2 className="font-semibold">Marcar como vendido</h2>
              <SellVehicleClient vehicleId={id} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}


