import { NextResponse } from "next/server";
import { createGrocery, listGroceries } from "@/lib/groceries";
import type { GroceryInput } from "@/types/grocery";

function parseGroceryInput(body: unknown): GroceryInput | null {
  if (!body || typeof body !== "object") return null;

  const { name, quantity } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) return null;

  const parsedQuantity =
    quantity === undefined ? 1 : typeof quantity === "number" && !Number.isNaN(quantity) ? quantity : null;
  if (parsedQuantity === null || parsedQuantity < 1) return null;

  return {
    name: name.trim(),
    quantity: parsedQuantity,
  };
}

export async function GET() {
  try {
    const groceries = await listGroceries();
    return NextResponse.json(groceries);
  } catch (error) {
    console.error("GET /api/groceries failed:", error);
    return NextResponse.json({ error: "Failed to load groceries" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = parseGroceryInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid grocery data" }, { status: 400 });
    }

    const grocery = await createGrocery(input);
    return NextResponse.json(grocery, { status: 201 });
  } catch (error) {
    console.error("POST /api/groceries failed:", error);
    return NextResponse.json({ error: "Failed to create grocery item" }, { status: 500 });
  }
}
