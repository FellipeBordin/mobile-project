import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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

export async function GET(req: Request) {
  const auth = getAuthUser(req);

  if (!auth) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401, headers: corsHeaders() },
    );
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      userId: auth.userId,
    },
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
      previousOwnerName: v.previousOwnerName,
      previousOwnerPhone: v.previousOwnerPhone,
      buyerName: v.buyerName,
      buyerPhone: v.buyerPhone,
      createdAt: v.createdAt,
    };
  });

  return NextResponse.json(data, {
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

  const name = body?.name?.toString().trim();
  const plate = body?.plate?.toString().trim().toUpperCase();
  const purchasePrice = Number(body?.purchasePrice);

  const previousOwnerName =
    body?.previousOwnerName == null || body?.previousOwnerName === ""
      ? null
      : body.previousOwnerName.toString().trim();

  const previousOwnerPhone =
    body?.previousOwnerPhone == null || body?.previousOwnerPhone === ""
      ? null
      : body.previousOwnerPhone.toString().trim();

  if (!name || !plate || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return NextResponse.json(
      { error: "Dados inválidos. Envie name, plate e purchasePrice >= 0." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const created = await prisma.vehicle.create({
      data: {
        name,
        plate,
        purchasePrice,
        purchaseDate: new Date(),
        previousOwnerName,
        previousOwnerPhone,
        userId: auth.userId,
      },
      select: { id: true },
    });

    return NextResponse.json(created, {
      status: 201,
      headers: corsHeaders(),
    });
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Já existe um veículo com essa placa." },
        { status: 409, headers: corsHeaders() },
      );
    }

    return NextResponse.json(
      { error: "Falha ao criar veículo." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
