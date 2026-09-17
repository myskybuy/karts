import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const coupons = await prisma.coupon.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(
    coupons.map((c) => ({
      ...c,
      expiry: c.expiry ? c.expiry.toISOString().slice(0, 10) : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: (body.code || "").toUpperCase(),
      type: body.type === "flat" ? "flat" : "percent",
      value: Number(body.value),
      minOrder: Number(body.minOrder) || 0,
      active: body.active !== false,
      expiry: body.expiry ? new Date(body.expiry) : null,
    },
  });
  return NextResponse.json({
    success: true,
    coupon: { ...coupon, expiry: coupon.expiry ? coupon.expiry.toISOString().slice(0, 10) : null },
  });
}
