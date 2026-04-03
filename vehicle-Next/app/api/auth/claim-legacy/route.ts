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

  try {
    const result = await prisma.vehicle.updateMany({
      where: {
        userId: null,
      },
      data: {
        userId: auth.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        claimed: result.count,
      },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error("claim-legacy error:", error);

    return NextResponse.json(
      { error: "Falha ao assumir veículos antigos." },
      { status: 500, headers: corsHeaders() },
    );
  }
}
