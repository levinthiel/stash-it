"use client";

import { useEffect, useRef } from "react";
import { colors } from "@/lib/colors";

interface NoteCardMenuProps {
  pinned: boolean;
  onPinToggle: () => void;
  onMove: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function NoteCardMenu({
  pinned,
  onPinToggle,
  onMove,
  onDelete,
  onClose,
}: NoteCardMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (ref.current && !ref.current.contains(target)) onClose();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [onClose]);

  const itemClass =
    "w-full px-4 py-2.5 text-left text-sm font-semibold transition-opacity hover:opacity-80";

  return (
    <div
      ref={ref}
      className="absolute top-8 right-0 z-30 min-w-[10.5rem] overflow-hidden rounded-lg py-1 shadow-lg"
      style={{
        background: colors.modalSurface,
        border: `1px solid ${colors.panelLine}`,
      }}
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        style={{ color: colors.textPrimary }}
        onClick={() => {
          onPinToggle();
          onClose();
        }}
      >
        {pinned ? "Unpin" : "Pin to top"}
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        style={{ color: colors.textPrimary }}
        onClick={() => {
          onMove();
          onClose();
        }}
      >
        Move to folder…
      </button>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        style={{ color: colors.pocketRed }}
        onClick={() => {
          onDelete();
          onClose();
        }}
      >
        Delete
      </button>
    </div>
  );
}
