"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const CHANNEL = "sery_bot";
const EMBED_SCRIPT = "https://player.twitch.tv/js/embed/v1.js";

type TwitchPlayerInstance = {
  addEventListener: (event: string, callback: () => void) => void;
};

type TwitchPlayerConstructor = {
  new (
    elementId: string,
    options: {
      channel: string;
      width: string;
      height: string;
      parent: string[];
      muted: boolean;
      autoplay: boolean;
    },
  ): TwitchPlayerInstance;
  ONLINE: string;
  OFFLINE: string;
};

declare global {
  interface Window {
    Twitch?: {
      Player: TwitchPlayerConstructor;
    };
  }
}

type TwitchPlayerProps = {
  bar: ReactNode;
};

function loadTwitchEmbedScript() {
  if (window.Twitch?.Player) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    'script[data-twitch-embed="true"]',
  );

  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(), { once: true });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = EMBED_SCRIPT;
    script.async = true;
    script.dataset.twitchEmbed = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(), { once: true });
    document.body.appendChild(script);
  });
}

export function TwitchPlayer({ bar }: TwitchPlayerProps) {
  const embedId = "miscroquetitas-twitch-player";
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      try {
        await loadTwitchEmbedScript();
        if (cancelled || !window.Twitch?.Player || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";
        const parents = Array.from(
          new Set(["localhost", window.location.hostname]),
        );

        const player = new window.Twitch.Player(embedId, {
          channel: CHANNEL,
          width: "100%",
          height: "100%",
          parent: parents,
          muted: true,
          autoplay: true,
        });

        player.addEventListener(window.Twitch.Player.ONLINE, () => {
          if (!cancelled) setIsLive(true);
        });
        player.addEventListener(window.Twitch.Player.OFFLINE, () => {
          if (!cancelled) setIsLive(false);
        });
      } catch {
        if (!cancelled) setIsLive(false);
      }
    }

    void setup();

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="relative flex min-h-[240px] flex-1 flex-col bg-black lg:min-h-0">
      <div className="relative w-full flex-1 overflow-hidden bg-[#e8dcc8]">
        <div
          id={embedId}
          ref={containerRef}
          className={`absolute inset-0 ${isLive ? "z-10" : "pointer-events-none invisible z-0"}`}
        />
        <Image
          src="/images/offline.png"
          alt="El stream está offline"
          fill
          sizes="100vw"
          className={`object-cover ${isLive ? "invisible" : "visible"}`}
          priority
        />
      </div>
      <div className="border-t border-[#2f2f35] bg-[#18181b] px-3 py-3">{bar}</div>
    </div>
  );
}
