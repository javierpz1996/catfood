"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getOrCreateChatUsername } from "@/lib/chat-username";
import {
  cooldownMessage,
  getCooldownState,
  getPlateCleanRemainingMs,
  saveLastFeedTimestamp,
  saveLastPlateCleanTimestamp,
  type CooldownState,
} from "@/lib/feed-cooldown";
import {
  insertFeeding,
  insertPlateClean,
  listFeedings,
  upsertFeeding,
} from "@/lib/feedings";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FeedingRow } from "@/lib/supabase/database.types";

const SUCCESS_MS = 2800;

export type FeedCatState = {
  records: FeedingRow[];
  isLoading: boolean;
  isSaving: boolean;
  isCleaning: boolean;
  showSuccess: boolean;
  errorMessage: string | null;
  newestId: string | null;
  cooldown: CooldownState | null;
  isButtonDisabled: boolean;
  handleFeed: () => Promise<void>;
  handlePlateClean: () => Promise<void>;
  cooldownLabel: string | null;
};

export function useFeedCat(): FeedCatState {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [records, setRecords] = useState<FeedingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newestId, setNewestId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<CooldownState | null>(null);
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

  useEffect(() => {
    function tick() {
      setCooldown(getCooldownState());
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  async function handleFeed() {
    if (isSaving || isCleaning) return;
    if (getCooldownState().remainingMs > 0) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const next = await insertFeeding(supabase, getOrCreateChatUsername());
      saveLastFeedTimestamp();
      setCooldown(getCooldownState());
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

  async function handlePlateClean() {
    if (isSaving || isCleaning) return;
    if (getPlateCleanRemainingMs() > 0) return;

    setIsCleaning(true);
    setErrorMessage(null);

    try {
      const next = await insertPlateClean(supabase, getOrCreateChatUsername());
      saveLastPlateCleanTimestamp();
      setRecords((current) => upsertFeeding(current, next));
      setNewestId(next.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la limpieza.",
      );
    } finally {
      setIsCleaning(false);
    }
  }

  const isButtonDisabled =
    isSaving || isCleaning || cooldown === null || cooldown.remainingMs > 0;

  return {
    records,
    isLoading,
    isSaving,
    isCleaning,
    showSuccess,
    errorMessage,
    newestId,
    cooldown,
    isButtonDisabled,
    handleFeed,
    handlePlateClean,
    cooldownLabel:
      cooldown && cooldown.remainingMs > 0 ? cooldownMessage(cooldown) : null,
  };
}
