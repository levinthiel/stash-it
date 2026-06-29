"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { HardwareCorner } from "@/components/HardwareCorner";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { colors } from "@/lib/colors";

const PIN_LENGTH = 4;
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const ledTiming = [
  { active: true, delay: "0s", duration: "2.2s" },
  { active: true, delay: "0.7s", duration: "1.4s" },
  { active: false, delay: "0.4s", duration: "6s" },
  { active: false, delay: "2.1s", duration: "7.5s" },
];

function PinDisplay({ filled }: { filled: number }) {
  return (
    <div
      className="flex justify-center gap-3"
      aria-label={`${filled} of ${PIN_LENGTH} digits entered`}
    >
      {Array.from({ length: PIN_LENGTH }, (_, i) => (
        <div
          key={i}
          className="hw-inset flex h-12 w-10 items-center justify-center rounded-lg"
        >
          <span
            className="block h-3 w-3 rounded-full transition-all duration-150"
            style={{
              background: i < filled ? colors.pocketTeal : "transparent",
              border: `2px solid ${i < filled ? colors.pocketTeal : colors.shell}`,
              transform: i < filled ? "scale(1)" : "scale(0.85)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface NumpadButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "digit" | "action";
  label: string;
}

function NumpadButton({
  children,
  onClick,
  disabled,
  variant = "digit",
  label,
}: NumpadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="hw-outline flex h-14 items-center justify-center rounded-xl text-lg font-bold transition-transform active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        background: variant === "action" ? colors.shell : colors.display,
        color: variant === "action" ? colors.textSecondary : colors.textPrimary,
        fontFamily: variant === "digit" ? "var(--font-geist-mono)" : undefined,
      }}
    >
      {children}
    </button>
  );
}

export function PinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPin = useCallback(
    async (value: string) => {
      if (value.length !== PIN_LENGTH || isSubmitting) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const response = await fetch("/api/auth/pin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: value }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? "Wrong PIN");
        }

        router.push("/");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wrong PIN");
        setPin("");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, router]
  );

  const appendDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH || isSubmitting) return;
    const next = pin + digit;
    setPin(next);
    setError(null);
    if (next.length === PIN_LENGTH) {
      void submitPin(next);
    }
  };

  const deleteDigit = () => {
    if (isSubmitting) return;
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-5 py-12">
      <div className="mb-8 flex w-full max-w-sm items-center gap-3 text-2xl">
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
      </div>

      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl"
        style={{
          background: colors.surface,
          border: `6px solid ${colors.pocketTeal}`,
        }}
      >
        <HardwareCorner accent={colors.pocketTeal} size={35} />

        <div className="relative p-6 pr-10 pt-4">
          <h2
            className="mb-2 text-lg font-bold uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            Enter PIN
          </h2>
          <p className="mb-5 text-sm" style={{ color: colors.textSecondary }}>
            Tap your 4-digit code
          </p>

          <div className="flex flex-col gap-5">
            <PinDisplay filled={pin.length} />

            {error && (
              <p
                className="hw-outline rounded-lg px-3 py-2 text-center text-sm"
                style={{
                  background: colors.shell,
                  color: colors.pocketRed,
                }}
              >
                {error}
              </p>
            )}

            {isSubmitting && (
              <p
                className="text-center text-sm"
                style={{ color: colors.textSecondary }}
              >
                Checking…
              </p>
            )}

            <div className="grid grid-cols-3 gap-2.5">
              {NUMPAD_KEYS.map((digit) => (
                <NumpadButton
                  key={digit}
                  label={`Digit ${digit}`}
                  onClick={() => appendDigit(digit)}
                  disabled={isSubmitting}
                >
                  {digit}
                </NumpadButton>
              ))}

              <NumpadButton
                label="Delete last digit"
                variant="action"
                onClick={deleteDigit}
                disabled={pin.length === 0 || isSubmitting}
              >
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Del
                </span>
              </NumpadButton>

              <NumpadButton
                label="Digit 0"
                onClick={() => appendDigit("0")}
                disabled={isSubmitting}
              >
                0
              </NumpadButton>

              <NumpadButton
                label="Unlock"
                variant="action"
                onClick={() => void submitPin(pin)}
                disabled={pin.length !== PIN_LENGTH || isSubmitting}
              >
                <span
                  className="text-sm font-semibold uppercase tracking-wide"
                  style={{ color: colors.pocketYellow }}
                >
                  Go
                </span>
              </NumpadButton>
            </div>

            <div className="grid grid-cols-4 gap-1 px-1">
              {ledTiming.map((led, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-full rounded-full ${led.active ? "server-led-active" : "server-led-idle"}`}
                  style={{
                    background: led.active ? colors.pocketTeal : colors.shell,
                    border: `1px solid ${colors.outline}`,
                    ["--led-delay" as string]: led.delay,
                    ["--led-duration" as string]: led.duration,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
