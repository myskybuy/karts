import { NextResponse } from "next/server";
import { getBanner } from "@/lib/products";

export async function GET() {
  return NextResponse.json(await getBanner());
}
