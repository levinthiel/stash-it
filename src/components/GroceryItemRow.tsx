"use client";

import { Check, Minus, Plus } from "iconoir-react";
import { colors, getPocketColor } from "@/lib/colors";
import type { Grocery } from "@/types/grocery";

interface GroceryItemRowProps {
  item: Grocery;
  displayQuantity: number;
  isPendingDelete: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onEdit: (item: Grocery) => void;
}

const stepButtonStyle = {
  background: colors.display,
  border: `2px solid ${colors.outline}`,
  color: colors.textPrimary,
};

export function GroceryItemRow({
  item,
  displayQuantity,
  isPendingDelete,
  onToggle,
  onQuantityChange,
  onEdit,
}: GroceryItemRowProps) {
  const isLocked = item.checked;
  const accent = getPocketColor(item.color).accent;

  const nameStyle = {
    color: isLocked ? colors.textSecondary : accent,
    textDecoration: item.checked ? ("line-through" as const) : ("none" as const),
  };

  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-opacity"
      style={{
        background: colors.shell,
        opacity: isLocked ? 0.65 : isPendingDelete ? 0.5 : 1,
      }}
    >
      <label className="relative flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={(e) => onToggle(item.id, e.target.checked)}
          aria-label={`Mark ${item.name} as ${item.checked ? "needed" : "done"}`}
          className="peer sr-only"
        />
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
          style={{
            borderColor: item.checked ? accent : colors.panelLine,
            background: item.checked ? accent : colors.display,
            outlineColor: accent,
          }}
        >
          {item.checked && (
            <Check width={12} height={12} strokeWidth={3} color={colors.textPrimary} />
          )}
        </span>
      </label>

      {isLocked ? (
        <p
          className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide"
          style={nameStyle}
        >
          {item.name}
          {isPendingDelete && (
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: colors.textSecondary }}
            >
              removing…
            </span>
          )}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="min-w-0 flex-1 truncate text-left text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
          style={nameStyle}
        >
          {item.name}
          {isPendingDelete && (
            <span
              className="ml-2 text-[10px] font-normal normal-case tracking-normal"
              style={{ color: colors.textSecondary }}
            >
              removing…
            </span>
          )}
        </button>
      )}

      <div
        className="flex shrink-0 items-center gap-1.5"
        style={{ pointerEvents: isLocked ? "none" : "auto" }}
      >
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, displayQuantity - 1)}
          disabled={isLocked || displayQuantity <= 0}
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
          {displayQuantity}
        </span>

        <button
          type="button"
          onClick={() => onQuantityChange(item.id, displayQuantity + 1)}
          disabled={isLocked}
          aria-label={`Increase ${item.name} quantity`}
          className="flex h-7 w-7 items-center justify-center rounded-md transition-opacity enabled:hover:opacity-80 disabled:opacity-40"
          style={stepButtonStyle}
        >
          <Plus width={14} height={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
