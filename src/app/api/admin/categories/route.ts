import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return session;
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  const category = await prisma.category.create({
    data: { name: body.name, image: body.image || "https://picsum.photos/300" },
  });
  return NextResponse.json({ success: true, category });
}
