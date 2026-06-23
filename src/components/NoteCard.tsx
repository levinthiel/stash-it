"use client";

import { getPocketColor, colors } from "@/lib/colors";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

function notePreview(body: string, maxLength = 80): string {
  const text = body.trim().replace(/\s+/g, " ");
  if (!text) return "No content";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const accent = getPocketColor(note.color).accent;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl px-4 py-3 text-left transition-transform active:scale-[0.99]"
      style={{ background: colors.shell }}
    >
      <p
        className="truncate text-sm font-semibold uppercase tracking-wide"
        style={{ color: accent }}
      >
        {note.title}
      </p>
      <p
        className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
        style={{ color: colors.textPrimary }}
      >
        {notePreview(note.body)}
      </p>
    </button>
  );
}
