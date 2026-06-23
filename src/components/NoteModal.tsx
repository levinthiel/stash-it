"use client";

import { useEffect, useState } from "react";
import { colors } from "@/lib/colors";
import type { Note } from "@/types/note";

interface NoteModalProps {
  mode: "edit" | "create";
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Pick<Note, "title" | "body"> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

const fieldStyle = {
  background: colors.modalInput,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

export function NoteModal({
  mode,
  note,
  isOpen,
  onClose,
  onConfirm,
  onDelete,
}: NoteModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(note?.title ?? "");
      setBody(note?.body ?? "");
      setShowDeleteConfirm(false);
    }
  }, [isOpen, note]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onConfirm({
      id: note?.id,
      title: title.trim(),
      body,
    });
  };

  const handleDelete = () => {
    if (!note?.id || !onDelete) return;
    onDelete(note.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden"
        style={{
          background: colors.modalSurface,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto p-6">
          <h2
            className="mb-6 text-lg font-bold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            {mode === "edit" ? "Edit Note" : "New Note"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Title
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ideas"
                className="px-3 py-2.5 outline-none"
                style={fieldStyle}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Note
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write something…"
                rows={8}
                className="resize-y px-3 py-2.5 outline-none"
                style={fieldStyle}
              />
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
                {mode === "edit" ? "Save" : "Add"}
              </button>
            </div>

            {mode === "edit" && onDelete && note && (
              <div className="mt-2 border-t pt-4" style={{ borderColor: colors.panelLine }}>
                {showDeleteConfirm ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-sm" style={{ color: colors.textSecondary }}>
                      Delete &ldquo;{note.title}&rdquo;? This can&apos;t be undone.
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
                    Delete Note
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
