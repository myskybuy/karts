import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(users.map(publicUser));
}
