import type { Note, NoteInput, NoteUpdate } from "@/types/note";

export type NoteUpdateResult = {
  note: Note;
  unpinnedTitle?: string;
};

export type FolderRenameResult = {
  renamed: number;
  merged: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function fetchNotes(): Promise<Note[]> {
  const response = await fetch("/api/notes");
  return parseResponse<Note[]>(response);
}

export async function createNote(input: NoteInput): Promise<Note> {
  const response = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<Note>(response);
}

export async function updateNote(
  id: string,
  update: NoteUpdate
): Promise<NoteUpdateResult> {
  const response = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  return parseResponse<NoteUpdateResult>(response);
}

export async function deleteNote(id: string): Promise<void> {
  const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  await parseResponse<{ success: boolean }>(response);
}

export async function renameFolder(
  from: string,
  to: string
): Promise<FolderRenameResult> {
  const response = await fetch("/api/folders", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to }),
  });
  return parseResponse<FolderRenameResult>(response);
}
