export const INDIA_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export function matchState(value: string) {
  const v = (value || "").trim().toLowerCase();
  return INDIA_STATES.find((s) => s.toLowerCase() === v) || "";
}

export type DeliveryAddress = {
  house: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

export function validateDeliveryAddress(a: Partial<DeliveryAddress>): string | null {
  if (!a.house?.trim()) return "Please enter House / Flat / Building";
  if (!a.area?.trim()) return "Please enter Area / Street / Locality";
  if (!a.city?.trim()) return "Please enter City";
  if (!matchState(a.state || "")) return "Please select State";
  if (!/^[1-9]\d{5}$/.test((a.pincode || "").trim())) return "Please enter a valid 6-digit Pincode";
  return null;
}

export function formatDeliveryAddress(a: DeliveryAddress) {
  const parts = [a.house.trim(), a.area.trim()];
  if (a.landmark.trim()) parts.push(`Landmark: ${a.landmark.trim()}`);
  parts.push(a.city.trim());
  return `${parts.join(", ")}, ${matchState(a.state)} - ${a.pincode.trim()}`;
}
