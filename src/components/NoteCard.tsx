"use client";

import { useState } from "react";
import { MoreVert, Pin } from "iconoir-react";
import { NoteCardMenu } from "@/components/NoteCardMenu";
import { colors } from "@/lib/colors";
import { stripMarkdown } from "@/lib/markdown";
import type { Note } from "@/types/note";

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
  onPinToggle: () => void;
  onMove: () => void;
  onDelete: () => void;
}

function notePreview(body: string, maxLength = 420): string {
  const text = stripMarkdown(body).replace(/\s+/g, " ").trim();
  if (!text) return "No content";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function NoteCard({ note, onOpen, onPinToggle, onMove, onDelete }: NoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative w-full min-h-[9.25rem] rounded-3xl text-left transition-transform active:scale-[0.99]"
      style={{ background: colors.shell }}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[9.25rem] w-full flex-col items-stretch justify-start px-4 py-4 pr-12 text-left"
      >
        <p
          className="flex items-center gap-1.5 text-base font-semibold uppercase tracking-wide"
          style={{ color: colors.textPrimary }}
        >
          <span className="line-clamp-1 min-w-0" title={note.title}>
            {note.title}
          </span>
          {note.pinned && (
            <span className="inline-flex shrink-0" aria-label="Pinned">
              <Pin width={14} height={14} strokeWidth={2} color={colors.accent} />
            </span>
          )}
        </p>
        <p
          className="mt-2 line-clamp-4 text-sm leading-relaxed"
          style={{ color: colors.textPrimary }}
        >
          {notePreview(note.body)}
        </p>
      </button>

      <button
        type="button"
        aria-label="Note options"
        className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-xl transition-opacity hover:opacity-80"
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
