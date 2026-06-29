import { Home } from "iconoir-react";
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
  const iconSize = size * 0.42;
  const borderRadius = Math.max(4, Math.round(size * 0.14));

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius,
      }}
    >
      <div className="absolute inset-0 flex flex-col">
        {stripes.map((color, i) => (
          <div key={i} style={{ height: stripeHeight, background: color }} />
        ))}
      </div>
      <Home
        width={iconSize}
        height={iconSize}
        strokeWidth={2.75}
        color={colors.textPrimary}
        className="relative z-10"
      />
    </div>
  );
}
