import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signAuthToken } from "@/lib/auth";

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

  const email = body?.email?.toString().trim().toLowerCase();
  const password = body?.password?.toString();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Envie email e password." },
      { status: 400, headers: corsHeaders() },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401, headers: corsHeaders() },
      );
    }

    const validPassword = await comparePassword(password, user.passwordHash);

    if (!validPassword) {
      return NextResponse.json(
        { error: "Usuário ou senha inválidos." },
        { status: 401, headers: corsHeaders() },
      );
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Falha ao fazer login." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
