"use client";

import { useEffect, useState } from "react";
import { HardwareCorner } from "@/components/HardwareCorner";
import { colors } from "@/lib/colors";
import type { Spending } from "@/types/spending";

interface SpendingModalProps {
  mode: "edit" | "create";
  spending?: Spending;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Pick<Spending, "name" | "amount"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const fieldStyle = {
  background: colors.display,
  border: `2px solid ${colors.outline}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

export function SpendingModal({
  mode,
  spending,
  isOpen,
  onClose,
  onConfirm,
  onDelete,
}: SpendingModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(spending?.name ?? "");
      setAmount(spending?.amount?.toString() ?? "");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, spending]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount)) return;

    onConfirm({
      id: spending?.id,
      name: name.trim(),
      amount: parsedAmount,
    });
  };

  const handleDelete = () => {
    if (!spending?.id || !onDelete) return;
    onDelete(spending.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative z-10 w-full max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl"
        style={{
          background: colors.surface,
          border: `6px solid ${colors.pocketTeal}`,
          borderRadius: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <HardwareCorner accent={colors.pocketTeal} size={35} />

        <div className="relative p-6 pr-10 pt-4">
          <h2
            className="mb-6 text-lg font-bold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            {mode === "edit" ? "Edit Expense" : "New Expense"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Groceries"
                className="px-3 py-2.5 outline-none"
                style={fieldStyle}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Amount
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                className="px-3 py-2.5 outline-none"
                style={{ ...fieldStyle, fontFamily: "var(--font-geist-mono)" }}
              />
            </label>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
                style={{
                  background: colors.shell,
                  color: colors.textSecondary,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90"
                style={{
                  background: colors.pocketYellow,
                  color: colors.textDark,
                }}
              >
                Confirm
              </button>
            </div>

            {mode === "edit" && onDelete && spending && (
              <div
                className="mt-2 border-t pt-4"
                style={{ borderColor: colors.panelLine }}
              >
                {showDeleteConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-sm" style={{ color: colors.textSecondary }}>
                      Delete &ldquo;{spending.name}&rdquo;? This can&apos;t be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold"
                        style={{ background: colors.shell, color: colors.textSecondary }}
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold"
                        style={{
                          background: colors.pocketRed,
                          color: colors.textDark,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
                    style={{ color: colors.pocketRed }}
                  >
                    Delete Expense
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
