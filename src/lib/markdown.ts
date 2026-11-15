export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Auto-title from body: first non-empty line, strip markdown, clamp to 80. */
export function deriveNoteTitle(title: string, body: string): string {
  if (title.trim()) return title.trim();

  const firstLine = body.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const stripped = stripMarkdown(firstLine).trim().slice(0, 80);
  return stripped || "Untitled";
}
