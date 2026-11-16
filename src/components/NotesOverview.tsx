"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NavArrowLeft } from "iconoir-react";
import { AddNoteButton } from "@/components/AddNoteButton";
import { FolderNameDialog } from "@/components/FolderNameDialog";
import {
  ChildFolderPills,
  FolderPillBar,
  type NotesActiveView,
} from "@/components/FolderPillBar";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderNavMenu } from "@/components/HeaderNavMenu";
import { MoveToFolderDialog } from "@/components/MoveToFolderDialog";
import { NoteCard } from "@/components/NoteCard";
import { NoteModal, type NoteModalConfirmData } from "@/components/NoteModal";
import { NotesToast } from "@/components/NotesToast";
import { colors } from "@/lib/colors";
import {
  childFolders,
  distinctFolders,
  folderBreadcrumbs,
  folderDepth,
  folderLeafName,
  folderParentPath,
  isFolderPrefix,
  MAX_FOLDER_DEPTH,
  rewriteFolderPrefix,
  topLevelFolders,
  UNSORTED_LABEL,
} from "@/lib/folders";
import {
  createNote,
  deleteNote,
  fetchNotes,
  renameFolder,
  updateNote,
} from "@/lib/note-api";
import { RECENT_LIMIT } from "@/lib/note-constants";
import type { Note } from "@/types/note";

const TOAST_MS = 3500;

function sortByPinnedAtDesc(a: Note, b: Note): number {
  const aTime = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
  const bTime = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
  return bTime - aTime;
}

function sortByUpdatedAtDesc(a: Note, b: Note): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

