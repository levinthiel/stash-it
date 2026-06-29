"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AddGroceryButton } from "@/components/AddGroceryButton";
import { ClearCrossedButton } from "@/components/ClearCrossedButton";
import { GroceryItemRow } from "@/components/GroceryItemRow";
import { GroceryModal } from "@/components/GroceryModal";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { HeaderNavMenu } from "@/components/HeaderNavMenu";
import { colors } from "@/lib/colors";
import { GROCERY_STORES, type GroceryStore } from "@/lib/grocery-stores";
import {
  createGrocery,
  deleteGrocery,
  fetchGroceries,
  updateGrocery,
} from "@/lib/grocery-api";
import type { Grocery, GroceryInput } from "@/types/grocery";

const DELETE_DELAY_MS = 3000;

function sortByChecked(items: Grocery[]): Grocery[] {
  return [...items].sort((a, b) => Number(a.checked) - Number(b.checked));
}

interface GrocerySection {
  store: GroceryStore;
  items: Grocery[];
  leftCount: number;
}

function groupGroceries(items: Grocery[]): {
  uncategorized: Grocery[];
  sections: GrocerySection[];
} {
  const uncategorized = sortByChecked(items.filter((item) => item.store === null));

  const sections = GROCERY_STORES.flatMap((store) => {
    const storeItems = sortByChecked(items.filter((item) => item.store === store));
    if (storeItems.length === 0) return [];

    return [
      {
        store,
        items: storeItems,
        leftCount: storeItems.filter((item) => !item.checked).length,
      },
    ];
  });

  return { uncategorized, sections };
}

function GroceryStoreSectionHeader({ store, leftCount }: { store: GroceryStore; leftCount: number }) {
  return (
    <h2
      className="flex items-baseline gap-1.5 px-1 pt-4 pb-1 first:pt-0"
      style={{ fontFamily: "var(--font-orbitron), sans-serif" }}
    >
      <span
        className="text-sm font-bold uppercase tracking-wider"
        style={{ color: colors.textPrimary }}
      >
        {store}
      </span>
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: colors.textSecondary }}
      >
        · {leftCount} left
      </span>
    </h2>
  );
}

export function GroceryOverview() {
  const [groceries, setGroceries] = useState<Grocery[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grocery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(() => new Set());
  const [displayQuantities, setDisplayQuantities] = useState<Record<string, number>>({});

  const deleteTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const isModalOpen = isCreateOpen || editingItem !== null;

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

  const { uncategorized, sections } = useMemo(() => groupGroceries(groceries), [groceries]);
  const hasCrossedItems = useMemo(() => groceries.some((item) => item.checked), [groceries]);
  const hasItems = groceries.length > 0;

  const closeModal = () => {
    setIsCreateOpen(false);
    setEditingItem(null);
  };

  const handleToggle = (id: string, checked: boolean) => {
    const item = groceries.find((g) => g.id === id);
    if (!item) return;

    if (checked && pendingDeleteIds.has(id)) {
      cancelPendingDelete(id);
    }

    const previous = item.checked;

    setGroceries((prev) =>
      prev.map((g) => (g.id === id ? { ...g, checked } : g))
    );

    setError(null);
    updateGrocery(id, { checked })
      .then((updated) => {
        setGroceries((prev) => prev.map((g) => (g.id === id ? updated : g)));
      })
      .catch((err) => {
        setGroceries((prev) =>
          prev.map((g) => (g.id === id ? { ...g, checked: previous } : g))
        );
        setError(err instanceof Error ? err.message : "Failed to update item");
      });
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
      setGroceries((prev) => prev.map((g) => (g.id === id ? updated : g)));
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

  const handleConfirmModal = async (data: GroceryInput) => {
    try {
      setError(null);

      if (editingItem) {
        const updated = await updateGrocery(editingItem.id, {
          name: data.name,
          quantity: data.quantity,
          store: data.store ?? null,
        });
        setGroceries((prev) => prev.map((g) => (g.id === editingItem.id ? updated : g)));
        setEditingItem(null);
      } else {
        const created = await createGrocery(data);
        setGroceries((prev) => [...prev, created]);
        setIsCreateOpen(false);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingItem
            ? "Failed to update item"
            : "Failed to add item"
      );
    }
  };

  const renderItem = (item: Grocery) => (
    <GroceryItemRow
      key={item.id}
      item={item}
      displayQuantity={displayQuantities[item.id] ?? item.quantity}
      isPendingDelete={pendingDeleteIds.has(item.id)}
      onToggle={handleToggle}
      onQuantityChange={handleQuantityChange}
      onEdit={setEditingItem}
    />
  );

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
        ) : !hasItems ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No items yet. Tap + to add one.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {uncategorized.map(renderItem)}

            {sections.map(({ store, items, leftCount }) => (
              <div key={store}>
                <GroceryStoreSectionHeader store={store} leftCount={leftCount} />
                <div className="flex flex-col gap-3">{items.map(renderItem)}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {hasCrossedItems && <ClearCrossedButton onClick={handleDeleteAllCrossed} />}

      <AddGroceryButton onClick={() => setIsCreateOpen(true)} />

      <GroceryModal
        isOpen={isModalOpen}
        item={editingItem}
        onClose={closeModal}
        onConfirm={handleConfirmModal}
      />
    </div>
  );
}
