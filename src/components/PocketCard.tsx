"use client";

import { HardwareCorner } from "@/components/HardwareCorner";
import { getPocketColor, colors } from "@/lib/colors";
import { getPocketIcon } from "@/lib/icons";
import type { Pocket } from "@/types/pocket";

interface PocketCardProps {
  pocket: Pocket;
  onClick: () => void;
}

const ledTiming = [
  { active: true, delay: "0s", duration: "2.2s" },
  { active: true, delay: "0.7s", duration: "1.4s" },
  { active: true, delay: "1.3s", duration: "2.8s" },
  { active: false, delay: "0.4s", duration: "6s" },
  { active: false, delay: "2.1s", duration: "7.5s" },
  { active: false, delay: "1.8s", duration: "5.5s" },
  { active: false, delay: "3.2s", duration: "8s" },
  { active: false, delay: "0.9s", duration: "6.8s" },
];

function PadDots({ accent }: { accent: string }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {ledTiming.map((led, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${led.active ? "server-led-active" : "server-led-idle"}`}
          style={{
            background: led.active ? accent : colors.shell,
            border: `1px solid ${colors.outline}`,
            ["--led-delay" as string]: led.delay,
            ["--led-duration" as string]: led.duration,
          }}
        />
      ))}
    </div>
  );
}

export function PocketCard({ pocket, onClick }: PocketCardProps) {
  const color = getPocketColor(pocket.color);
  const { Icon } = getPocketIcon(pocket.icon);

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.97]"
      style={{
        background: colors.shell,
        border: `6px solid ${color.accent}`,
        borderRadius: 16,
      }}
    >
      <HardwareCorner accent={color.accent} icon={Icon} />

      <div className="flex flex-col p-3">
        <p
          className="truncate pr-9 text-xs font-semibold uppercase tracking-wide"
          style={{ color: colors.textDark }}
        >
          {pocket.name}
        </p>

        <div
          className="hw-inset mt-4 w-full rounded-md px-2 py-1.5"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        >
          <p
            className="text-base font-bold"
            style={{ color: colors.textPrimary, letterSpacing: "0.12em" }}
          >
            €{pocket.amount.toLocaleString()}
          </p>
        </div>

        <div className="mt-2.5">
          <PadDots accent={color.accent} />
        </div>
      </div>
    </button>
  );
}
