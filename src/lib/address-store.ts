import { prisma } from "./db";

export type AddressRecord = {
  id: number;
  userId: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

type AddressInput = Omit<AddressRecord, "id" | "userId">;

function row(r: AddressRecord): AddressRecord {
  return { ...r, isDefault: Boolean(r.isDefault) };
}

export async function listAddresses(userId: number) {
  const rows = await prisma.$queryRaw<AddressRecord[]>`
    SELECT id, "userId", label, "fullName", phone, line1, city, state, pincode, "isDefault"
    FROM "Address"
    WHERE "userId" = ${userId}
    ORDER BY "isDefault" DESC, id DESC
  `;
  return rows.map(row);
}

export async function countAddresses(userId: number) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM "Address" WHERE "userId" = ${userId}
  `;
  return Number(rows[0]?.count || 0);
}

export async function getAddress(userId: number, id: number) {
  const rows = await prisma.$queryRaw<AddressRecord[]>`
    SELECT id, "userId", label, "fullName", phone, line1, city, state, pincode, "isDefault"
    FROM "Address" WHERE id = ${id} AND "userId" = ${userId} LIMIT 1
  `;
  return rows[0] ? row(rows[0]) : null;
}

export async function clearDefault(userId: number) {
  await prisma.$executeRaw`UPDATE "Address" SET "isDefault" = false WHERE "userId" = ${userId}`;
}

export async function createAddress(userId: number, data: AddressInput) {
  const rows = await prisma.$queryRaw<AddressRecord[]>`
    INSERT INTO "Address" ("userId", label, "fullName", phone, line1, city, state, pincode, "isDefault")
    VALUES (${userId}, ${data.label}, ${data.fullName}, ${data.phone}, ${data.line1}, ${data.city}, ${data.state}, ${data.pincode}, ${data.isDefault})
    RETURNING id, "userId", label, "fullName", phone, line1, city, state, pincode, "isDefault"
  `;
  return row(rows[0]);
}

export async function updateAddress(id: number, data: AddressInput) {
  const rows = await prisma.$queryRaw<AddressRecord[]>`
    UPDATE "Address"
    SET label = ${data.label}, "fullName" = ${data.fullName}, phone = ${data.phone},
        line1 = ${data.line1}, city = ${data.city}, state = ${data.state},
        pincode = ${data.pincode}, "isDefault" = ${data.isDefault}
    WHERE id = ${id}
    RETURNING id, "userId", label, "fullName", phone, line1, city, state, pincode, "isDefault"
  `;
  return row(rows[0]);
}

export async function deleteAddress(id: number) {
  await prisma.$executeRaw`DELETE FROM "Address" WHERE id = ${id}`;
}

export async function setDefaultAddress(userId: number, id: number) {
  await prisma.$executeRaw`UPDATE "Address" SET "isDefault" = true WHERE id = ${id} AND "userId" = ${userId}`;
}

export async function latestAddress(userId: number) {
  const rows = await prisma.$queryRaw<AddressRecord[]>`
    SELECT id, "userId", label, "fullName", phone, line1, city, state, pincode, "isDefault"
    FROM "Address" WHERE "userId" = ${userId} ORDER BY id DESC LIMIT 1
  `;
  return rows[0] ? row(rows[0]) : null;
}
