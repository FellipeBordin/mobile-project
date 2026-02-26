import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function moneyToNumber(v: unknown): number {
  // Prisma Decimal pode virar string dependendo do runtime.
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);
  // @ts-expect-error: Decimal may have toNumber()
  if (v?.toNumber) return v.toNumber();
  return Number(v);
}

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      expenses: { select: { amount: true } },
    },
  });

  const data = vehicles.map((v) => {
    const purchasePrice = moneyToNumber(v.purchasePrice);
    const totalExpenses = v.expenses.reduce(
      (acc, e) => acc + moneyToNumber(e.amount),
      0,
    );
    const totalInvested = purchasePrice + totalExpenses;

    const soldPrice = v.soldPrice == null ? null : moneyToNumber(v.soldPrice);
    const profit =
      soldPrice == null ? null : Number((soldPrice - totalInvested).toFixed(2));

    return {
      id: v.id,
      name: v.name,
      plate: v.plate,
      status: v.status,
      purchasePrice,
      totalExpenses: Number(totalExpenses.toFixed(2)),
      totalInvested: Number(totalInvested.toFixed(2)),
      soldPrice,
      profit,
      purchaseDate: v.purchaseDate,
      soldDate: v.soldDate,
      createdAt: v.createdAt,
    };
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = body?.name?.toString().trim();
  const plate = body?.plate?.toString().trim().toUpperCase();
  const purchasePrice = Number(body?.purchasePrice);

  if (!name || !plate || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie name, plate e purchasePrice >= 0." },
      { status: 400 },
    );
  }

  try {
    const created = await prisma.vehicle.create({
      data: {
        name,
        plate,
        purchasePrice,
      },
      select: { id: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    // Unique violation plate
    if (typeof err?.code === "string" && err.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um veículo com essa placa." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Falha ao criar veículo." },
      { status: 500 },
    );
  }
}