import type { Spending, SpendingInput } from "@/types/spending";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchSpendings(): Promise<Spending[]> {
  const response = await fetch("/api/spendings");
  return parseResponse<Spending[]>(response);
}

export async function createSpending(input: SpendingInput): Promise<Spending> {
  const response = await fetch("/api/spendings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Spending>(response);
}

export async function updateSpending(id: string, input: SpendingInput): Promise<Spending> {
  const response = await fetch(`/api/spendings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Spending>(response);
}

export async function deleteSpending(id: string): Promise<void> {
  const response = await fetch(`/api/spendings/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}
