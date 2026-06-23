import { NextResponse } from "next/server";
import { deleteNote, updateNote } from "@/lib/notes";
import type { NoteUpdate } from "@/types/note";

function parseNoteUpdate(body: unknown): NoteUpdate | null {
  if (!body || typeof body !== "object") return null;

  const { title, body: noteBody } = body as Record<string, unknown>;
  const update: NoteUpdate = {};

  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) return null;
    update.title = title.trim();
  }

  if (noteBody !== undefined) {
    if (typeof noteBody !== "string") return null;
    update.body = noteBody;
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
    const update = parseNoteUpdate(await request.json());
    if (!update) {
      return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
    }

    const note = await updateNote(id, update);
    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
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
