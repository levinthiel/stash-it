export const UNSORTED_LABEL = "Unsorted";

/** Returns trimmed folder name, or null if invalid. */
export function validateFolderName(name: unknown): string | null {
  if (typeof name !== "string") return null;

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 30) return null;
  if (trimmed.includes("/") || trimmed.includes("\\")) return null;
  if (trimmed.toLowerCase() === UNSORTED_LABEL.toLowerCase()) return null;

  return trimmed;
}

export function foldersEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Case-insensitive distinct folder names, preferring first-seen casing. */
export function distinctFolders(folders: Array<string | null | undefined>): string[] {
  const seen = new Map<string, string>();
  for (const folder of folders) {
    if (folder == null || folder === "") continue;
    const key = folder.toLowerCase();
    if (!seen.has(key)) seen.set(key, folder);
  }
  return [...seen.values()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

export function findExistingFolderCasing(
  folders: Array<string | null | undefined>,
  candidate: string
): string | undefined {
  const key = candidate.toLowerCase();
  for (const folder of folders) {
    if (folder != null && folder.toLowerCase() === key) return folder;
  }
  return undefined;
}
