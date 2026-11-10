import { NextResponse } from "next/server";
import { RAZORPAY_VISIBLE } from "@/lib/payment-options";
import { isPhonePeConfigured } from "@/lib/phonepe";
import { isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

// Tells checkout which online gateways are switched on (server env decides, no rebuild needed).
export async function GET() {
  return NextResponse.json({
    phonepe: isPhonePeConfigured(),
    razorpay: RAZORPAY_VISIBLE && isRazorpayConfigured(),
  });
}
