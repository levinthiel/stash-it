import { colors, pocketColorOptions } from "@/lib/colors";

const accentColors = pocketColorOptions.map((option) => option.accent);

export function HeaderAccentLines() {
  return (
    <div className="flex h-[1lh] min-w-0 flex-1 flex-col justify-between gap-0.5">
      {accentColors.map((color) => (
        <div
          key={color}
          className="min-h-0 w-full flex-1 rounded-sm"
          style={{
            background: color,
            border: `1px solid ${colors.outline}`,
          }}
        />
      ))}
    </div>
  );
}
