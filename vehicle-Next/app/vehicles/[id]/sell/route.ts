import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);

  const soldPrice = Number(body?.soldPrice);

  if (!Number.isFinite(soldPrice) || soldPrice < 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie soldPrice >= 0." },
      { status: 400 }
    );
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!vehicle) {
    return NextResponse.json({ error: "Veículo não encontrado." }, { status: 404 });
  }

  if (vehicle.status === "SOLD") {
    return NextResponse.json(
      { error: "Esse veículo já está marcado como vendido." },
      { status: 409 }
    );
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      status: "SOLD",
      soldPrice,
      soldDate: new Date(),
    },
    select: { id: true },
  });

  return NextResponse.json(updated);
}