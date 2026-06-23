import { NextResponse } from "next/server";
import { createNote, listNotes } from "@/lib/notes";
import type { NoteInput } from "@/types/note";

function parseNoteInput(body: unknown): NoteInput | null {
  if (!body || typeof body !== "object") return null;

  const { title, body: noteBody } = body as Record<string, unknown>;

  if (typeof title !== "string" || !title.trim()) return null;
  if (typeof noteBody !== "string") return null;

  return {
    title: title.trim(),
    body: noteBody,
  };
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
    const input = parseNoteInput(await request.json());
    if (!input) {
      return NextResponse.json({ error: "Invalid note data" }, { status: 400 });
    }

    const note = await createNote(input);
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/notes failed:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
