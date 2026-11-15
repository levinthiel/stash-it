"use client";

import { colors } from "@/lib/colors";

interface NotesToastProps {
  message: string | null;
}

export function NotesToast({ message }: NotesToastProps) {
  if (!message) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-5"
      role="status"
      aria-live="polite"
    >
      <p
        className="max-w-sm rounded-lg px-4 py-2.5 text-center text-sm shadow-lg"
        style={{
          background: colors.modalSurface,
          color: colors.textPrimary,
          border: `1px solid ${colors.panelLine}`,
        }}
      >
        {message}
      </p>
    </div>
  );
}
