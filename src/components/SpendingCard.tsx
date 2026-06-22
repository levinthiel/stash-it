"use client";

import { colors } from "@/lib/colors";
import type { Spending } from "@/types/spending";

interface SpendingCardProps {
  spending: Spending;
  onClick: () => void;
}

export function SpendingCard({ spending, onClick }: SpendingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
      style={{
        background: colors.shell,
        borderRadius: 16,
      }}
    >
      <div className="flex items-center gap-2 p-3">
        <p
          className="min-w-0 flex-[3] truncate text-xs font-semibold uppercase tracking-wide"
          style={{ color: colors.textDark }}
        >
          {spending.name}
        </p>

        <div
          className="hw-inset min-w-0 flex-[2] rounded-md px-2 py-1.5"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <p
            className="truncate text-base font-bold"
            style={{ color: colors.textPrimary, letterSpacing: "0.12em" }}
          >
            €{spending.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
}
