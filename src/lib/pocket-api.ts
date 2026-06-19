import type { Pocket, PocketInput } from "@/types/pocket";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchPockets(): Promise<Pocket[]> {
  const response = await fetch("/api/pockets");
  return parseResponse<Pocket[]>(response);
}

export async function createPocket(input: PocketInput): Promise<Pocket> {
  const response = await fetch("/api/pockets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Pocket>(response);
}

export async function updatePocket(id: string, input: PocketInput): Promise<Pocket> {
  const response = await fetch(`/api/pockets/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Pocket>(response);
}

export async function deletePocket(id: string): Promise<void> {
  const response = await fetch(`/api/pockets/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}
