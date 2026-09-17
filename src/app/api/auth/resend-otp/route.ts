import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendLoginOtpEmail } from "@/lib/email";
import { generateOtp, isValidEmail } from "@/lib/password";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json({ error: "Email sending is not configured on this store" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !user.otpExpiresAt) {
    return NextResponse.json({ error: "No pending login found for this email. Please log in again." }, { status: 400 });
  }

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });

  try {
    await sendLoginOtpEmail(user, otp);
  } catch {
    return NextResponse.json({ error: "Could not send OTP email. Please try again." }, { status: 503 });
  }

  return NextResponse.json({ success: true });
}
