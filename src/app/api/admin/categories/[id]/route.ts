import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const category = await prisma.category.update({
    where: { id: parseInt(id, 10) },
    data: { name: body.name, image: body.image },
  });
  return NextResponse.json({ success: true, category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { id } = await params;
  const target = await prisma.category.findUnique({ where: { id: parseInt(id, 10) } });
  if (!target) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const inUse = await prisma.product.count({ where: { category: target.name } });
  if (inUse > 0) {
    return NextResponse.json({ error: "Products are linked to this category. Change their category first." }, { status: 400 });
  }

  await prisma.category.delete({ where: { id: target.id } });
  return NextResponse.json({ success: true });
}
