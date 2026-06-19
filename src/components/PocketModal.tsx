"use client";

import { useEffect, useState } from "react";
import { HardwareCorner } from "@/components/HardwareCorner";
import { colors, pocketColorOptions, type PocketColorKey } from "@/lib/colors";
import { getPocketIcon, pocketIcons, type PocketIconKey } from "@/lib/icons";
import type { Pocket } from "@/types/pocket";

interface PocketModalProps {
  mode: "edit" | "create";
  pocket?: Pocket;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Pocket, "id"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const fieldStyle = {
  background: colors.display,
  border: `2px solid ${colors.outline}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

export function PocketModal({
  mode,
  pocket,
  isOpen,
  onClose,
  onConfirm,
  onDelete,
}: PocketModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState<PocketColorKey>("pocketBlue");
  const [icon, setIcon] = useState<PocketIconKey>("disk");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(pocket?.name ?? "");
      setAmount(pocket?.amount?.toString() ?? "");
      setColor(pocket?.color ?? "pocketBlue");
      setIcon(pocket?.icon ?? "disk");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, pocket]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount)) return;

    onConfirm({
      id: pocket?.id,
      name: name.trim(),
      amount: parsedAmount,
      color,
      icon,
    });
  };

  const handleDelete = () => {
    if (!pocket?.id || !onDelete) return;
    onDelete(pocket.id);
    onClose();
  };

  const SelectedIcon = getPocketIcon(icon).Icon;

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
            {mode === "edit" ? "Edit Pocket" : "New Pocket"}
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
                placeholder="e.g. Snacks"
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

            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Color
              </span>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value as PocketColorKey)}
                className="w-full appearance-none px-3 py-2.5 outline-none"
                style={fieldStyle}
              >
                {pocketColorOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Icon
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: colors.pocketTeal,
                    border: `2px solid ${colors.outline}`,
                  }}
                >
                  <SelectedIcon width={18} height={18} color={colors.textDark} />
                </div>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value as PocketIconKey)}
                  className="w-full appearance-none px-3 py-2.5 outline-none"
                  style={fieldStyle}
                >
                  {pocketIcons.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
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

            {mode === "edit" && onDelete && pocket && (
              <div
                className="mt-2 border-t pt-4"
                style={{ borderColor: colors.panelLine }}
              >
                {showDeleteConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-sm" style={{ color: colors.textSecondary }}>
                      Delete &ldquo;{pocket.name}&rdquo;? This can&apos;t be undone.
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
                    Delete Pocket
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
