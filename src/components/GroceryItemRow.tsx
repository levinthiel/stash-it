"use client";

import { Minus, Plus } from "iconoir-react";
import { colors } from "@/lib/colors";
import type { Grocery } from "@/types/grocery";

interface GroceryItemRowProps {
  item: Grocery;
  onToggle: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
}

const stepButtonStyle = {
  background: colors.display,
  border: `2px solid ${colors.outline}`,
  color: colors.textPrimary,
};

export function GroceryItemRow({ item, onToggle, onQuantityChange }: GroceryItemRowProps) {
  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3"
      style={{
        background: colors.shell,
        opacity: item.checked ? 0.65 : 1,
      }}
    >
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => onToggle(item.id, e.target.checked)}
        aria-label={`Mark ${item.name} as ${item.checked ? "needed" : "done"}`}
        className="h-4 w-4 shrink-0 cursor-pointer accent-[#32C3A2]"
      />

      <p
        className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide"
        style={{
          color: colors.textDark,
          textDecoration: item.checked ? "line-through" : "none",
        }}
      >
        {item.name}
      </p>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label={`Decrease ${item.name} quantity`}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-opacity enabled:hover:opacity-80 disabled:opacity-40"
          style={stepButtonStyle}
        >
          <Minus width={14} height={14} strokeWidth={2.5} />
        </button>

        <span
          className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums"
          style={{
            fontFamily: "var(--font-geist-mono)",
            color: colors.textPrimary,
          }}
        >
          {item.quantity}
        </span>

        <button
          type="button"
          onClick={() => onQuantityChange(item.id, item.quantity + 1)}
          aria-label={`Increase ${item.name} quantity`}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-opacity hover:opacity-80"
          style={stepButtonStyle}
        >
          <Plus width={14} height={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
