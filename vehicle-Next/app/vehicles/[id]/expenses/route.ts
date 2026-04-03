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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;

  const body = await req.json().catch(() => null);
  const note = body?.note?.toString().trim();
  const amount = Number(body?.amount);

  if (!note || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie note e amount > 0." },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  }

  const created = await prisma.expense.create({
    data: {
      vehicleId,
      note,
      amount,
    },
    select: { id: true, note: true, amount: true, createdAt: true },
  });

  return NextResponse.json(
    { ...created, amount: moneyToNumber(created.amount) },
    { status: 201 }
  );
}