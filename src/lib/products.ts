import { Prisma } from "@prisma/client";
import { prisma } from "./db";

export type ProductSort = "relevance" | "price_asc" | "price_desc";

export type ProductFilters = {
  category?: string;
  sale?: boolean;
  q?: string;
  excludeId?: number;
  limit?: number;
  sort?: ProductSort;
};

export async function listProducts(filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (filters.category) where.category = filters.category;
  if (filters.excludeId) where.id = { not: filters.excludeId };

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  let products = await prisma.product.findMany({
    where,
    orderBy:
      filters.sort === "price_asc"
        ? [{ salePrice: "asc" }, { id: "asc" }]
        : filters.sort === "price_desc"
          ? [{ salePrice: "desc" }, { id: "asc" }]
          : { id: "asc" },
    take: filters.sale ? undefined : filters.limit,
  });

  if (filters.sale) {
    products = products.filter((p) => p.salePrice < p.price);
    if (filters.limit) products = products.slice(0, filters.limit);
  }

  return products;
}

export async function getProduct(id: number) {
  return prisma.product.findUnique({ where: { id } });
}

export async function getBanner() {
  let banner = await prisma.banner.findUnique({ where: { id: 1 } });
  if (!banner) {
    banner = await prisma.banner.create({
      data: {
        id: 1,
        active: false,
        title: "",
        subtitle: "",
        image: "",
        buttonText: "Shop Now",
        buttonLink: "/shop",
      },
    });
  }
  return {
    active: banner.active,
    title: banner.title,
    subtitle: banner.subtitle,
    image: banner.image,
    buttonText: banner.buttonText,
    buttonLink: banner.buttonLink,
  };
}
