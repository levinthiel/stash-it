"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";
import { UNSORTED_LABEL, validateFolderName } from "@/lib/folders";

interface FolderNameDialogProps {
  mode: "create" | "rename";
  isOpen: boolean;
  initialName?: string;
  existingFolders: string[];
  onClose: () => void;
  onConfirm: (name: string) => void;
  onMoveToUnsorted?: () => void;
}

const fieldStyle = {
  background: colors.modalInput,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

function FolderNameDialogForm({
  mode,
  initialName,
  existingFolders,
  onClose,
  onConfirm,
  onMoveToUnsorted,
}: {
  mode: "create" | "rename";
  initialName: string;
  existingFolders: string[];
  onClose: () => void;
  onConfirm: (name: string) => void;
  onMoveToUnsorted?: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnsorted, setConfirmUnsorted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateFolderName(name);
    if (!validated) {
      setError("Use 1–30 characters with no / in the name.");
      return;
    }

    const collision = existingFolders.find(
      (folder) =>
        folder.toLowerCase() === validated.toLowerCase() &&
        (mode === "create" || folder.toLowerCase() !== initialName.toLowerCase())
    );

    if (mode === "create" && collision) {
      setError(`Folder "${collision}" already exists.`);
      return;
    }

    onConfirm(validated);
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
        {mode === "create" ? "New Folder" : "Rename Folder"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.textSecondary }}
          >
            Folder name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g., Mine"
            maxLength={30}
            autoFocus
            className="px-3 py-2.5 outline-none"
            style={fieldStyle}
          />
        </label>

        {error && (
          <p className="text-sm" style={{ color: colors.pocketRed }}>
            {error}
          </p>
        )}

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
            {mode === "create" ? "Create" : "Rename"}
          </button>
        </div>

        {mode === "rename" && onMoveToUnsorted && (
          <div className="mt-2 border-t pt-4" style={{ borderColor: colors.panelLine }}>
            {confirmUnsorted ? (
              <div className="flex flex-col gap-3">
                <p className="text-center text-sm" style={{ color: colors.textSecondary }}>
                  Move all notes in this folder to {UNSORTED_LABEL}? Notes are kept.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setConfirmUnsorted(false)}
                    className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold"
                    style={{ background: colors.shell, color: colors.textSecondary }}
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={onMoveToUnsorted}
                    className="hw-outline flex-1 rounded-lg py-3 text-sm font-semibold"
                    style={{
                      background: colors.pocketYellow,
                      color: colors.textDark,
                    }}
                  >
                    Move
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmUnsorted(true)}
                className="w-full py-2 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
                style={{ color: colors.textSecondary }}
              >
                Move all notes to {UNSORTED_LABEL}
              </button>
            )}
          </div>
        )}
      </form>
    </>
  );
}

export function FolderNameDialog({
  mode,
  isOpen,
  initialName = "",
  existingFolders,
  onClose,
  onConfirm,
  onMoveToUnsorted,
}: FolderNameDialogProps) {
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
        <FolderNameDialogForm
          key={`${mode}-${initialName}`}
          mode={mode}
          initialName={initialName}
          existingFolders={existingFolders}
          onClose={onClose}
          onConfirm={onConfirm}
          onMoveToUnsorted={onMoveToUnsorted}
        />
      </div>
    </div>
  );
}
