import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isEmailConfigured, sendLoginOtpEmail } from "@/lib/email";
import { generateOtp, isValidEmail, publicUser, verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user || !verifyPassword(password || "", user.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // If email sending isn't configured on this deployment, skip OTP and log in directly
  // so the store never locks users out.
  if (!isEmailConfigured()) {
    const session = await getSession();
    session.userId = user.id;
    await session.save();
    return NextResponse.json({ success: true, user: publicUser(user) });
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

  return NextResponse.json({ success: true, otpRequired: true, email: cleanEmail });
}
