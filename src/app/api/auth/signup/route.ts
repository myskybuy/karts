import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { hashPassword, isValidEmail, publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  const cleanName = (name || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account already exists with this email. Please log in." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { name: cleanName, email: cleanEmail, passwordHash: hashPassword(password) },
  });

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  sendWelcomeEmail(user);

  return NextResponse.json({ success: true, user: publicUser(user) });
}
