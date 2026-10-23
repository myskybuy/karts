import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { getSession } from "@/lib/session";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const product = await getProduct(parseInt(id, 10), !!session.isAdmin);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}
