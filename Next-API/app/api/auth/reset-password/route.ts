import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "http://localhost:8081",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = body?.email?.toString().trim().toLowerCase();
    const newPassword = body?.newPassword?.toString();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email e nova senha são obrigatórios." },
        { status: 400, headers: corsHeaders() },
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400, headers: corsHeaders() },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404, headers: corsHeaders() },
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash },
    });

    return NextResponse.json(
      { message: "Senha atualizada com sucesso." },
      { headers: corsHeaders() },
    );
  } catch {
    return NextResponse.json(
      { error: "Erro ao resetar senha." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
