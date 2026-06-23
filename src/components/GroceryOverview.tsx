"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddGroceryButton } from "@/components/AddGroceryButton";
import { ClearCrossedButton } from "@/components/ClearCrossedButton";
import { GroceryItemRow } from "@/components/GroceryItemRow";
import { GroceryModal } from "@/components/GroceryModal";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderNavMenu } from "@/components/HeaderNavMenu";
import { colors } from "@/lib/colors";
import {
  createGrocery,
  deleteGrocery,
  fetchGroceries,
  updateGrocery,
} from "@/lib/grocery-api";
import type { Grocery } from "@/types/grocery";

const DELETE_DELAY_MS = 3000;

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
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(() => new Set());
  const [displayQuantities, setDisplayQuantities] = useState<Record<string, number>>({});

  const deleteTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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

  const cancelPendingDelete = useCallback((id: string) => {
    const timer = deleteTimersRef.current.get(id);
    if (timer) clearTimeout(timer);
    deleteTimersRef.current.delete(id);

    setPendingDeleteIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setDisplayQuantities((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const schedulePendingDelete = useCallback(
    (id: string) => {
      cancelPendingDelete(id);

      setDisplayQuantities((prev) => ({ ...prev, [id]: 0 }));
      setPendingDeleteIds((prev) => new Set(prev).add(id));

      const timer = setTimeout(() => {
        deleteTimersRef.current.delete(id);
        setPendingDeleteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setDisplayQuantities((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        deleteGrocery(id)
          .then(() => {
            setGroceries((prev) => prev.filter((item) => item.id !== id));
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to delete item");
          });
      }, DELETE_DELAY_MS);

      deleteTimersRef.current.set(id, timer);
    },
    [cancelPendingDelete]
  );

  useEffect(() => {
    const timers = deleteTimersRef.current;
    return () => {
      for (const [id, timer] of timers) {
        clearTimeout(timer);
        deleteGrocery(id).catch(() => {});
      }
      timers.clear();
    };
  }, []);

  const sortedGroceries = useMemo(() => sortGroceries(groceries), [groceries]);
  const hasCrossedItems = useMemo(() => groceries.some((item) => item.checked), [groceries]);

  const handleToggle = async (id: string, checked: boolean) => {
    const item = groceries.find((g) => g.id === id);
    if (!item) return;

    if (checked && pendingDeleteIds.has(id)) {
      cancelPendingDelete(id);
    }

    try {
      setError(null);
      const updated = await updateGrocery(id, { checked });
      setGroceries((prev) => sortGroceries(prev.map((g) => (g.id === id ? updated : g))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleQuantityChange = async (id: string, quantity: number) => {
    const item = groceries.find((g) => g.id === id);
    if (!item || item.checked) return;

    if (pendingDeleteIds.has(id)) {
      if (quantity >= 1) {
        cancelPendingDelete(id);
      }
      return;
    }

    if (quantity === 0) {
      schedulePendingDelete(id);
      return;
    }

    if (quantity < 1) return;

    try {
      setError(null);
      const updated = await updateGrocery(id, { quantity });
      setGroceries((prev) => sortGroceries(prev.map((g) => (g.id === id ? updated : g))));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const handleDeleteAllCrossed = async () => {
    const crossedIds = groceries.filter((item) => item.checked).map((item) => item.id);
    if (crossedIds.length === 0) return;

    crossedIds.forEach((id) => cancelPendingDelete(id));

    try {
      setError(null);
      await Promise.all(crossedIds.map((id) => deleteGrocery(id)));
      setGroceries((prev) => prev.filter((item) => !item.checked));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete crossed items");
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
          <HeaderNavMenu />
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
                displayQuantity={displayQuantities[item.id] ?? item.quantity}
                isPendingDelete={pendingDeleteIds.has(item.id)}
                onToggle={handleToggle}
                onQuantityChange={handleQuantityChange}
              />
            ))}
          </div>
        )}
      </main>

      {hasCrossedItems && <ClearCrossedButton onClick={handleDeleteAllCrossed} />}

      <AddGroceryButton onClick={() => setIsCreateOpen(true)} />

      <GroceryModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
