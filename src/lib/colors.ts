export const colors = {
  background: "#0C0D11",
  surface: "#24272F",
  shell: "#565F68",
  display: "#24272F",
  outline: "#0C0D11",
  panelLine: "#565F68",

  pocketBlue: "#4D7FD6",
  pocketTeal: "#51B5EE",
  pocketRed: "#D75559",
  pocketYellow: "#F9C646",
  pocketGreen: "#32C3A2",
  pocketOrange: "#F9C646",
  pocketPurple: "#4D7FD6",

  accent: "#F9C646",
  accentAlt: "#51B5EE",

  textPrimary: "#FFFFFF",
  textSecondary: "#9A9DA2",
  textDark: "#0C0D11",

  border: "#0C0D11",

  neonPink: "#FF3CAC",
  neonBlue: "#51B5EE",
  modalSurface: "#1A1A2E",
  modalInput: "#2A2A4A",
} as const;

export type PocketColorKey = keyof Pick<
  typeof colors,
  | "pocketBlue"
  | "pocketTeal"
  | "pocketRed"
  | "pocketYellow"
  | "pocketGreen"
  | "pocketOrange"
  | "pocketPurple"
>;

export const pocketColorOptions: {
  key: PocketColorKey;
  label: string;
  accent: string;
  strip: string;
}[] = [
  { key: "pocketBlue", label: "Blue", accent: colors.pocketBlue, strip: "#3D6BB8" },
  { key: "pocketTeal", label: "Sky Blue", accent: colors.pocketTeal, strip: "#3A9AD4" },
  { key: "pocketGreen", label: "Green", accent: colors.pocketGreen, strip: "#28A88A" },
  { key: "pocketYellow", label: "Yellow", accent: colors.pocketYellow, strip: "#D4A838" },
  { key: "pocketRed", label: "Red", accent: colors.pocketRed, strip: "#B8484C" },
];

export const validPocketColorKeys = new Set<PocketColorKey>([
  ...pocketColorOptions.map((c) => c.key),
  "pocketOrange",
  "pocketPurple",
]);

const legacyColorMap: Partial<Record<PocketColorKey, PocketColorKey>> = {
  pocketOrange: "pocketYellow",
  pocketPurple: "pocketBlue",
};

export function getPocketColor(key: PocketColorKey) {
  const resolved = legacyColorMap[key] ?? key;
  return pocketColorOptions.find((c) => c.key === resolved) ?? pocketColorOptions[0];
}
