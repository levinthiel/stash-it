import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { FloppyDisk, Journal, ShoppingBag, Wallet } from "iconoir-react";
import { AppIcon } from "@/components/AppIcon";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { colors } from "@/lib/colors";

interface HomeApp {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  accent: string;
}

const homeApps: HomeApp[] = [
  { href: "/stash", label: "stash", Icon: FloppyDisk, accent: colors.pocketBlue },
  { href: "/grocery", label: "list", Icon: ShoppingBag, accent: colors.pocketGreen },
  { href: "/notes", label: "notes", Icon: Journal, accent: colors.pocketYellow },
  { href: "/spendings", label: "spend", Icon: Wallet, accent: colors.pocketTeal },
];

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

function PadDots({ accent, onAccent }: { accent: string; onAccent?: boolean }) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {ledTiming.map((led, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${led.active ? "server-led-active" : "server-led-idle"}`}
          style={{
            background: led.active
              ? onAccent
                ? colors.textPrimary
                : accent
              : onAccent
                ? "transparent"
                : colors.shell,
            border: `1px solid ${colors.outline}`,
            ["--led-delay" as string]: led.delay,
            ["--led-duration" as string]: led.duration,
          }}
        />
      ))}
    </div>
  );
}

export function HomeLauncher() {
  return (
    <div className="flex min-h-full flex-1 flex-col px-5 pb-12 pt-8">
      <header className="pb-6">
        <div className="flex w-full items-center gap-3 text-2xl">
          <h1
            className="shrink-0 font-bold uppercase tracking-wide leading-none"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            Homey
          </h1>
          <HeaderAccentLines />
          <AppIcon size={32} className="shrink-0" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-start">
        <div className="grid grid-cols-2 gap-4">
          {homeApps.map(({ href, label, Icon, accent }) => {
            const labelColor = accent === colors.pocketYellow ? colors.textDark : colors.textPrimary;

            return (
            <Link
              key={href}
              href={href}
              className="relative block aspect-square overflow-hidden text-left transition-transform active:scale-[0.97]"
              style={{
                background: accent,
                border: `6px solid ${accent}`,
                borderRadius: 16,
              }}
            >
              <div className="flex h-full flex-col p-3">
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-1">
                  <Icon
                    width={48}
                    height={48}
                    strokeWidth={2}
                    color={labelColor}
                  />
                  <p
                    className="text-center text-lg font-bold uppercase leading-none whitespace-nowrap"
                    style={{
                      fontFamily: "var(--font-orbitron), sans-serif",
                      color: labelColor,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </p>
                </div>

                <div className="mt-2.5">
                  <PadDots accent={accent} onAccent />
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
