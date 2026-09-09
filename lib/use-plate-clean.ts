"use client";

import { useEffect, useState } from "react";
import {
  getPlateCleanRemainingMs,
  plateCleanCooldownMessage,
  saveLastPlateCleanTimestamp,
} from "@/lib/feed-cooldown";

export function usePlateClean() {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    function tick() {
      setRemainingMs(getPlateCleanRemainingMs());
    }

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  function handleClean() {
    if (getPlateCleanRemainingMs() > 0) return;
    saveLastPlateCleanTimestamp();
    setRemainingMs(getPlateCleanRemainingMs());
  }

  const cooldownLabel =
    remainingMs !== null && remainingMs > 0
      ? plateCleanCooldownMessage(remainingMs)
      : null;

  return {
    remainingMs: remainingMs ?? 0,
    cooldownLabel,
    isReady: remainingMs !== null && remainingMs <= 0,
    handleClean,
  };
}
