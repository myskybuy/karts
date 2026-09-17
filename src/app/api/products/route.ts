import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/products";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const exclude = Number(searchParams.get("exclude"));
  const limit = Number(searchParams.get("limit"));
  const products = await listProducts({
    category: searchParams.get("category") || undefined,
    sale: searchParams.get("sale") === "1",
    q: searchParams.get("q") || undefined,
    excludeId: Number.isFinite(exclude) && exclude > 0 ? exclude : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
  });
  return NextResponse.json(products);
}
