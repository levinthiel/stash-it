"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavArrowDown } from "iconoir-react";
import { colors } from "@/lib/colors";

const menuItems = [
  { href: "/", label: "Homey" },
  { href: "/stash", label: "Stash-it" },
  { href: "/grocery", label: "Grocer-it" },
  { href: "/notes", label: "Note-it" },
  { href: "/spendings", label: "Spend-it" },
] as const;

export function HeaderNavMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[1lh] w-[1lh] items-center justify-center rounded-sm transition-opacity hover:opacity-80 active:scale-95"
        style={{
          background: colors.shell,
          border: `1px solid ${colors.outline}`,
        }}
      >
        <NavArrowDown
          width={18}
          height={18}
          strokeWidth={2}
          color={colors.textPrimary}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+6px)] right-0 z-50 min-w-[10rem] overflow-hidden rounded-lg py-1"
          style={{
            background: colors.modalSurface,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 8px 24px ${colors.background}99`,
          }}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-opacity hover:opacity-80"
                style={{
                  color: isActive ? colors.neonBlue : colors.textPrimary,
                  background: isActive ? `${colors.neonBlue}22` : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
