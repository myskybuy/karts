/**
 * One-off: push the corrected product categories from prisma/data/products.json
 * into the live database WITHOUT wiping orders/users (unlike `npm run db:seed`).
 * Matches on product name. Safe to re-run.
 *
 *   npx tsx prisma/fix-categories.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type Seed = { name: string; category: string };

async function main() {
  const seed: Seed[] = JSON.parse(
    fs.readFileSync(path.join(__dirname, "data", "products.json"), "utf8")
  );

  const dbProducts = await prisma.product.findMany();
  const byName = new Map<string, typeof dbProducts>();
  for (const p of dbProducts) {
    const arr = byName.get(p.name) ?? [];
    arr.push(p);
    byName.set(p.name, arr);
  }

  let updated = 0;
  let unmatched = 0;
  for (const s of seed) {
    const matches = byName.get(s.name);
    if (!matches || matches.length === 0) {
      unmatched++;
      console.warn(`  no DB row for: ${s.name.slice(0, 60)}`);
      continue;
    }
    for (const m of matches) {
      if (m.category !== s.category) {
        await prisma.product.update({
          where: { id: m.id },
          data: { category: s.category },
        });
        console.log(`  #${m.id}  ${m.category}  ->  ${s.category}   (${s.name.slice(0, 50)})`);
        updated++;
      }
    }
  }

  const [orders, users] = await Promise.all([prisma.order.count(), prisma.user.count()]);
  console.log(
    `\nDone. ${updated} categories updated, ${unmatched} seed rows had no DB match. ` +
      `Preserved ${orders} orders / ${users} users.`
  );

  const counts = await prisma.product.groupBy({ by: ["category"], _count: true });
  console.log("\nDB product counts by category:");
  for (const c of counts.sort((a, b) => b._count - a._count)) {
    console.log(`  ${c.category}: ${c._count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
