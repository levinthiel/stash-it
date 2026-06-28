export const GROCERY_STORES = ["Lidl", "Coop", "Leclerc"] as const;

export type GroceryStore = (typeof GROCERY_STORES)[number];

export function isGroceryStore(value: string): value is GroceryStore {
  return (GROCERY_STORES as readonly string[]).includes(value);
}

export function normalizeGroceryStore(value: unknown): GroceryStore | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string" && isGroceryStore(value)) return value;
  return null;
}
