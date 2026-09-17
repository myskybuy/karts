import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(__dirname, "data");

function readJson<T>(file: string): T {
  const local = path.join(__dirname, "data", file);
  const legacy = path.join(dataDir, file);
  const filePath = fs.existsSync(local) ? local : legacy;
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

async function main() {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();

  const categories = readJson<Array<{ id: number; name: string; image: string }>>("categories.json");
  for (const c of categories) {
    await prisma.category.create({ data: { name: c.name, image: c.image } });
  }

  const products = readJson<
    Array<{
      id: number;
      name: string;
      category: string;
      brand?: string;
      price: number;
      salePrice: number;
      image: string;
      image2?: string;
      image3?: string;
      sizeOptions?: string;
      stock: number;
      description: string;
    }>
  >("products.json");
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        category: p.category,
        brand: p.brand || "",
        price: p.price,
        salePrice: p.salePrice,
        image: p.image,
        image2: p.image2 || "",
        image3: p.image3 || "",
        sizeOptions: p.sizeOptions || "",
        stock: p.stock,
        description: p.description,
      },
    });
  }

  const coupons = readJson<
    Array<{ code: string; type: string; value: number; minOrder: number; active: boolean; expiry: string | null }>
  >("coupons.json");
  for (const c of coupons) {
    await prisma.coupon.create({
      data: {
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        active: c.active,
        expiry: c.expiry ? new Date(c.expiry) : null,
      },
    });
  }

  const banner = readJson<{
    active: boolean;
    title: string;
    subtitle: string;
    image: string;
    buttonText: string;
    buttonLink: string;
  }>("banner.json");

  await prisma.banner.create({
    data: {
      id: 1,
      active: banner.active,
      title: banner.title,
      subtitle: banner.subtitle,
      image: banner.image,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink.replace("/shop.html", "/shop"),
    },
  });

  console.log(`Seeded ${categories.length} categories, ${products.length} products, ${coupons.length} coupons`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
