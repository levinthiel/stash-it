"use client";

import { useEffect, useRef, useState } from "react";
import { Folder, Notes, Plus } from "iconoir-react";
import { colors } from "@/lib/colors";

interface AddNoteButtonProps {
  onAddNote: () => void;
  /** When set, tapping + opens a menu with Note and Folder. */
  onAddFolder?: () => void;
}

export function AddNoteButton({ onAddNote, onAddFolder }: AddNoteButtonProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleFabClick = () => {
    if (!onAddFolder) {
      onAddNote();
      return;
    }
    setOpen((prev) => !prev);
  };

  const menuItemClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80";

  return (
    <div ref={rootRef} className="fixed bottom-6 right-6 z-40">
      {open && onAddFolder && (
        <div
          className="absolute bottom-[calc(100%+10px)] right-0 w-44 overflow-hidden rounded-3xl p-1.5"
          style={{
            background: colors.modalSurface,
            border: `1px solid ${colors.border}`,
          }}
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            style={{ color: colors.textPrimary }}
            onClick={() => {
              setOpen(false);
              onAddNote();
            }}
          >
            <Notes width={18} height={18} strokeWidth={2} />
            Note
          </button>
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            style={{ color: colors.textPrimary }}
            onClick={() => {
              setOpen(false);
              onAddFolder();
            }}
          >
            <Folder width={18} height={18} strokeWidth={2} />
            Folder
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleFabClick}
        aria-label={onAddFolder ? "Add note or folder" : "Add note"}
        aria-expanded={onAddFolder ? open : undefined}
        aria-haspopup={onAddFolder ? "menu" : undefined}
        className="flex h-14 w-14 items-center justify-center rounded-3xl transition-transform active:scale-95"
        style={{
          background: colors.pocketYellow,
        }}
      >
        <Plus width={26} height={26} strokeWidth={2.5} color={colors.textDark} />
      </button>
    </div>
  );
}
