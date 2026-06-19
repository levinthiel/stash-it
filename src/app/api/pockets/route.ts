import { NextResponse } from "next/server";
import { validPocketColorKeys } from "@/lib/colors";
import { pocketIcons } from "@/lib/icons";
import { createPocket, listPockets } from "@/lib/pockets";
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

export async function GET() {
  try {
    const pockets = await listPockets();
    return NextResponse.json(pockets);
  } catch (error) {
    console.error("GET /api/pockets failed:", error);
    return NextResponse.json({ error: "Failed to load pockets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const input = parsePocketInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid pocket data" }, { status: 400 });
    }

    const pocket = await createPocket(input);
    return NextResponse.json(pocket, { status: 201 });
  } catch (error) {
    console.error("POST /api/pockets failed:", error);
    return NextResponse.json({ error: "Failed to create pocket" }, { status: 500 });
  }
}
