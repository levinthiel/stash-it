import Link from "next/link";
import { colors } from "@/lib/colors";

interface HeaderNavBoxProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

export function HeaderNavBox({ href, label, children }: HeaderNavBoxProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-[1lh] w-[1lh] shrink-0 items-center justify-center rounded-sm transition-opacity hover:opacity-80 active:scale-95"
      style={{
        background: colors.shell,
        border: `1px solid ${colors.outline}`,
      }}
    >
      {children}
    </Link>
  );
}
