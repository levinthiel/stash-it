"use client";

import { useCallback, useEffect, useState } from "react";
import { AddNoteButton } from "@/components/AddNoteButton";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderNavMenu } from "@/components/HeaderNavMenu";
import { NoteCard } from "@/components/NoteCard";
import { NoteModal } from "@/components/NoteModal";
import { colors } from "@/lib/colors";
import { createNote, deleteNote, fetchNotes, updateNote } from "@/lib/note-api";
import type { Note } from "@/types/note";

export function NotesOverview() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleConfirmEdit = async (data: Pick<Note, "title" | "body"> & { id?: string }) => {
    if (!data.id) return;

    try {
      setError(null);
      const updated = await updateNote(data.id, {
        title: data.title,
        body: data.body,
      });
      setNotes((prev) => {
        const next = prev.map((n) => (n.id === updated.id ? updated : n));
        return next.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      setEditingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setError(null);
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setEditingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const handleConfirmCreate = async (data: Pick<Note, "title" | "body"> & { id?: string }) => {
    try {
      setError(null);
      const created = await createNote({
        title: data.title,
        body: data.body,
      });
      setNotes((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  return (
    <div className="relative min-h-full flex-1 pb-24">
      <header className="px-5 pt-8 pb-6">
        <div className="flex w-full items-center gap-3 text-2xl">
          <h1
            className="shrink-0 font-bold uppercase tracking-wide leading-none"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            Notes
          </h1>
          <HeaderAccentLines />
          <HeaderNavMenu />
        </div>
      </header>

      <main className="px-5">
        {error && (
          <p
            className="hw-outline mb-4 rounded-lg px-3 py-2 text-sm"
            style={{
              background: colors.shell,
              color: colors.pocketRed,
            }}
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Loading notes…
          </p>
        ) : notes.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No notes yet. Tap + to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onClick={() => setEditingNote(note)} />
            ))}
          </div>
        )}
      </main>

      <AddNoteButton onClick={() => setIsCreateOpen(true)} />

      <NoteModal
        mode="edit"
        note={editingNote ?? undefined}
        isOpen={editingNote !== null}
        onClose={() => setEditingNote(null)}
        onConfirm={handleConfirmEdit}
        onDelete={handleDeleteNote}
      />

      <NoteModal
        mode="create"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
