export type ProductKind =
  | "footwear"
  | "clothing"
  | "bags"
  | "jewellery"
  | "eyewear"
  | "belts"
  | "kids"
  | "accessory";

export type PdpProduct = {
  id: number;
  name: string;
  category: string;
  brand: string;
  sizeOptions?: string;
  stock: number;
};

export type PdpSpec = { label: string; value: string };

export type PdpCopy = {
  kind: ProductKind;
  highlights: string[];
  specs: PdpSpec[];
  delivery: string[];
  care: string;
};

function sizesOf(p: PdpProduct) {
  return (p.sizeOptions || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function productKind(p: PdpProduct): ProductKind {
  const cat = (p.category || "").toLowerCase();
  const name = (p.name || "").toLowerCase();

  if (cat.includes("shoe") || cat.includes("footwear")) return "footwear";
  if (cat.includes("men's clothing") || cat.includes("women's clothing") || cat.includes("clothing")) {
    return "clothing";
  }
  if (cat.includes("bag") || cat.includes("wallet") || cat.includes("luggage")) return "bags";
  if (cat.includes("jewel")) return "jewellery";
  if (cat.includes("kid")) return "kids";

  if (cat.includes("accessor") || cat.includes("eyewear")) {
    if (/(sunglass|eyewear|spectacl|shade|\bglasses?\b|\bglass\b)/.test(name)) return "eyewear";
    if (/\bbelts?\b|\bstrap\b/.test(name)) return "belts";
    return "accessory";
  }

  if (/(sunglass|eyewear|spectacl|shade|\bglasses?\b)/.test(name)) return "eyewear";
  return "accessory";
}

function sizeLabel(kind: ProductKind) {
  switch (kind) {
    case "eyewear":
      return "Frame size";
    case "footwear":
      return "UK size";
    case "clothing":
    case "kids":
      return "Apparel size";
    case "belts":
      return "Size / length";
    default:
      return "Size";
  }
}

function sizeValue(kind: ProductKind, sizes: string[]) {
  if (sizes.length) return sizes.join(", ");
  if (kind === "jewellery" || kind === "eyewear" || kind === "accessory") return "One size / as shown";
  return "As shown";
}

function eyewearType(name: string) {
  const n = name.toLowerCase();
  if (n.includes("sunglass")) return "Sunglasses";
  if (n.includes("shade")) return "Sunglasses";
  return "Glasses / eyewear";
}

function highlights(kind: ProductKind, p: PdpProduct): string[] {
  const brand = p.brand ? `From ${p.brand}` : "Curated on Karts";
  const shared = [brand, "Transparent INR pricing on the listing"];

  switch (kind) {
    case "eyewear":
      return [
        ...shared,
        "Clean lenses with a dry microfibre cloth only",
        "Store in a case when not in use",
        "Checked before dispatch",
      ];
    case "footwear":
      return [...shared, "UK sizes as listed on this product", "Checked before dispatch", "Keep the original box for returns"];
    case "clothing":
      return [...shared, "Follow the care label on the garment", "Checked before dispatch", "Return unused with tags intact"];
    case "jewellery":
      return [...shared, "Fashion jewellery — avoid water and perfume on plated pieces", "Store separately to prevent scratches", "Checked before dispatch"];
    case "bags":
      return [...shared, "Do not overload; keep away from rain", "Wipe clean — do not machine wash", "Checked before dispatch"];
    case "belts":
      return [...shared, "Wipe with a dry cloth; do not soak", "Checked before dispatch"];
    case "kids":
      return [...shared, "Choose the listed size for the best fit", "Checked before dispatch"];
    default:
      return [...shared, "Checked before dispatch", "Cash on Delivery available pan-India"];
  }
}

function extraSpecs(kind: ProductKind, p: PdpProduct): PdpSpec[] {
  const rows: PdpSpec[] = [];
  if (kind === "eyewear") {
    rows.push({ label: "Type", value: eyewearType(p.name) });
  }
  if (kind === "footwear") {
    rows.push({ label: "Size system", value: "UK / as listed" });
  }
  return rows;
}

function delivery(kind: ProductKind): string[] {
  const base = [
    "Cash on Delivery is available across serviceable pincodes in India.",
    "Orders are checked and dispatch is confirmed before the shipment leaves.",
  ];
  switch (kind) {
    case "eyewear":
      base.push("Returns within 7 days if unused, with original case or packaging.");
      break;
    case "jewellery":
      base.push("Returns within 7 days if unused, with original pouch or box.");
      break;
    case "footwear":
      base.push("Returns within 7 days if unused and unworn, with the original box.");
      break;
    case "clothing":
    case "kids":
      base.push("Returns within 7 days if unused, unwashed, with tags intact.");
      break;
    case "bags":
    case "belts":
    case "accessory":
      base.push("Returns within 7 days if unused, with original packaging.");
      break;
  }
  return base;
}

function care(kind: ProductKind): string {
  switch (kind) {
    case "eyewear":
      return "Wipe lenses with a dry microfibre cloth. Do not use water, soap, alcohol, household cleaners, or a washing machine. Store in a hard case to avoid scratches.";
    case "belts":
      return "Wipe with a dry cloth. Do not soak, machine wash, or use harsh chemicals. Keep away from prolonged moisture.";
    case "footwear":
      return "Wipe with a dry cloth after wear. Keep away from prolonged moisture. Store in a cool, dry place with the original box or dust bag when possible.";
    case "clothing":
      return "Follow the care label where present. Wash similar colours together, avoid harsh bleach, and dry in shade. Iron on reverse if needed.";
    case "jewellery":
      return "Store separately to avoid scratches. Avoid perfume, water and chemicals on plated or fashion jewellery. Wipe gently with a soft dry cloth. Do not wash.";
    case "bags":
      return "Avoid overloading. Keep away from rain and direct sunlight. Wipe with a slightly damp cloth and air dry. Do not machine wash.";
    case "kids":
      return "Follow any care label on the item. For clothing, wash gently and dry in shade. For other kids items, wipe clean and keep dry — do not machine wash unless the label says so.";
    default:
      return "Wipe with a dry or slightly damp cloth. Do not machine wash or soak unless the product care label says otherwise. Store in a cool, dry place.";
  }
}

export function getPdpCopy(p: PdpProduct): PdpCopy {
  const kind = productKind(p);
  const sizeList = sizesOf(p);
  const specs: PdpSpec[] = [
    { label: "SKU", value: `KT-${p.id}` },
    { label: "Brand", value: p.brand || "Karts" },
    { label: "Category", value: p.category },
    ...extraSpecs(kind, p),
    { label: sizeLabel(kind), value: sizeValue(kind, sizeList) },
    { label: "Stock", value: p.stock > 0 ? "In stock" : "Please check availability at checkout" },
  ];

  return {
    kind,
    highlights: highlights(kind, p),
    specs,
    delivery: delivery(kind),
    care: care(kind),
  };
}
