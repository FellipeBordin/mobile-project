import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signAuthToken } from "@/lib/auth";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const name = body?.name?.toString().trim();
  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();

  if (!name || !email || !password || password.length < 4) {
    return NextResponse.json(
      { error: "Envie name, email e password válido." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma conta com esse e-mail." },
        { status: 409, headers: corsHeaders() },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        token,
        user,
      },
      { status: 201, headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao criar conta." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
