"use client";

import { Plus } from "iconoir-react";
import { colors } from "@/lib/colors";

interface AddGroceryButtonProps {
  onClick: () => void;
}

export function AddGroceryButton({ onClick }: AddGroceryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add grocery item"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-xl transition-transform active:scale-95"
      style={{
        background: colors.neonPink,
        borderRadius: 14,
      }}
    >
      <Plus width={26} height={26} strokeWidth={2.5} color={colors.textPrimary} />
    </button>
  );
}
