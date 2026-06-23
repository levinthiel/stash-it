import { NextResponse } from "next/server";
import { deleteGrocery, updateGrocery } from "@/lib/groceries";
import type { GroceryUpdate } from "@/types/grocery";

function parseGroceryUpdate(body: unknown): GroceryUpdate | null {
  if (!body || typeof body !== "object") return null;

  const { name, quantity, checked } = body as Record<string, unknown>;
  const update: GroceryUpdate = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) return null;
    update.name = name.trim();
  }

  if (quantity !== undefined) {
    if (typeof quantity !== "number" || Number.isNaN(quantity) || quantity < 1) return null;
    update.quantity = quantity;
  }

  if (checked !== undefined) {
    if (typeof checked !== "boolean") return null;
    update.checked = checked;
  }

  if (Object.keys(update).length === 0) return null;
  return update;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const update = parseGroceryUpdate(await request.json());
    if (!update) {
      return NextResponse.json({ error: "Invalid grocery data" }, { status: 400 });
    }

    const grocery = await updateGrocery(id, update);
    if (!grocery) {
      return NextResponse.json({ error: "Grocery item not found" }, { status: 404 });
    }

    return NextResponse.json(grocery);
  } catch (error) {
    console.error("PUT /api/groceries/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update grocery item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteGrocery(id);
    if (!deleted) {
      return NextResponse.json({ error: "Grocery item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/groceries/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete grocery item" }, { status: 500 });
  }
}
