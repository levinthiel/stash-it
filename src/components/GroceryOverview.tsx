"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AddGroceryButton } from "@/components/AddGroceryButton";
import { GroceryItemRow } from "@/components/GroceryItemRow";
import { GroceryModal } from "@/components/GroceryModal";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderExpensesMenu } from "@/components/HeaderExpensesMenu";
import { colors } from "@/lib/colors";
import { createGrocery, fetchGroceries, updateGrocery } from "@/lib/grocery-api";
import type { Grocery } from "@/types/grocery";

function sortGroceries(items: Grocery[]): Grocery[] {
  return [...items].sort((a, b) => {
    if (a.checked !== b.checked) return Number(a.checked) - Number(b.checked);
    return a.name.localeCompare(b.name);
  });
}

export function GroceryOverview() {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGroceries = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchGroceries();
      setGroceries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load grocery list");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroceries();
  }, [loadGroceries]);

  const sortedGroceries = useMemo(() => sortGroceries(groceries), [groceries]);

  const handleToggle = async (id: string, checked: boolean) => {
    try {
      setError(null);
      const updated = await updateGrocery(id, { checked });
      setGroceries((prev) => sortGroceries(prev.map((item) => (item.id === id ? updated : item))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setError(null);
      const updated = await updateGrocery(id, { quantity });
      setGroceries((prev) => sortGroceries(prev.map((item) => (item.id === id ? updated : item))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const handleConfirmCreate = async (data: { name: string; quantity: number }) => {
    try {
      setError(null);
      const created = await createGrocery(data);
      setGroceries((prev) => sortGroceries([...prev, created]));
      setIsCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
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
            Grocery
          </h1>
          <HeaderAccentLines />
          <HeaderExpensesMenu />
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
            Loading grocery list…
          </p>
        ) : sortedGroceries.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No items yet. Tap + to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedGroceries.map((item) => (
              <GroceryItemRow
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        )}
      </main>

      <AddGroceryButton onClick={() => setIsCreateOpen(true)} />

      <GroceryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
