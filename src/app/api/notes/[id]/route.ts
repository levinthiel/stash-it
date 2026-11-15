import { NextResponse } from "next/server";
import { validPocketColorKeys, type PocketColorKey } from "@/lib/colors";
import { distinctFolders, findExistingFolderCasing, validateFolderPath } from "@/lib/folders";
import { deleteNote, listFolderNames, updateNote } from "@/lib/notes";
import type { NoteUpdate } from "@/types/note";

function parseNoteUpdate(
  body: unknown,
  existingFolders: string[]
): { update: NoteUpdate } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid note data" };
  }

  const {
    title,
    body: noteBody,
    color,
    folder,
    pinned,
  } = body as Record<string, unknown>;
  const update: NoteUpdate = {};

  if (title !== undefined) {
    if (typeof title !== "string") {
      return { error: "Invalid note data" };
    }
    update.title = title;
  }

  if (noteBody !== undefined) {
    if (typeof noteBody !== "string") {
      return { error: "Invalid note data" };
    }
    update.body = noteBody;
  }

  if (color !== undefined) {
    if (typeof color !== "string" || !validPocketColorKeys.has(color as PocketColorKey)) {
      return { error: "Invalid note data" };
    }
    update.color = color as PocketColorKey;
  }

  if (folder !== undefined) {
    if (folder === null) {
      update.folder = null;
    } else {
      const validated = validateFolderPath(folder);
      if (!validated) {
        return { error: "Invalid folder name" };
      }
      update.folder = findExistingFolderCasing(existingFolders, validated) ?? validated;
    }
  }

  if (pinned !== undefined) {
    if (typeof pinned !== "boolean") {
      return { error: "Invalid note data" };
    }
    update.pinned = pinned;
  }

  if (Object.keys(update).length === 0) {
    return { error: "Invalid note data" };
  }

  return { update };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingFolders = distinctFolders(await listFolderNames());
    const parsed = parseNoteUpdate(await request.json(), existingFolders);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const result = await updateNote(id, parsed.update);
    if (!result) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/notes/[id] failed:", error);
    return NextResponse.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteNote(id);
    if (!deleted) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notes/[id] failed:", error);
    return NextResponse.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
