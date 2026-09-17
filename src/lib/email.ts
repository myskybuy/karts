import nodemailer from "nodemailer";

const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED || "false").toLowerCase() === "true";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || "";

const transporter =
  EMAIL_ENABLED && EMAIL_USER && EMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
      })
    : null;

type OrderItem = { name: string; qty: number; salePrice: number };

type OrderEmail = {
  id: number;
  email: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
};

export async function sendOrderConfirmationEmail(order: OrderEmail) {
  if (!transporter || !order.email) return;

  const itemsHTML = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name} × ${item.qty}</td><td style="padding:8px 0; text-align:right;">₹${item.salePrice * item.qty}</td></tr>`
    )
    .join("");

  const itemsText = order.items.map((item) => `${item.name} x${item.qty} - Rs.${item.salePrice * item.qty}`).join("\n");

  await transporter.sendMail({
    from: `"Karts" <${EMAIL_USER}>`,
    replyTo: EMAIL_USER,
    to: order.email,
    subject: `Order #${order.id} confirmed - Karts`,
    text: `Hi ${order.customerName}, thanks for shopping at Karts.\n\nOrder #${order.id} (${order.paymentMethod})\n${itemsText}\n\nTotal: Rs.${order.total}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0d5c53;">Your order is confirmed</h2>
        <p>Hi ${order.customerName}, thanks for shopping at Karts.</p>
        <p><strong>Order #${order.id}</strong> · ${order.paymentMethod}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHTML}</table>
        <p style="font-size:18px;font-weight:700;">Total: ₹${order.total}</p>
      </div>
    `,
  });
}

export function isEmailConfigured() {
  return Boolean(transporter);
}

export async function sendLoginOtpEmail(user: { name: string; email: string }, otp: string) {
  if (!transporter) return;

  const info = await transporter.sendMail({
    from: `"Karts" <${EMAIL_USER}>`,
    replyTo: EMAIL_USER,
    to: user.email,
    subject: "Your Karts login OTP",
    text: `Hi ${user.name}, your Karts login OTP is ${otp}. It is valid for 10 minutes. If you didn't try to log in, you can ignore this email.`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0d5c53;">Verify it's you</h2>
        <p>Hi ${user.name}, use the OTP below to complete your login to Karts.</p>
        <p style="font-size:32px;font-weight:800;letter-spacing:6px;margin:20px 0;">${otp}</p>
        <p>This OTP is valid for 10 minutes. If you didn't try to log in, you can safely ignore this email.</p>
      </div>
    `,
  });
  console.log("[email] OTP sent:", {
    to: user.email,
    messageId: info.messageId,
    response: info.response,
    accepted: info.accepted,
    rejected: info.rejected,
  });
}

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  if (!transporter) return;

  await transporter.sendMail({
    from: `"Karts" <${EMAIL_USER}>`,
    replyTo: EMAIL_USER,
    to: user.email,
    subject: "Welcome to Karts",
    text: `Hi ${user.name}, your Karts account is ready. Happy shopping!`,
    html: `<p>Hi ${user.name}, your Karts account is ready. Happy shopping!</p>`,
  });
}
