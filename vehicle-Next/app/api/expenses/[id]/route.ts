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
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        vehicle: {
          userId: auth.userId,
        },
      },
      select: {
        id: true,
        vehicleId: true,
        amount: true,
        note: true,
        createdAt: true,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Despesa não encontrada." },
        { status: 404, headers: corsHeaders() },
      );
    }

    return NextResponse.json(
      {
        ...expense,
        amount: moneyToNumber(expense.amount),
      },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao buscar despesa." },
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
  const body = await req.json().catch(() => null);

  const amount = Number(body?.amount);
  const note =
    body?.note == null || body?.note === ""
      ? null
      : body.note.toString().trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Envie amount maior que 0." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        vehicle: {
          userId: auth.userId,
        },
      },
      select: { id: true },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Despesa não encontrada." },
        { status: 404, headers: corsHeaders() },
      );
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
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
        ...updated,
        amount: moneyToNumber(updated.amount),
      },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao atualizar despesa." },
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
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        vehicle: {
          userId: auth.userId,
        },
      },
      select: { id: true },
    });

    if (!expense) {
      return NextResponse.json(
        { error: "Despesa não encontrada." },
        { status: 404, headers: corsHeaders() },
      );
    }

    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Falha ao excluir despesa." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
