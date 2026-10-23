import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isHiddenCategory } from "@/lib/hidden-categories";
import { getSession } from "@/lib/session";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
  const session = await getSession();
  return NextResponse.json(session.isAdmin ? categories : categories.filter((c) => !isHiddenCategory(c.name)));
}
