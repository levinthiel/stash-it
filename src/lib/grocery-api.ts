import type { Grocery, GroceryInput, GroceryUpdate } from "@/types/grocery";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchGroceries(): Promise<Grocery[]> {
  const response = await fetch("/api/groceries");
  return parseResponse<Grocery[]>(response);
}

export async function createGrocery(input: GroceryInput): Promise<Grocery> {
  const response = await fetch("/api/groceries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Grocery>(response);
}

export async function updateGrocery(id: string, update: GroceryUpdate): Promise<Grocery> {
  const response = await fetch(`/api/groceries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return parseResponse<Grocery>(response);
}
