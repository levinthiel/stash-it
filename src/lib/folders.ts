export const UNSORTED_LABEL = "Unsorted";
export const FOLDER_SEP = "/";
export const MAX_FOLDER_DEPTH = 3;
export const MAX_FOLDER_SEGMENT_LENGTH = 30;

/** Returns trimmed segment name, or null if invalid. */
export function validateFolderSegment(name: unknown): string | null {
  if (typeof name !== "string") return null;

  const trimmed = name.trim();
  if (!trimmed || trimmed.length > MAX_FOLDER_SEGMENT_LENGTH) return null;
  if (trimmed.includes(FOLDER_SEP) || trimmed.includes("\\")) return null;
  if (trimmed.toLowerCase() === UNSORTED_LABEL.toLowerCase()) return null;

  return trimmed;
}

/** Returns normalized folder path, or null if invalid. */
export function validateFolderPath(path: unknown): string | null {
  if (typeof path !== "string") return null;

  const trimmed = path.trim();
  if (!trimmed || trimmed.includes("\\")) return null;

  const segments = trimmed.split(FOLDER_SEP);
  if (segments.length === 0 || segments.length > MAX_FOLDER_DEPTH) return null;

  const validated: string[] = [];
  for (const segment of segments) {
    const ok = validateFolderSegment(segment);
    if (!ok) return null;
    validated.push(ok);
  }

  return validated.join(FOLDER_SEP);
}

/** @deprecated Prefer validateFolderPath / validateFolderSegment. */
export function validateFolderName(name: unknown): string | null {
  return validateFolderPath(name);
}

export function foldersEqual(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function folderLeafName(path: string): string {
  const segments = path.split(FOLDER_SEP);
  return segments[segments.length - 1] ?? path;
}

/** Ancestor + current path crumbs for breadcrumb UI. */
export function folderBreadcrumbs(
  path: string
): Array<{ path: string; label: string }> {
  const segments = path.split(FOLDER_SEP);
  const crumbs: Array<{ path: string; label: string }> = [];
  let built = "";
  for (const segment of segments) {
    built = built ? `${built}${FOLDER_SEP}${segment}` : segment;
    crumbs.push({ path: built, label: segment });
  }
  return crumbs;
}

export function folderParentPath(path: string): string | null {
  const idx = path.lastIndexOf(FOLDER_SEP);
  if (idx <= 0) return null;
  return path.slice(0, idx);
}

export function folderDepth(path: string): number {
  return path.split(FOLDER_SEP).length;
}

/** True if `path` is `from` or a descendant of `from`. */
export function isFolderPrefix(from: string, path: string): boolean {
  if (foldersEqual(from, path)) return true;
  const prefix = from.toLowerCase() + FOLDER_SEP;
  return path.toLowerCase().startsWith(prefix);
}

/** Rewrite `from` → `to` for an exact match or descendant path. */
export function rewriteFolderPrefix(
  path: string,
  from: string,
  to: string
): string | null {
  if (foldersEqual(path, from)) return to;
  const fromLower = from.toLowerCase();
  const pathLower = path.toLowerCase();
  const prefix = fromLower + FOLDER_SEP;
  if (!pathLower.startsWith(prefix)) return null;
  return to + path.slice(from.length);
}

export function joinFolderPath(parent: string | null, segment: string): string {
  return parent ? `${parent}${FOLDER_SEP}${segment}` : segment;
}

/** Expand nested paths so ancestors appear even with zero direct notes. */
export function expandFolderPaths(paths: string[]): string[] {
  const seen = new Map<string, string>();

  for (const path of paths) {
    const segments = path.split(FOLDER_SEP);
    let built = "";
    for (const segment of segments) {
      built = built ? `${built}${FOLDER_SEP}${segment}` : segment;
      const key = built.toLowerCase();
      if (!seen.has(key)) seen.set(key, built);
    }
  }

  return [...seen.values()].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

/** Case-insensitive distinct folder paths, including ancestors. */
export function distinctFolders(folders: Array<string | null | undefined>): string[] {
  const seen = new Map<string, string>();
  for (const folder of folders) {
    if (folder == null || folder === "") continue;
    const key = folder.toLowerCase();
    if (!seen.has(key)) seen.set(key, folder);
  }
  return expandFolderPaths([...seen.values()]);
}

export function topLevelFolders(paths: string[]): string[] {
  return paths
    .filter((path) => !path.includes(FOLDER_SEP))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Direct children of `parent` (null = top-level). */
export function childFolders(paths: string[], parent: string | null): string[] {
  const seen = new Map<string, string>();

  for (const path of paths) {
    if (parent === null) {
      if (!path.includes(FOLDER_SEP)) {
        const key = path.toLowerCase();
        if (!seen.has(key)) seen.set(key, path);
      }
      continue;
    }

    if (!path.toLowerCase().startsWith(parent.toLowerCase() + FOLDER_SEP)) continue;
    const rest = path.slice(parent.length + 1);
    if (!rest) continue;
    const childSegment = rest.split(FOLDER_SEP)[0];
    const childPath = `${path.slice(0, parent.length)}${FOLDER_SEP}${childSegment}`;
    const key = childPath.toLowerCase();
    if (!seen.has(key)) seen.set(key, childPath);
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
