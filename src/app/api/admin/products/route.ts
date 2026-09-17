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
  const product = await prisma.product.create({
    data: {
      name: body.name,
      category: body.category,
      brand: body.brand,
      price: Number(body.price),
      salePrice: Number(body.salePrice),
      image: body.image || "https://picsum.photos/500",
      image2: body.image2 || "",
      image3: body.image3 || "",
      sizeOptions: body.sizeOptions || "",
      stock: Number(body.stock),
      description: body.description || "",
    },
  });
  return NextResponse.json({ success: true, product });
}
