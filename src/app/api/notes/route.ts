import { NextResponse } from "next/server";
import { validPocketColorKeys, type PocketColorKey } from "@/lib/colors";
import { distinctFolders, findExistingFolderCasing, validateFolderPath } from "@/lib/folders";
import { createNote, listFolderNames, listNotes } from "@/lib/notes";
import type { NoteInput } from "@/types/note";

function parseNoteInput(
  body: unknown,
  existingFolders: string[]
): { input: NoteInput } | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Invalid note data" };
  }

  const {
    title,
    body: noteBody,
    color,
    folder,
  } = body as Record<string, unknown>;

  if (typeof title !== "string") {
    return { error: "Invalid note data" };
  }
  if (typeof noteBody !== "string") {
    return { error: "Invalid note data" };
  }

  const input: NoteInput = {
    title,
    body: noteBody,
  };

  if (color !== undefined) {
    if (typeof color !== "string" || !validPocketColorKeys.has(color as PocketColorKey)) {
      return { error: "Invalid note data" };
    }
    input.color = color as PocketColorKey;
  }

  if (folder !== undefined) {
    if (folder === null) {
      input.folder = null;
    } else {
      const validated = validateFolderPath(folder);
      if (!validated) {
        return { error: "Invalid folder name" };
      }
      // Prefer existing casing when the folder already exists.
      input.folder = findExistingFolderCasing(existingFolders, validated) ?? validated;
    }
  }

  return { input };
}

export async function GET() {
  try {
    const notes = await listNotes();
    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET /api/notes failed:", error);
    return NextResponse.json({ error: "Failed to load notes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const existingFolders = distinctFolders(await listFolderNames());
    const parsed = parseNoteInput(await request.json(), existingFolders);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const note = await createNote(parsed.input);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes failed:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
