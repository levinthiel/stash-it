"use client";

import { useState } from "react";
import { MoreVert, Pin } from "iconoir-react";
import { NoteCardMenu } from "@/components/NoteCardMenu";
import { colors, getPocketColor } from "@/lib/colors";
import { stripMarkdown } from "@/lib/markdown";
import { relativeTime } from "@/lib/time";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onPinToggle: () => void;
  onMove: () => void;
  onDelete: () => void;
}

function notePreview(body: string, maxLength = 160): string {
  const text = stripMarkdown(body).replace(/\s+/g, " ").trim();
  if (!text) return "No content";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function NoteCard({ note, onOpen, onPinToggle, onMove, onDelete }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const accent = getPocketColor(note.color ?? "pocketBlue").accent;

  return (
    <div
      className="relative w-full rounded-xl text-left transition-transform active:scale-[0.99]"
      style={{ background: colors.shell }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="w-full px-4 py-3 pr-12 text-left"
      >
        <p
          className="line-clamp-1 text-sm font-semibold uppercase tracking-wide"
          style={{ color: accent }}
          title={note.title}
        >
          {note.title}
        </p>
        <p
          className="mt-1.5 line-clamp-2 text-xs leading-relaxed"
          style={{ color: colors.textPrimary }}
        >
          {notePreview(note.body)}
        </p>
        <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: colors.textSecondary }}>
          <span>{relativeTime(note.updatedAt)}</span>
          {note.pinned && (
            <span className="inline-flex items-center gap-0.5" aria-label="Pinned">
              <Pin width={12} height={12} strokeWidth={2} color={colors.accent} />
            </span>
          )}
        </div>
      </button>

      <button
        type="button"
        aria-label="Note options"
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
        style={{ color: colors.textSecondary }}
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((open) => !open);
        }}
      >
        <MoreVert width={18} height={18} strokeWidth={2} />
      </button>

      {menuOpen && (
        <NoteCardMenu
          pinned={note.pinned}
          onPinToggle={onPinToggle}
          onMove={onMove}
          onDelete={onDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
