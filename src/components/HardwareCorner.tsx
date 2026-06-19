import type { ComponentType, SVGProps } from "react";
import { colors } from "@/lib/colors";

interface HardwareCornerProps {
  accent: string;
  size?: number;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function HardwareCorner({ accent, size = 35, icon: Icon }: HardwareCornerProps) {
  const outerR = Math.round(size * (12 / 68));
  const scoopR = Math.round(size * (26 / 68));
  const iconSize = Math.round(size * (29 / 68));
  const iconCenterX = (size - outerR + scoopR) / 2;
  const iconCenterY = (outerR + size - scoopR) / 2;

  return (
    <div
      className="pointer-events-none absolute top-0 right-0 z-10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={`
            M ${size - outerR} 0
            A ${outerR} ${outerR} 0 0 1 ${size} ${outerR}
            L ${size} ${size}
            L ${scoopR} ${size}
            A ${scoopR} ${scoopR} 0 0 1 0 ${size - scoopR}
            L 0 0
            L ${size - outerR} 0
            Z
          `}
          fill={accent}
        />
      </svg>
      {Icon && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: iconCenterX,
            top: iconCenterY,
            transform: "translate(-50%, -50%)",
            color: colors.textPrimary,
          }}
        >
          <Icon width={iconSize} height={iconSize} strokeWidth={2} />
        </div>
      )}
    </div>
  );
}