export function NotesOverview() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeView, setActiveView] = useState<NotesActiveView>({ type: "all" });
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createFolder, setCreateFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [folderDialog, setFolderDialog] = useState<
    | { mode: "create"; parentPath: string | null }
    | { mode: "rename"; folder: string }
    | null
  >(null);
  const [movingNote, setMovingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    fetchNotes()
      .then((data) => {
        if (cancelled) return;
        setNotes(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load notes");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const folders = useMemo(() => {
    const fromNotes = notes.map((n) => n.folder);
    if (createFolder) return distinctFolders([...fromNotes, createFolder]);
    return distinctFolders(fromNotes);
  }, [notes, createFolder]);

  const topFolders = useMemo(() => topLevelFolders(folders), [folders]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const note of notes) {
      if (note.folder == null) continue;
      counts[note.folder] = (counts[note.folder] ?? 0) + 1;
    }
    return counts;
  }, [notes]);

  const unsortedCount = useMemo(
    () => notes.filter((n) => n.folder == null).length,
    [notes]
  );

  const childFolderList = useMemo(() => {
    if (activeView.type !== "folder" || activeView.folder == null) return [];
    return childFolders(folders, activeView.folder);
  }, [activeView, folders]);

  const upsertNote = useCallback((note: Note) => {
    setNotes((prev) => {
      const next = prev.some((n) => n.id === note.id)
        ? prev.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev];
      return next.sort(sortByUpdatedAtDesc);
    });
  }, []);

  const applyUpdateResult = useCallback(
    (result: { note: Note; unpinnedTitle?: string }) => {
      upsertNote(result.note);
      if (result.unpinnedTitle) {
        showToast(`Pinned. Unpinned "${result.unpinnedTitle}" (pin limit 5).`);
      }
      setEditingNote((current) =>
        current?.id === result.note.id ? result.note : current
      );
    },
    [showToast, upsertNote]
  );

  const handleConfirmEdit = async (data: NoteModalConfirmData) => {
    if (!data.id) return;

    try {
      setError(null);
      const result = await updateNote(data.id, {
        title: data.title,
        body: data.body,
        folder: data.folder,
        pinned: data.pinned,
      });
      applyUpdateResult(result);
      setEditingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const handleConfirmCreate = async (data: NoteModalConfirmData) => {
    try {
      setError(null);
      const created = await createNote({
        title: data.title,
        body: data.body,
        folder: data.folder,
      });
      if (data.pinned) {
        const result = await updateNote(created.id, { pinned: true });
        applyUpdateResult(result);
      } else {
        upsertNote(created);
      }
      setIsCreateOpen(false);
      setCreateFolder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      setError(null);
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setEditingNote(null);
      setDeletingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  const handlePinToggle = async (note: Note, pinned: boolean) => {
    try {
      setError(null);
      const result = await updateNote(note.id, { pinned });
      applyUpdateResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update note");
    }
  };

  const handleMoveNote = async (note: Note, folder: string | null) => {
    try {
      setError(null);
      const result = await updateNote(note.id, { folder });
      applyUpdateResult(result);
      setMovingNote(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move note");
    }
  };

  const handleCreateFolder = (fullPath: string) => {
    setFolderDialog(null);
    setCreateFolder(fullPath);
    setIsCreateOpen(true);
  };

  const handleRenameFolder = async (to: string) => {
    if (!folderDialog || folderDialog.mode !== "rename") return;
    const from = folderDialog.folder;
    try {
      setError(null);
      await renameFolder(from, to);
      const data = await fetchNotes();
      setNotes(data);
      const resolved =
        distinctFolders(data.map((n) => n.folder)).find(
          (folder) => folder.toLowerCase() === to.toLowerCase()
        ) ?? to;
      setActiveView((view) => {
        if (view.type !== "folder" || view.folder == null) return view;
        if (!isFolderPrefix(from, view.folder)) return view;
        const rewritten = rewriteFolderPrefix(view.folder, from, resolved);
        return { type: "folder", folder: rewritten ?? resolved };
      });
      setFolderDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename folder");
    }
  };

  const handleMoveFolderToUnsorted = async () => {
    if (!folderDialog || folderDialog.mode !== "rename") return;
    const from = folderDialog.folder;
    const targets = notes.filter(
      (n) => n.folder != null && isFolderPrefix(from, n.folder)
    );
    try {
      setError(null);
      for (const note of targets) {
        const result = await updateNote(note.id, { folder: null });
        upsertNote(result.note);
      }
      setActiveView({ type: "folder", folder: null });
      setFolderDialog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move notes");
    }
  };

  const openCreate = (folder: string | null = null) => {
    setCreateFolder(folder);
    setIsCreateOpen(true);
  };

  const handleBackFromFolder = () => {
    if (activeView.type !== "folder" || activeView.folder == null) {
      setActiveView({ type: "all" });
      return;
    }
    const parent = folderParentPath(activeView.folder);
    if (parent) {
      setActiveView({ type: "folder", folder: parent });
    } else {
      setActiveView({ type: "all" });
    }
  };

  const pinnedNotes = useMemo(
    () => notes.filter((n) => n.pinned).sort(sortByPinnedAtDesc),
    [notes]
  );

  const allViewNotes = useMemo(() => {
    const pinnedIds = new Set(pinnedNotes.map((n) => n.id));
    const recent = notes
      .filter((n) => !pinnedIds.has(n.id))
      .sort(sortByUpdatedAtDesc)
      .slice(0, RECENT_LIMIT);
    return { pinned: pinnedNotes, recent };
  }, [notes, pinnedNotes]);

  const folderViewNotes = useMemo(() => {
    if (activeView.type !== "folder") return { pinned: [] as Note[], rest: [] as Note[] };
    const inFolder = notes.filter((n) =>
      activeView.folder === null ? n.folder == null : n.folder === activeView.folder
    );
    const pinned = inFolder.filter((n) => n.pinned).sort(sortByPinnedAtDesc);
    const pinnedIds = new Set(pinned.map((n) => n.id));
    const rest = inFolder.filter((n) => !pinnedIds.has(n.id)).sort(sortByUpdatedAtDesc);
    return { pinned, rest };
  }, [activeView, notes]);

  const folderTitle =
    activeView.type === "folder"
      ? activeView.folder == null
        ? UNSORTED_LABEL
        : folderLeafName(activeView.folder)
      : null;

  const activeFolderPath =
    activeView.type === "folder" && activeView.folder != null
      ? activeView.folder
      : null;

  const canCreateSubfolder =
    activeFolderPath != null && folderDepth(activeFolderPath) < MAX_FOLDER_DEPTH;

  const renderNoteList = (list: Note[]) =>
    list.map((note) => (
      <NoteCard
        key={note.id}
        note={note}
        onOpen={() => setEditingNote(note)}
        onPinToggle={() => handlePinToggle(note, !note.pinned)}
        onMove={() => setMovingNote(note)}
        onDelete={() => setDeletingNote(note)}
      />
    ));

  return (
    <div className="relative min-h-full flex-1 pb-24">
      <header className="px-5 pt-8 pb-2">
        <div className="flex w-full items-center gap-3 text-2xl">
          <h1
            className="shrink-0 font-bold uppercase tracking-wide leading-none"
            style={{
              fontFamily: "var(--font-bebas-neue), sans-serif", fontWeight: 400,
              color: colors.textPrimary,
            }}
          >
            Notes
          </h1>
          <HeaderAccentLines />
          <HeaderNavMenu />
        </div>
      </header>

      <main className="px-5">
        <FolderPillBar
          activeView={activeView}
          folders={topFolders}
          totalCount={notes.length}
          unsortedCount={unsortedCount}
          folderCounts={folderCounts}
          onSelectAll={() => setActiveView({ type: "all" })}
          onSelectUnsorted={() => setActiveView({ type: "folder", folder: null })}
          onSelectFolder={(folder) => setActiveView({ type: "folder", folder })}
          onCreateFolder={() => setFolderDialog({ mode: "create", parentPath: null })}
          onRenameFolder={(folder) => setFolderDialog({ mode: "rename", folder })}
        />

        {error && (
          <p
            className="hw-outline mb-4 rounded-2xl px-3 py-2 text-sm"
            style={{
              background: colors.shell,
              color: colors.pocketRed,
            }}
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Loading notes…
          </p>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              No notes yet. Create your first note to get started.
            </p>
            <button
              type="button"
              onClick={() => openCreate(null)}
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold uppercase tracking-wide"
              style={{ background: colors.pocketYellow, color: colors.textDark }}
            >
              New note
            </button>
          </div>
        ) : activeView.type === "all" ? (
          <div className="flex flex-col gap-6">
            {allViewNotes.pinned.length > 0 && (
              <section>
                <h2
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.textSecondary }}
                >
                  Pinned
                </h2>
                <div className="flex flex-col gap-3">
                  {renderNoteList(allViewNotes.pinned)}
                </div>
              </section>
            )}
            <section>
              <h2
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.textSecondary }}
              >
                Recent
              </h2>
              {allViewNotes.recent.length === 0 ? (
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  No other recent notes.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {renderNoteList(allViewNotes.recent)}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Back"
                onClick={handleBackFromFolder}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-opacity hover:opacity-80"
                style={{ background: colors.shell, color: colors.textPrimary }}
              >
                <NavArrowLeft width={20} height={20} strokeWidth={2} />
              </button>
              <h2
                className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-2xl uppercase leading-none tracking-wide"
                style={{
                  fontFamily: "var(--font-bebas-neue), sans-serif", fontWeight: 400,
                  color: colors.textPrimary,
                }}
              >
                {activeFolderPath != null
                  ? folderBreadcrumbs(activeFolderPath).map((crumb, index, crumbs) => {
                      const isLast = index === crumbs.length - 1;
                      return (
                        <span key={crumb.path} className="inline-flex min-w-0 items-center gap-1.5">
                          {index > 0 && (
                            <span style={{ color: colors.textSecondary }}>/</span>
                          )}
                          {isLast ? (
                            <span className="truncate">{crumb.label}</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveView({ type: "folder", folder: crumb.path })
                              }
                              className="truncate uppercase tracking-wide transition-opacity hover:opacity-80"
                              style={{
                                fontFamily: "var(--font-bebas-neue), sans-serif", fontWeight: 400,
                                color: colors.textSecondary,
                              }}
                            >
                              {crumb.label}
                            </button>
                          )}
                        </span>
                      );
                    })
                  : folderTitle}
              </h2>
            </div>

            {activeFolderPath != null && (
              <ChildFolderPills
                folders={childFolderList}
                folderCounts={folderCounts}
                onSelectFolder={(folder) => setActiveView({ type: "folder", folder })}
                onRenameFolder={(folder) => setFolderDialog({ mode: "rename", folder })}
              />
            )}

            {folderViewNotes.pinned.length === 0 &&
            folderViewNotes.rest.length === 0 ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  No notes in this folder yet.
                </p>
                <button
                  type="button"
                  onClick={() => openCreate(activeView.folder)}
                  className="rounded-2xl px-4 py-2.5 text-sm font-semibold uppercase tracking-wide"
                  style={{ background: colors.pocketYellow, color: colors.textDark }}
                >
                  New note
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {renderNoteList(folderViewNotes.pinned)}
                {renderNoteList(folderViewNotes.rest)}
              </div>
            )}
          </div>
        )}
      </main>

      <AddNoteButton
        onAddNote={() =>
          openCreate(activeView.type === "folder" ? activeView.folder : null)
        }
        onAddFolder={
          // Top-level folder from All/Unsorted; subfolder when inside a folder below max depth.
          activeView.type === "all" ||
          (activeView.type === "folder" && activeView.folder === null) ||
          canCreateSubfolder
            ? () =>
                setFolderDialog({
                  mode: "create",
                  parentPath: activeFolderPath,
                })
            : undefined
        }
      />

      <NoteModal
        mode="edit"
        note={editingNote ?? undefined}
        isOpen={editingNote !== null}
        folders={folders}
        onClose={() => setEditingNote(null)}
        onConfirm={handleConfirmEdit}
        onDelete={handleDeleteNote}
        onPinToggle={(pinned) => {
          if (editingNote) handlePinToggle(editingNote, pinned);
        }}
        onFolderChange={(folder) => {
          if (editingNote) handleMoveNote(editingNote, folder);
        }}
      />

      <NoteModal
        mode="create"
        isOpen={isCreateOpen}
        folders={folders}
        defaultFolder={createFolder}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateFolder(null);
        }}
        onConfirm={handleConfirmCreate}
      />

      <FolderNameDialog
        mode={folderDialog?.mode === "rename" ? "rename" : "create"}
        isOpen={folderDialog !== null}
        folderPath={folderDialog?.mode === "rename" ? folderDialog.folder : undefined}
        parentPath={
          folderDialog?.mode === "create" ? folderDialog.parentPath : null
        }
        initialName={
          folderDialog?.mode === "rename"
            ? folderLeafName(folderDialog.folder)
            : ""
        }
        existingFolders={folders}
        onClose={() => setFolderDialog(null)}
        onConfirm={(fullPath) => {
          if (folderDialog?.mode === "rename") handleRenameFolder(fullPath);
          else handleCreateFolder(fullPath);
        }}
        onMoveToUnsorted={
          folderDialog?.mode === "rename" ? handleMoveFolderToUnsorted : undefined
        }
      />

      <MoveToFolderDialog
        isOpen={movingNote !== null}
        currentFolder={movingNote?.folder ?? null}
        folders={folders}
        onClose={() => setMovingNote(null)}
        onSelect={(folder) => {
          if (movingNote) handleMoveNote(movingNote, folder);
        }}
      />

      {deletingNote && (
        <div
          className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center"
          onClick={() => setDeletingNote(null)}
        >
          <div className="absolute inset-0 bg-black/80" />
          <div
            className="relative z-10 w-full max-w-md p-6"
            style={{
              background: colors.modalSurface,
              border: `1px solid ${colors.border}`,
              borderRadius: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-5 text-center text-sm" style={{ color: colors.textSecondary }}>
              Delete &ldquo;{deletingNote.title}&rdquo;? This can&apos;t be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingNote(null)}
                className="hw-outline flex-1 rounded-2xl py-3 text-sm font-semibold"
                style={{ background: colors.shell, color: colors.textSecondary }}
              >
                Keep
              </button>
              <button
                type="button"
                onClick={() => handleDeleteNote(deletingNote.id)}
                className="hw-outline flex-1 rounded-2xl py-3 text-sm font-semibold"
                style={{ background: colors.pocketRed, color: colors.textDark }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <NotesToast message={toast} />
    </div>
  );
}
