import { NextResponse } from "next/server";
import { validPocketColorKeys } from "@/lib/colors";
import { pocketIcons } from "@/lib/icons";
import { deletePocket, updatePocket } from "@/lib/pockets";
import type { PocketInput } from "@/types/pocket";

const validColors = validPocketColorKeys;
const validIcons = new Set(pocketIcons.map((i) => i.key));

function parsePocketInput(body: unknown): PocketInput | null {
  if (!body || typeof body !== "object") return null;

  const { name, amount, color, icon } = body as Record<string, unknown>;

  if (typeof name !== "string" || !name.trim()) return null;
  if (typeof amount !== "number" || Number.isNaN(amount)) return null;
  if (typeof color !== "string" || !validColors.has(color as PocketInput["color"])) return null;
  if (typeof icon !== "string" || !validIcons.has(icon as PocketInput["icon"])) return null;

  return {
    name: name.trim(),
    amount,
    color: color as PocketInput["color"],
    icon: icon as PocketInput["icon"],
  };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const input = parsePocketInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid pocket data" }, { status: 400 });
    }

    const pocket = await updatePocket(id, input);
    if (!pocket) {
      return NextResponse.json({ error: "Pocket not found" }, { status: 404 });
    }

    return NextResponse.json(pocket);
  } catch (error) {
    console.error("PUT /api/pockets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update pocket" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deletePocket(id);
    if (!deleted) {
      return NextResponse.json({ error: "Pocket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/pockets/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete pocket" }, { status: 500 });
  }
}
