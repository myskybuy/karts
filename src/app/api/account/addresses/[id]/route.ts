import { NextRequest, NextResponse } from "next/server";
import {
  clearDefault,
  deleteAddress,
  getAddress,
  latestAddress,
  setDefaultAddress,
  updateAddress,
} from "@/lib/address-store";
import { isValidPhone, normalizePhone } from "@/lib/password";
import { getSession } from "@/lib/session";

function parseAddress(body: Record<string, unknown>) {
  const label = String(body.label || "Home").trim() || "Home";
  const fullName = String(body.fullName || "").trim();
  const phoneRaw = String(body.phone || "").trim();
  const line1 = String(body.line1 || "").trim();
  const city = String(body.city || "").trim();
  const state = String(body.state || "").trim();
  const pincode = String(body.pincode || "").replace(/\D/g, "");
  const isDefault = Boolean(body.isDefault);

  if (!fullName) return { error: "Please enter the recipient name" };
  if (!isValidPhone(phoneRaw)) return { error: "Please enter a valid 10-digit mobile number" };
  if (!line1) return { error: "Please enter address line" };
  if (!city) return { error: "Please enter city" };
  if (!state) return { error: "Please enter state" };
  if (!/^\d{6}$/.test(pincode)) return { error: "Please enter a valid 6-digit pincode" };

  return {
    data: {
      label,
      fullName,
      phone: normalizePhone(phoneRaw),
      line1,
      city,
      state,
      pincode,
      isDefault,
    },
  };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const id = Number((await params).id);
  const existing = await getAddress(session.userId, id);
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const parsed = parseAddress(await req.json());
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (parsed.data.isDefault) await clearDefault(session.userId);
  const address = await updateAddress(id, parsed.data);
  return NextResponse.json(address);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const id = Number((await params).id);
  const existing = await getAddress(session.userId, id);
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  await deleteAddress(id);

  if (existing.isDefault) {
    const next = await latestAddress(session.userId);
    if (next) await setDefaultAddress(session.userId, next.id);
  }

  return NextResponse.json({ success: true });
}
