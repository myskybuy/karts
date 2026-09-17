import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "dharmakart@123";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = await getSession();
    session.isAdmin = true;
    await session.save();
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
}
