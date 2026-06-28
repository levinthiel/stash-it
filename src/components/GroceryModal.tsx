"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";
import { GROCERY_STORES, normalizeGroceryStore } from "@/lib/grocery-stores";
import type { Grocery, GroceryInput } from "@/types/grocery";

interface GroceryModalProps {
  isOpen: boolean;
  item?: Grocery | null;
  onClose: () => void;
  onConfirm: (data: GroceryInput) => void;
}

const fieldStyle = {
  background: colors.modalInput,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

function GroceryModalForm({
  item,
  onClose,
  onConfirm,
}: {
  item?: Grocery | null;
  onClose: () => void;
  onConfirm: (data: GroceryInput) => void;
}) {
  const isEditing = item != null;
  const [name, setName] = useState(item?.name ?? "");
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [store, setStore] = useState(item?.store ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQuantity = parseInt(quantity, 10);
    if (!name.trim() || isNaN(parsedQuantity) || parsedQuantity < 1) return;

    onConfirm({
      name: name.trim(),
      quantity: parsedQuantity,
      store: normalizeGroceryStore(store),
    });
  };

  return (
    <>
      <h2
        className="mb-6 text-lg font-bold uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: colors.textPrimary,
        }}
      >
        {isEditing ? "Edit Item" : "Add Item"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Item name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Carrots"
            className="px-3 py-2.5 outline-none"
            style={fieldStyle}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Quantity
          </span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min={1}
            step={1}
            className="px-3 py-2.5 outline-none"
            style={{ ...fieldStyle, fontFamily: "var(--font-geist-mono)" }}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Store
          </span>
          <select
            value={store}
            onChange={(e) => setStore(e.target.value)}
            className="px-3 py-2.5 outline-none"
            style={fieldStyle}
          >
            <option value="">None</option>
            {GROCERY_STORES.map((storeName) => (
              <option key={storeName} value={storeName}>
                {storeName}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: colors.shell,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90"
            style={{
              background: colors.neonBlue,
              color: colors.textDark,
            }}
          >
            {isEditing ? "Save" : "Add"}
          </button>
        </div>
      </form>
    </>
  );
}

export function GroceryModal({ isOpen, item, onClose, onConfirm }: GroceryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative z-10 w-full max-w-md p-6"
        style={{
          background: colors.modalSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <GroceryModalForm
          key={item?.id ?? "new"}
          item={item}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      </div>
    </div>
  );
}
