"use client";

import { useState } from "react";
import { Pin } from "iconoir-react";
import { MarkdownView } from "@/components/MarkdownView";
import { MoveToFolderDialog } from "@/components/MoveToFolderDialog";
import { colors } from "@/lib/colors";
import { UNSORTED_LABEL } from "@/lib/folders";
import type { Note } from "@/types/note";

export type NoteModalConfirmData = {
  id?: string;
  title: string;
  body: string;
  folder: string | null;
  pinned: boolean;
};

interface NoteModalProps {
  mode: "edit" | "create";
  note?: Note;
  isOpen: boolean;
  folders: string[];
  defaultFolder?: string | null;
  onClose: () => void;
  onConfirm: (data: NoteModalConfirmData) => void;
  onDelete?: (id: string) => void;
  onPinToggle?: (pinned: boolean) => void;
  onFolderChange?: (folder: string | null) => void;
}

const fieldStyle = {
  background: colors.modalInput,
  border: `1px solid ${colors.border}`,
  color: colors.textPrimary,
  borderRadius: 8,
};

function NoteModalForm({
  mode,
  note,
  folders,
  defaultFolder,
  onClose,
  onConfirm,
  onDelete,
  onPinToggle,
  onFolderChange,
}: {
  mode: "edit" | "create";
  note?: Note;
  folders: string[];
  defaultFolder: string | null;
  onClose: () => void;
  onConfirm: (data: NoteModalConfirmData) => void;
  onDelete?: (id: string) => void;
  onPinToggle?: (pinned: boolean) => void;
  onFolderChange?: (folder: string | null) => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [folder, setFolder] = useState<string | null>(note?.folder ?? defaultFolder);
  const [pinned, setPinned] = useState(note?.pinned ?? false);
  const [isEditing, setIsEditing] = useState(mode === "create");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      id: note?.id,
      title,
      body,
      folder,
      pinned,
    });
  };

  const handleDelete = () => {
    if (!note?.id || !onDelete) return;
    onDelete(note.id);
    onClose();
  };

  const handlePinClick = () => {
    const next = !pinned;
    setPinned(next);
    if (mode === "edit" && note?.id && onPinToggle) {
      onPinToggle(next);
    }
  };

  const handleFolderSelect = (next: string | null) => {
    setFolder(next);
    setFolderDialogOpen(false);
    if (mode === "edit" && note?.id && onFolderChange) {
      onFolderChange(next);
    }
  };

  const folderLabel = folder ?? UNSORTED_LABEL;

  return (
    <>
      <div className="overflow-y-auto p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2
            className="text-lg font-bold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            {mode === "create" ? "New Note" : isEditing ? "Edit Note" : "Note"}
          </h2>
          <button
            type="button"
            aria-label={pinned ? "Unpin note" : "Pin note"}
            aria-pressed={pinned}
            onClick={handlePinClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
            style={{
              background: colors.shell,
              color: pinned ? colors.accent : colors.textSecondary,
            }}
          >
            <Pin width={18} height={18} strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setFolderDialogOpen(true)}
          className="mb-4 rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-80"
          style={{
            background: colors.shell,
            color: colors.textSecondary,
          }}
        >
          Folder · {folderLabel}
        </button>

        {isEditing ? (
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
                placeholder="Write something in markdown…"
                rows={8}
                className="resize-y px-3 py-2.5 outline-none"
                style={fieldStyle}
              />
            </label>

            <div className="mt-2 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mode === "edit") setIsEditing(false);
                  else onClose();
                }}
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
        ) : (
          <div className="flex flex-col gap-4">
            <h3
              className="text-base font-semibold"
              style={{ color: colors.textPrimary }}
              title={note?.title}
            >
              {note?.title}
            </h3>
            <MarkdownView source={note?.body ?? ""} />
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
                Close
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 rounded-lg py-3 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-90"
                style={{
                  background: colors.neonBlue,
                  color: colors.textDark,
                }}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <MoveToFolderDialog
        isOpen={folderDialogOpen}
        currentFolder={folder}
        folders={folders}
        onClose={() => setFolderDialogOpen(false)}
        onSelect={handleFolderSelect}
      />
    </>
  );
}

export function NoteModal({
  mode,
  note,
  isOpen,
  folders,
  defaultFolder = null,
  onClose,
  onConfirm,
  onDelete,
  onPinToggle,
  onFolderChange,
}: NoteModalProps) {
  if (!isOpen) return null;

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
        <NoteModalForm
          key={note?.id ?? `create-${defaultFolder ?? "unsorted"}`}
          mode={mode}
          note={note}
          folders={folders}
          defaultFolder={defaultFolder}
          onClose={onClose}
          onConfirm={onConfirm}
          onDelete={onDelete}
          onPinToggle={onPinToggle}
          onFolderChange={onFolderChange}
        />
      </div>
    </div>
  );
}
