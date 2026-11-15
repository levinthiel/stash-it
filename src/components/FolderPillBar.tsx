"use client";

import { useRef } from "react";
import { Plus } from "iconoir-react";
import { colors } from "@/lib/colors";
import { UNSORTED_LABEL } from "@/lib/folders";

export type NotesActiveView =
  | { type: "all" }
  | { type: "folder"; folder: string | null };

interface FolderPillBarProps {
  activeView: NotesActiveView;
  folders: string[];
  totalCount: number;
  unsortedCount: number;
  folderCounts: Record<string, number>;
  onSelectAll: () => void;
  onSelectUnsorted: () => void;
  onSelectFolder: (folder: string) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: string) => void;
}

const LONG_PRESS_MS = 500;

export function FolderPillBar({
  activeView,
  folders,
  totalCount,
  unsortedCount,
  folderCounts,
  onSelectAll,
  onSelectUnsorted,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
}: FolderPillBarProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired = useRef(false);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = (folder: string) => {
    longPressFired.current = false;
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onRenameFolder(folder);
    }, LONG_PRESS_MS);
  };

  const pillBase =
    "shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition-opacity active:opacity-80";

  const isAll = activeView.type === "all";
  const isUnsorted = activeView.type === "folder" && activeView.folder === null;

  return (
    <div
      className="sticky top-0 z-20 -mx-5 mb-4 border-b px-5 py-3"
      style={{
        background: colors.background,
        borderColor: colors.panelLine,
      }}
    >
      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          aria-pressed={isAll}
          className={pillBase}
          style={{
            background: isAll ? colors.neonBlue : colors.shell,
            color: isAll ? colors.textDark : colors.textPrimary,
          }}
          onClick={onSelectAll}
        >
          All{" "}
          <span style={{ color: isAll ? colors.textDark : colors.textSecondary, opacity: 0.8 }}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          aria-pressed={isUnsorted}
          className={pillBase}
          style={{
            background: isUnsorted ? colors.neonBlue : colors.shell,
            color: isUnsorted ? colors.textDark : colors.textPrimary,
          }}
          onClick={onSelectUnsorted}
        >
          {UNSORTED_LABEL}{" "}
          <span
            style={{ color: isUnsorted ? colors.textDark : colors.textSecondary, opacity: 0.8 }}
          >
            {unsortedCount}
          </span>
        </button>

        {folders.map((folder) => {
          const active = activeView.type === "folder" && activeView.folder === folder;
          const count = folderCounts[folder] ?? 0;
          return (
            <button
              key={folder}
              type="button"
              aria-pressed={active}
              className={pillBase}
              style={{
                background: active ? colors.neonBlue : colors.shell,
                color: active ? colors.textDark : colors.textPrimary,
              }}
              onClick={() => {
                if (longPressFired.current) {
                  longPressFired.current = false;
                  return;
                }
                onSelectFolder(folder);
              }}
              onPointerDown={() => startLongPress(folder)}
              onPointerUp={clearLongPress}
              onPointerLeave={clearLongPress}
              onPointerCancel={clearLongPress}
              onContextMenu={(e) => {
                e.preventDefault();
                clearLongPress();
                onRenameFolder(folder);
              }}
            >
              {folder}{" "}
              <span
                style={{ color: active ? colors.textDark : colors.textSecondary, opacity: 0.8 }}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          aria-label="Create folder"
          className={`${pillBase} flex items-center justify-center px-2.5`}
          style={{
            background: colors.shell,
            color: colors.textPrimary,
          }}
          onClick={onCreateFolder}
        >
          <Plus width={16} height={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
