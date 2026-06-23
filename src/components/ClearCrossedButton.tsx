"use client";

import { Trash } from "iconoir-react";
import { colors } from "@/lib/colors";

interface ClearCrossedButtonProps {
  onClick: () => void;
}

export function ClearCrossedButton({ onClick }: ClearCrossedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Delete all crossed items"
      className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-xl transition-transform active:scale-95"
      style={{
        background: colors.pocketRed,
        borderRadius: 14,
      }}
    >
      <Trash width={24} height={24} strokeWidth={2} color={colors.textPrimary} />
    </button>
  );
}
