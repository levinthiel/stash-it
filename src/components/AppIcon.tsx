import { colors } from "@/lib/colors";

const stripes = [
  colors.pocketBlue,
  colors.pocketTeal,
  colors.pocketGreen,
  colors.pocketYellow,
  colors.pocketRed,
];

interface AppIconProps {
  size?: number;
  className?: string;
}

export function AppIcon({ size = 64, className = "" }: AppIconProps) {
  const stripeHeight = size / stripes.length;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}
      style={{
        width: size,
        height: size,
        background: colors.shell,
        border: `3px solid ${colors.outline}`,
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        {stripes.map((color, i) => (
          <div key={i} style={{ height: stripeHeight, background: color }} />
        ))}
      </div>
      <span
        className="relative z-10 font-bold tracking-wider"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          fontSize: size * 0.22,
          color: colors.textPrimary,
        }}
      >
        Stash
      </span>
    </div>
  );
}
