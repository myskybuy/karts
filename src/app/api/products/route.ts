import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { listProducts, ProductSort } from "@/lib/products";

const SORTS: ProductSort[] = ["relevance", "price_asc", "price_desc"];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const exclude = Number(searchParams.get("exclude"));
  const limit = Number(searchParams.get("limit"));
  const sort = searchParams.get("sort") as ProductSort;
  const session = await getSession();
  const ids = (searchParams.get("ids") || "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  const products = await listProducts({
    category: searchParams.get("category") || undefined,
    sale: searchParams.get("sale") === "1",
    q: searchParams.get("q") || undefined,
    excludeId: Number.isFinite(exclude) && exclude > 0 ? exclude : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    ids: searchParams.has("ids") ? ids : undefined,
    includeHidden: !!session.isAdmin,
    sort: SORTS.includes(sort) ? sort : undefined,
  });
  return NextResponse.json(products);
}
