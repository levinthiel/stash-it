"use client";

import { useCallback, useEffect, useState } from "react";
import { AddPocketButton } from "@/components/AddPocketButton";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderExpensesMenu } from "@/components/HeaderExpensesMenu";
import { SpendingCard } from "@/components/SpendingCard";
import { SpendingModal } from "@/components/SpendingModal";
import { colors } from "@/lib/colors";
import {
  createSpending,
  deleteSpending,
  fetchSpendings,
  updateSpending,
} from "@/lib/spending-api";
import type { Spending } from "@/types/spending";

export function SpendingOverview() {
  const [spendings, setSpendings] = useState<Spending[]>([]);
  const [editingSpending, setEditingSpending] = useState<Spending | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSpendings = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchSpendings();
      setSpendings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load spendings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpendings();
  }, [loadSpendings]);

  const totalSpendings = spendings.reduce((sum, s) => sum + s.amount, 0);

  const handleConfirmEdit = async (data: Pick<Spending, "name" | "amount"> & { id?: string }) => {
    if (!data.id) return;

    try {
      setError(null);
      const updated = await updateSpending(data.id, {
        name: data.name,
        amount: data.amount,
      });
      setSpendings((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSpending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense");
    }
  };

  const handleDeleteSpending = async (id: string) => {
    try {
      setError(null);
      await deleteSpending(id);
      setSpendings((prev) => prev.filter((s) => s.id !== id));
      setEditingSpending(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  const handleConfirmCreate = async (data: Pick<Spending, "name" | "amount"> & { id?: string }) => {
    try {
      setError(null);
      const created = await createSpending({
        name: data.name,
        amount: data.amount,
      });
      setSpendings((prev) => [...prev, created]);
      setIsCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense");
    }
  };

  return (
    <div className="relative min-h-full flex-1 pb-24">
      <header className="px-5 pt-8 pb-6">
        <div className="flex w-full items-center gap-3 text-2xl">
          <h1
            className="shrink-0 font-bold uppercase tracking-wide leading-none"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: colors.textPrimary,
            }}
          >
            Spendings
          </h1>
          <HeaderAccentLines />
          <HeaderExpensesMenu />
        </div>

        <div
          className="mt-4 w-full rounded-xl px-4 py-2"
          style={{
            background: colors.shell,
            border: `6px solid ${colors.pocketTeal}`,
            borderRadius: 16,
          }}
        >
          <div className="flex w-full items-center justify-start gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.textSecondary }}
            >
              Total
            </span>
            <span
              className="ml-4 text-lg font-bold"
              style={{
                fontFamily: "var(--font-geist-mono)",
                color: colors.pocketTeal,
              }}
            >
              €{totalSpendings.toLocaleString()}
            </span>
          </div>
        </div>
      </header>

      <main className="px-5">
        {error && (
          <p
            className="hw-outline mb-4 rounded-lg px-3 py-2 text-sm"
            style={{
              background: colors.shell,
              color: colors.pocketRed,
            }}
          >
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Loading expenses…
          </p>
        ) : spendings.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No expenses yet. Tap + to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {spendings.map((spending) => (
              <SpendingCard
                key={spending.id}
                spending={spending}
                onClick={() => setEditingSpending(spending)}
              />
            ))}
          </div>
        )}
      </main>

      <AddPocketButton onClick={() => setIsCreateOpen(true)} ariaLabel="Add expense" />

      <SpendingModal
        mode="edit"
        spending={editingSpending ?? undefined}
        isOpen={editingSpending !== null}
        onClose={() => setEditingSpending(null)}
        onConfirm={handleConfirmEdit}
        onDelete={handleDeleteSpending}
      />

      <SpendingModal
        mode="create"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
