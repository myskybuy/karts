import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const body = await req.json();
  const banner = await prisma.banner.upsert({
    where: { id: 1 },
    update: {
      active: !!body.active,
      title: body.title || "",
      subtitle: body.subtitle || "",
      image: body.image || "",
      buttonText: body.buttonText || "Shop Now",
      buttonLink: (body.buttonLink || "/shop").replace("/shop.html", "/shop"),
    },
    create: {
      id: 1,
      active: !!body.active,
      title: body.title || "",
      subtitle: body.subtitle || "",
      image: body.image || "",
      buttonText: body.buttonText || "Shop Now",
      buttonLink: (body.buttonLink || "/shop").replace("/shop.html", "/shop"),
    },
  });

  return NextResponse.json({
    success: true,
    banner: {
      active: banner.active,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
    },
  });
}
