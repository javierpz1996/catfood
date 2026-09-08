"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FeedButton } from "@/components/feed-button";
import { FeedingHistory } from "@/components/feeding-history";
import { StatusIndicator } from "@/components/status-indicator";
import {
  insertFeeding,
  listFeedings,
  upsertFeeding,
} from "@/lib/feedings";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FeedingRow } from "@/lib/supabase/database.types";

const SUCCESS_MS = 2800;

export function FeedHome() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [records, setRecords] = useState<FeedingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const loadFeedings = useCallback(async () => {
    const next = await listFeedings(supabase);
    setRecords(next);
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await listFeedings(supabase);
        if (!cancelled) {
          setRecords(next);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el historial.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    const channel = supabase
      .channel("feedings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedings" },
        () => {
          void loadFeedings().catch((error: unknown) => {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el historial.",
            );
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [loadFeedings, supabase]);

  async function handleFeed() {
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const next = await insertFeeding(supabase);
      setRecords((current) => upsertFeeding(current, next));
      setNewestId(next.id);
      setShowSuccess(true);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setShowSuccess(false);
      }, SUCCESS_MS);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la alimentación.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <article className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_-24px_rgba(120,53,15,0.28)] backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-amber-100/80 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-orange-100/70 blur-2xl" />

        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700/80">
            Feed My Cat
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-[2.1rem]">
            🐱 Alimentá a mi gato
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Una porción con un toque. El comedero está listo cuando vos lo estés.
          </p>

          <div className="mt-5">
            <StatusIndicator />
          </div>

          <div className="mt-8">
            <FeedButton
              disabled={isSaving}
              feeding={isSaving}
              onFeed={() => {
                void handleFeed();
              }}
            />
          </div>

          <div
            className={`mt-4 overflow-hidden rounded-2xl bg-emerald-50 text-center text-sm font-medium text-emerald-800 ring-1 ring-emerald-100 transition-all duration-300 ${
              showSuccess
                ? "max-h-16 px-4 py-3 opacity-100"
                : "max-h-0 px-4 py-0 opacity-0"
            }`}
            aria-live="polite"
          >
            Pedido enviado. Esperando que se dispense...
          </div>

          {errorMessage ? (
            <p
              className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 ring-1 ring-red-100"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <FeedingHistory
            records={records}
            newestId={newestId}
            isLoading={isLoading}
          />
        </div>
      </article>
    </div>
  );
}
