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

const titleFont = {
  fontFamily: "var(--font-bebas-neue), sans-serif",
  fontWeight: 400,
} as const;

export function HomeLauncher() {
  return (
    <div className="flex min-h-full flex-1 flex-col px-5 pb-12 pt-8">
      <header className="pb-6">
        <div className="flex w-full items-center gap-3 text-2xl">
          <h1
            className="shrink-0 text-[2rem] uppercase leading-none tracking-wide"
            style={{
              ...titleFont,
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
                className="flex aspect-square items-center justify-center text-center transition-transform active:scale-[0.97]"
                style={{
                  background: accent,
                  borderRadius: 28,
                }}
              >
                <span className="flex flex-col items-center justify-center gap-3 px-3">
                  <Icon width={48} height={48} strokeWidth={2} color={labelColor} />
                  <span
                    className="text-center text-[1.65rem] uppercase leading-none whitespace-nowrap"
                    style={{
                      ...titleFont,
                      color: labelColor,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
