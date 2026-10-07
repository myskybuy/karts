import { NextRequest, NextResponse } from "next/server";
import { listProducts, ProductSort } from "@/lib/products";

const SORTS: ProductSort[] = ["relevance", "price_asc", "price_desc"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const exclude = Number(searchParams.get("exclude"));
  const limit = Number(searchParams.get("limit"));
  const sort = searchParams.get("sort") as ProductSort;
  const products = await listProducts({
    category: searchParams.get("category") || undefined,
    sale: searchParams.get("sale") === "1",
    q: searchParams.get("q") || undefined,
    excludeId: Number.isFinite(exclude) && exclude > 0 ? exclude : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    sort: SORTS.includes(sort) ? sort : undefined,
  });
  return NextResponse.json(products);
}
