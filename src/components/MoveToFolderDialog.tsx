"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";
import { UNSORTED_LABEL, validateFolderName } from "@/lib/folders";

interface MoveToFolderDialogProps {
  isOpen: boolean;
  currentFolder: string | null;
  folders: string[];
  onClose: () => void;
  onSelect: (folder: string | null) => void;
}

const fieldStyle = {
  background: colors.modalInput,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

function MoveToFolderDialogForm({
  currentFolder,
  folders,
  onClose,
  onSelect,
}: {
  currentFolder: string | null;
  folders: string[];
  onClose: () => void;
  onSelect: (folder: string | null) => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validated = validateFolderName(newName);
    if (!validated) {
      setError("Use 1–30 characters with no / in the name.");
      return;
    }
    const collision = folders.find((f) => f.toLowerCase() === validated.toLowerCase());
    if (collision) {
      setError(`Folder "${collision}" already exists.`);
      return;
    }
    onSelect(validated);
  };

  const optionClass =
    "w-full rounded-lg px-3 py-3 text-left text-sm font-semibold transition-opacity hover:opacity-90";

  return (
    <>
      <h2
        className="mb-5 text-lg font-bold uppercase tracking-wider"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: colors.textPrimary,
        }}
      >
        Move to folder
      </h2>

      <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
        <button
          type="button"
          className={optionClass}
          style={{
            background: currentFolder === null ? colors.neonBlue : colors.shell,
            color: currentFolder === null ? colors.textDark : colors.textPrimary,
          }}
          onClick={() => onSelect(null)}
        >
          {UNSORTED_LABEL}
        </button>

        {folders.map((folder) => {
          const active = currentFolder === folder;
          return (
            <button
              key={folder}
              type="button"
              className={optionClass}
              style={{
                background: active ? colors.neonBlue : colors.shell,
                color: active ? colors.textDark : colors.textPrimary,
              }}
              onClick={() => onSelect(folder)}
            >
              {folder}
            </button>
          );
        })}
      </div>

      <div className="mt-4 border-t pt-4" style={{ borderColor: colors.panelLine }}>
        {showNew ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError(null);
              }}
              placeholder="New folder name"
              maxLength={30}
              autoFocus
              className="px-3 py-2.5 outline-none"
              style={fieldStyle}
            />
            {error && (
              <p className="text-sm" style={{ color: colors.pocketRed }}>
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowNew(false);
                  setError(null);
                }}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold uppercase tracking-wide"
                style={{ background: colors.shell, color: colors.textSecondary }}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold uppercase tracking-wide"
                style={{ background: colors.neonBlue, color: colors.textDark }}
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="w-full py-2 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
            style={{ color: colors.neonBlue }}
          >
            New folder…
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 w-full rounded-lg py-2.5 text-sm font-semibold uppercase tracking-wide"
        style={{ background: colors.shell, color: colors.textSecondary }}
      >
        Cancel
      </button>
    </>
  );
}

export function MoveToFolderDialog({
  isOpen,
  currentFolder,
  folders,
  onClose,
  onSelect,
}: MoveToFolderDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center"
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
        <MoveToFolderDialogForm
          key={`${currentFolder ?? "unsorted"}-${folders.join("|")}`}
          currentFolder={currentFolder}
          folders={folders}
          onClose={onClose}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}
