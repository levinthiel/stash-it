"use client";

import { Plus } from "iconoir-react";
import { colors } from "@/lib/colors";

interface AddPocketButtonProps {
  onClick: () => void;
  ariaLabel?: string;
}

export function AddPocketButton({ onClick, ariaLabel = "Add pocket" }: AddPocketButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-xl transition-transform active:scale-95"
      style={{
        background: colors.pocketGreen,
        borderRadius: 14,
      }}
    >
      <Plus width={26} height={26} strokeWidth={2.5} color={colors.textDark} />
    </button>
  );
}
