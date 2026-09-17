import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  await prisma.order.update({
    where: { id: parseInt(id, 10) },
    data: { status: body.status },
  });
  return NextResponse.json({ success: true });
}
