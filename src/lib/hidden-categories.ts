// Categories temporarily hidden from the storefront. Products stay in the DB and
// remain visible to admins; remove a name here to show it again.
export const HIDDEN_CATEGORIES = ["Jewellery"];

export function isHiddenCategory(name: string | null | undefined) {
  const n = (name || "").trim().toLowerCase();
  return HIDDEN_CATEGORIES.some((c) => c.toLowerCase() === n);
}
