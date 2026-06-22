import { NextResponse } from "next/server";
import { createSpending, listSpendings } from "@/lib/spendings";
import type { SpendingInput } from "@/types/spending";

function parseSpendingInput(body: unknown): SpendingInput | null {
  if (!body || typeof body !== "object") return null;

  const { name, amount } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;

  return {
    name: name.trim(),
    amount,
  };
}

export async function GET() {
  try {
    const spendings = await listSpendings();
    return NextResponse.json(spendings);
  } catch (error) {
    console.error("GET /api/spendings failed:", error);
    return NextResponse.json({ error: "Failed to load spendings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = parseSpendingInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid spending data" }, { status: 400 });
    }

    const spending = await createSpending(input);
    return NextResponse.json(spending, { status: 201 });
  } catch (error) {
    console.error("POST /api/spendings failed:", error);
    return NextResponse.json({ error: "Failed to create spending" }, { status: 500 });
  }
}
