import { NextResponse } from "next/server";
import {
  distinctFolders,
  findExistingFolderCasing,
  foldersEqual,
  validateFolderName,
} from "@/lib/folders";
import { listFolderNames, renameFolder } from "@/lib/notes";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid folder data" }, { status: 400 });
    }

    const { from, to } = body as Record<string, unknown>;
    const fromName = validateFolderName(from);
    const toName = validateFolderName(to);

    if (!fromName || !toName) {
      return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    }

    if (foldersEqual(fromName, toName)) {
      return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    }

    const existingFolders = distinctFolders(await listFolderNames());
    const fromExisting = findExistingFolderCasing(existingFolders, fromName);
    if (!fromExisting) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const toExisting = findExistingFolderCasing(existingFolders, toName);
    const merged = toExisting !== undefined && !foldersEqual(fromExisting, toExisting);
    const targetName = toExisting ?? toName;

    const renamed = await renameFolder(fromExisting, targetName);
    return NextResponse.json({ renamed, merged });
  } catch (error) {
    console.error("PUT /api/folders failed:", error);
    return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 });
  }
}
