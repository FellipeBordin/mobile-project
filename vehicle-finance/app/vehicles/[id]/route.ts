import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function moneyToNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error
  if (v?.toNumber) return v.toNumber();
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      expenses: {
        orderBy: { createdAt: "desc" },
        select: { id: true, note: true, amount: true, createdAt: true },
      },
    },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  }

  const purchasePrice = moneyToNumber(vehicle.purchasePrice);
  const totalExpenses = vehicle.expenses.reduce(
    (acc, e) => acc + moneyToNumber(e.amount),
    0
  );
  const totalInvested = purchasePrice + totalExpenses;

  const soldPrice = vehicle.soldPrice == null ? null : moneyToNumber(vehicle.soldPrice);
  const profit =
    soldPrice == null ? null : Number((soldPrice - totalInvested).toFixed(2));

  return NextResponse.json({
    id: vehicle.id,
    name: vehicle.name,
    plate: vehicle.plate,
    status: vehicle.status,
    purchasePrice,
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalInvested: Number(totalInvested.toFixed(2)),
    soldPrice,
    profit,
    expenses: vehicle.expenses.map((e) => ({
      id: e.id,
      note: e.note,
      amount: moneyToNumber(e.amount),
      createdAt: e.createdAt,
    })),
  });
}