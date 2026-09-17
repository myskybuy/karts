import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ user: null });

  const rows = await prisma.$queryRaw<Array<{ id: number; name: string; email: string; phone: string | null }>>`
    SELECT id, name, email, phone FROM "User" WHERE id = ${session.userId} LIMIT 1
  `;
  const user = rows[0];
  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({ user: publicUser(user) });
}
