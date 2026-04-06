import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
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

type ExpenseItem = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: Date;
};

type PutBody = {
  soldPrice?: unknown;
  buyerName?: unknown;
  buyerPhone?: unknown;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const { id } = await context.params;

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      include: {
        expenses: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado." },
        { status: 404, headers: corsHeaders() },
      );
    }

    const purchasePrice = moneyToNumber(vehicle.purchasePrice);

    const expenses: ExpenseItem[] = vehicle.expenses.map(
      (e: (typeof vehicle.expenses)[number]) => ({
        id: e.id,
        amount: moneyToNumber(e.amount),
        note: e.note,
        createdAt: e.createdAt,
      }),
    );

    const totalExpenses = expenses.reduce(
      (acc: number, e: ExpenseItem) => acc + e.amount,
      0,
    );
    const totalInvested = purchasePrice + totalExpenses;

    const soldPrice =
      vehicle.soldPrice == null ? null : moneyToNumber(vehicle.soldPrice);

    const profit =
      soldPrice == null ? null : Number((soldPrice - totalInvested).toFixed(2));

    return NextResponse.json(
      {
        id: vehicle.id,
        name: vehicle.name,
        plate: vehicle.plate,
        status: vehicle.status,
        purchasePrice,
        purchaseDate: vehicle.purchaseDate,
        previousOwnerName: vehicle.previousOwnerName,
        previousOwnerPhone: vehicle.previousOwnerPhone,
        soldPrice,
        soldDate: vehicle.soldDate,
        buyerName: vehicle.buyerName,
        buyerPhone: vehicle.buyerPhone,
        totalExpenses: Number(totalExpenses.toFixed(2)),
        totalInvested: Number(totalInvested.toFixed(2)),
        profit,
        createdAt: vehicle.createdAt,
        expenses,
      },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao buscar veículo." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const { id } = await context.params;
  const body = (await req.json().catch(() => null)) as PutBody | null;

  const soldPrice = Number(body?.soldPrice);

  const buyerName =
    body?.buyerName == null || body?.buyerName === ""
      ? null
      : body.buyerName.toString().trim();

  const buyerPhone =
    body?.buyerPhone == null || body?.buyerPhone === ""
      ? null
      : body.buyerPhone.toString().trim();

  if (!Number.isFinite(soldPrice) || soldPrice <= 0) {
    return NextResponse.json(
      { error: "Envie soldPrice maior que 0." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      select: { id: true, status: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado." },
        { status: 404, headers: corsHeaders() },
      );
    }

    if (vehicle.status === "SOLD") {
      return NextResponse.json(
        { error: "Esse veículo já foi marcado como vendido." },
        { status: 400, headers: corsHeaders() },
      );
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        soldPrice,
        soldDate: new Date(),
        buyerName,
        buyerPhone,
        status: "SOLD",
      },
      select: {
        id: true,
        status: true,
        soldPrice: true,
        soldDate: true,
        buyerName: true,
        buyerPhone: true,
      },
    });

    return NextResponse.json(
      {
        id: updated.id,
        status: updated.status,
        soldPrice:
          updated.soldPrice == null ? null : moneyToNumber(updated.soldPrice),
        soldDate: updated.soldDate,
        buyerName: updated.buyerName,
        buyerPhone: updated.buyerPhone,
      },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao marcar veículo como vendido." },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const { id } = await context.params;

  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        userId: auth.userId,
      },
      select: { id: true },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veículo não encontrado." },
        { status: 404, headers: corsHeaders() },
      );
    }

    await prisma.vehicle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir veículo." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
