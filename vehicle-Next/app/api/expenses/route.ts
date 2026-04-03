import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

function moneyToNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v);

  if (
    typeof v === "object" &&
    v !== null &&
    typeof (v as { toNumber(): number }).toNumber === "function"
  ) {
    return (v as { toNumber(): number }).toNumber();
  }

  return Number(v);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const body = await req.json().catch(() => null);

  const vehicleId = body?.vehicleId?.toString().trim();
  const amount = Number(body?.amount);
  const note =
    body?.note == null || body?.note === ""
      ? null
      : body.note.toString().trim();

  if (!vehicleId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie vehicleId e amount > 0." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const vehicleExists = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: auth.userId,
      },
      select: { id: true },
    });

    if (!vehicleExists) {
      return NextResponse.json(
        { error: "Veículo não encontrado." },
        { status: 404, headers: corsHeaders() },
      );
    }

    const created = await prisma.expense.create({
      data: {
        vehicleId,
        amount,
        note,
      },
      select: {
        id: true,
        vehicleId: true,
        amount: true,
        note: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...created,
        amount: moneyToNumber(created.amount),
      },
      {
        status: 201,
        headers: corsHeaders(),
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar despesa." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
