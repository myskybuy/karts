export type SizeChartKind = "shirt" | "bottoms" | "outer" | "footwear" | "kids" | "none";

export type SizeChartRow = { size: string; cols: string[] };

export type SizeChart = {
  kind: SizeChartKind;
  title: string;
  headers: string[];
  rows: SizeChartRow[];
  measure: string;
};

type ChartProduct = {
  name: string;
  category: string;
  sizeOptions?: string;
};

function gender(category: string): "men" | "women" | "unisex" {
  const c = (category || "").toLowerCase();
  if (c.includes("women")) return "women";
  if (c.includes("men")) return "men";
  return "unisex";
}

export function sizeChartKind(p: ChartProduct): SizeChartKind {
  const cat = (p.category || "").toLowerCase();
  const name = (p.name || "").toLowerCase();

  if (cat.includes("bag") || cat.includes("wallet") || cat.includes("luggage")) return "none";
  if (cat.includes("jewel")) return "none";
  if (/(sunglass|eyewear|spectacl|shade|\bglasses?\b|\bbelts?\b)/.test(name)) return "none";
  if (cat.includes("accessor") && !/(shirt|pant|jean|trouser|shoe)/.test(name)) return "none";

  if (cat.includes("shoe") || cat.includes("footwear") || /(shoe|loafer|sneaker|sandal|slipper|footwear)/.test(name)) {
    return "footwear";
  }
  if (cat.includes("kid")) return "kids";

  if (/(jean|trouser|pants?\b|jogger|track\s?pant|shorts?|palazzo|legging|pajama|pyjama|lounge)/.test(name)) {
    return "bottoms";
  }
  if (/(blazer|waistcoat|jacket|shrug|lehenga|salwar|sharara|\bsuits?\b)/.test(name)) {
    return "outer";
  }
  if (/(shirt|t-?shirt|polo|kurta|blouse|tunic|sweater|hoodie|sweatshirt|thermal|top\b|kurti)/.test(name)) {
    return "shirt";
  }
  if (cat.includes("clothing")) return "shirt";

  const opts = (p.sizeOptions || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (opts.some((o) => /^(xxs|xs|s|m|l|xl|xxl|2xl|3xl)$/.test(o))) return "shirt";
  if (opts.length && opts.every((o) => /^\d+(\.\d+)?$/.test(o))) return "footwear";
  return "none";
}

const MEN_SHIRT: SizeChartRow[] = [
  { size: "S", cols: ["38", "28"] },
  { size: "M", cols: ["40", "29"] },
  { size: "L", cols: ["42", "30"] },
  { size: "XL", cols: ["44", "31"] },
];

const WOMEN_TOP: SizeChartRow[] = [
  { size: "S", cols: ["34", "26"] },
  { size: "M", cols: ["36", "27"] },
  { size: "L", cols: ["38", "28"] },
  { size: "XL", cols: ["40", "29"] },
];

const MEN_BOTTOMS: SizeChartRow[] = [
  { size: "S", cols: ["30", "40"] },
  { size: "M", cols: ["32", "40"] },
  { size: "L", cols: ["34", "40"] },
  { size: "XL", cols: ["36", "40"] },
];

const WOMEN_BOTTOMS: SizeChartRow[] = [
  { size: "S", cols: ["26", "38"] },
  { size: "M", cols: ["28", "38"] },
  { size: "L", cols: ["30", "39"] },
  { size: "XL", cols: ["32", "39"] },
];

const FOOTWEAR: SizeChartRow[] = [
  { size: "4", cols: ["37", "23.5"] },
  { size: "5", cols: ["38", "24.5"] },
  { size: "6", cols: ["39", "25"] },
  { size: "7", cols: ["40", "25.5"] },
  { size: "8", cols: ["41", "26.5"] },
];

const KIDS: SizeChartRow[] = [
  { size: "2–3Y", cols: ["92–98"] },
  { size: "4–5Y", cols: ["104–110"] },
  { size: "6–7Y", cols: ["116–122"] },
  { size: "8–9Y", cols: ["128–134"] },
  { size: "10–12Y", cols: ["140–152"] },
];

export function getSizeChart(p: ChartProduct): SizeChart | null {
  const kind = sizeChartKind(p);
  if (kind === "none") return null;
  const g = gender(p.category);

  if (kind === "footwear") {
    return {
      kind,
      title: "Footwear size chart (UK)",
      headers: ["UK", "EU", "Foot length (cm)"],
      rows: FOOTWEAR,
      measure: "Stand on paper, mark heel and longest toe. Measure in cm. Pick the closest UK size.",
    };
  }
  if (kind === "kids") {
    return {
      kind,
      title: "Kids size chart",
      headers: ["Size", "Height (cm)"],
      rows: KIDS,
      measure: "Measure height without shoes. If between sizes, choose the larger one.",
    };
  }
  if (kind === "bottoms") {
    const women = g === "women";
    return {
      kind,
      title: women ? "Women's bottoms size chart" : "Men's bottoms size chart",
      headers: ["Size", "Waist (in)", "Inseam (in)"],
      rows: women ? WOMEN_BOTTOMS : MEN_BOTTOMS,
      measure: "Measure waist at the navel, snug but not tight. Inseam is crotch to ankle.",
    };
  }
  if (kind === "outer") {
    const women = g === "women";
    return {
      kind,
      title: women ? "Women's ethnic / outerwear chart" : "Men's suit / outerwear chart",
      headers: women ? ["Size", "Bust (in)", "Waist (in)"] : ["Size", "Chest (in)", "Length (in)"],
      rows: women ? WOMEN_TOP : MEN_SHIRT,
      measure: women
        ? "Bust at the fullest point; waist at the navel."
        : "Chest under arms, tape level. Length is shoulder to hem.",
    };
  }
  const women = g === "women";
  return {
    kind: "shirt",
    title: women ? "Women's top size chart" : "Men's shirt size chart",
    headers: women ? ["Size", "Bust (in)", "Length (in)"] : ["Size", "Chest (in)", "Length (in)"],
    rows: women ? WOMEN_TOP : MEN_SHIRT,
    measure: women
      ? "Bust at the fullest point, tape parallel to the floor."
      : "Chest just under the arms. If between sizes, size up.",
  };
}

export function rowMatchesOption(row: SizeChartRow, sizeOptions: string) {
  const opts = (sizeOptions || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!opts.length) return false;
  const key = row.size.toLowerCase().replace(/–/g, "-");
  return opts.some((o) => key === o.toLowerCase() || key.startsWith(o) || o.startsWith(key.replace(/y$/, "")));
}
