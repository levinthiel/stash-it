"use client";

import { useCallback, useEffect, useState } from "react";
import { AddPocketButton } from "@/components/AddPocketButton";
import { HeaderAccentLines } from "@/components/HeaderAccentLines";
import { PocketCard } from "@/components/PocketCard";
import { PocketModal } from "@/components/PocketModal";
import { colors } from "@/lib/colors";
import {
  createPocket,
  deletePocket,
  fetchPockets,
  updatePocket,
} from "@/lib/pocket-api";
import type { Pocket } from "@/types/pocket";

export function PocketOverview() {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [editingPocket, setEditingPocket] = useState<Pocket | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPockets = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPockets();
      setPockets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pockets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPockets();
  }, [loadPockets]);

  const totalBalance = pockets.reduce((sum, p) => sum + p.amount, 0);

  const handleConfirmEdit = async (data: Omit<Pocket, "id"> & { id?: string }) => {
    if (!data.id) return;

    try {
      setError(null);
      const updated = await updatePocket(data.id, {
        name: data.name,
        amount: data.amount,
        color: data.color,
        icon: data.icon,
      });
      setPockets((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPocket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pocket");
    }
  };

  const handleDeletePocket = async (id: string) => {
    try {
      setError(null);
      await deletePocket(id);
      setPockets((prev) => prev.filter((p) => p.id !== id));
      setEditingPocket(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pocket");
    }
  };

  const handleConfirmCreate = async (data: Omit<Pocket, "id"> & { id?: string }) => {
    try {
      setError(null);
      const created = await createPocket({
        name: data.name,
        amount: data.amount,
        color: data.color,
        icon: data.icon,
      });
      setPockets((prev) => [...prev, created]);
      setIsCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create pocket");
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
            Stash-it
          </h1>
          <HeaderAccentLines />
        </div>

        <div
          className="mt-4 w-full rounded-xl px-4 py-2"
          style={{ background: colors.shell }}
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
                €{totalBalance.toLocaleString()}
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
            Loading pockets…
          </p>
        ) : pockets.length === 0 ? (
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            No pockets yet. Tap + to create one, or run{" "}
            <code className="text-xs">npm run seed</code> to add sample data.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pockets.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                onClick={() => setEditingPocket(pocket)}
              />
            ))}
          </div>
        )}
      </main>

      <AddPocketButton onClick={() => setIsCreateOpen(true)} />

      <PocketModal
        mode="edit"
        pocket={editingPocket ?? undefined}
        isOpen={editingPocket !== null}
        onClose={() => setEditingPocket(null)}
        onConfirm={handleConfirmEdit}
        onDelete={handleDeletePocket}
      />

      <PocketModal
        mode="create"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onConfirm={handleConfirmCreate}
      />
    </div>
  );
}
