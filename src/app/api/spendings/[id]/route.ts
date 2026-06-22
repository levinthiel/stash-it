import { NextResponse } from "next/server";
import { deleteSpending, updateSpending } from "@/lib/spendings";
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const input = parseSpendingInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid spending data" }, { status: 400 });
    }

    const spending = await updateSpending(id, input);
    if (!spending) {
      return NextResponse.json({ error: "Spending not found" }, { status: 404 });
    }

    return NextResponse.json(spending);
  } catch (error) {
    console.error("PUT /api/spendings/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update spending" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteSpending(id);
    if (!deleted) {
      return NextResponse.json({ error: "Spending not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/spendings/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete spending" }, { status: 500 });
  }
}
