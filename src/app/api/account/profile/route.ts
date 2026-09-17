import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isValidPhone, normalizePhone, publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const body = await req.json();
  const name = String(body.name || "").trim();
  const phoneRaw = String(body.phone || "").trim();

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name" }, { status: 400 });

  let phone = "";
  if (phoneRaw) {
    if (!isValidPhone(phoneRaw)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }
    phone = normalizePhone(phoneRaw);
  }

  await prisma.$executeRaw`UPDATE "User" SET name = ${name}, phone = ${phone} WHERE id = ${session.userId}`;
  const rows = await prisma.$queryRaw<Array<{ id: number; name: string; email: string; phone: string | null }>>`
    SELECT id, name, email, phone FROM "User" WHERE id = ${session.userId} LIMIT 1
  `;
  const user = rows[0];
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ success: true, user: publicUser(user) });
}
