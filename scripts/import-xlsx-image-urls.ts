import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const ROOT = path.join(__dirname, "..");
const CANDIDATES = [
  path.join(ROOT, "prisma", "data", "dharmakart_products.xlsx"),
  path.join("C:", "Users", "dell", "Desktop", "dharmakart_products.xlsx"),
];
const PRODUCTS_JSON = path.join(ROOT, "prisma", "data", "products.json");
const CATEGORIES_JSON = path.join(ROOT, "prisma", "data", "categories.json");

type ProductRow = {
  id: number;
  name: string;
  category: string;
  image: string;
  image2?: string;
  image3?: string;
};

type CategoryRow = { id: number; name: string; image: string };

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/\|/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findExcelRow(excel: { name: string; urls: string[] }[], productName: string) {
  const n = norm(productName);
  let hit = excel.find((r) => r.name === n);
  if (hit) return hit;
  hit = excel.find((r) => r.name.startsWith(n) || n.startsWith(r.name));
  if (hit && Math.min(hit.name.length, n.length) >= 24) return hit;
  return null;
}

async function main() {
  const xlsxPath = CANDIDATES.find((p) => fs.existsSync(p));
  if (!xlsxPath) throw new Error("dharmakart_products.xlsx not found on Desktop or prisma/data");

  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets["Products"] || wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const excel = rows
    .map((r) => ({
      name: norm(String(r["Product Name"] || "")),
      urls: [r["Thumbnail Image URL"], r["Image 2 URL"], r["Image 3 URL"]]
        .map((u) => String(u || "").trim())
        .filter((u) => /^https?:\/\//i.test(u)),
    }))
    .filter((r) => r.name && r.urls.length);

  const products = JSON.parse(fs.readFileSync(PRODUCTS_JSON, "utf8")) as ProductRow[];
  let matched = 0;
  let unmatched = 0;

  for (const p of products) {
    const hit = findExcelRow(excel, p.name);
    if (!hit) {
      unmatched += 1;
      console.log("NO MATCH", p.id, p.name.slice(0, 70));
      continue;
    }
    matched += 1;
    p.image = hit.urls[0] || p.image;
    p.image2 = hit.urls[1] || "";
    p.image3 = hit.urls[2] || "";
  }

  fs.writeFileSync(PRODUCTS_JSON, JSON.stringify(products, null, 2) + "\n");

  const categories = JSON.parse(fs.readFileSync(CATEGORIES_JSON, "utf8")) as CategoryRow[];
  for (const c of categories) {
    const first = products.find((p) => p.category === c.name && p.image.startsWith("http"));
    if (first) c.image = first.image;
  }
  fs.writeFileSync(CATEGORIES_JSON, JSON.stringify(categories, null, 2) + "\n");

  const prisma = new PrismaClient();
  try {
    for (const p of products) {
      if (!p.image.startsWith("http")) continue;
      await prisma.product.updateMany({
        where: { name: p.name },
        data: { image: p.image, image2: p.image2 || "", image3: p.image3 || "" },
      });
    }
    for (const c of categories) {
      await prisma.category.updateMany({
        where: { name: c.name },
        data: { image: c.image },
      });
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log({ matched, unmatched, excelRows: excel.length, products: products.length, xlsxPath });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
