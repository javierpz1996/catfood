"use client";

import { useEffect, useState, type ReactNode } from "react";

const CHANNEL = "sery_bot";

type TwitchPlayerProps = {
  bar: ReactNode;
};

export function TwitchPlayer({ bar }: TwitchPlayerProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const parents = new Set(["localhost", window.location.hostname]);
    const parentQuery = [...parents]
      .map((host) => `parent=${encodeURIComponent(host)}`)
      .join("&");

    setSrc(
      `https://player.twitch.tv/?channel=${CHANNEL}&${parentQuery}&autoplay=true&muted=true`,
    );
  }, []);

  return (
    <div className="relative flex min-h-[240px] flex-1 flex-col bg-black lg:min-h-0">
      <div className="relative w-full flex-1 bg-black">
        {src ? (
          <iframe
            src={src}
            title="Twitch sery_bot"
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 bg-black" />
        )}
      </div>
      <div className="border-t border-[#2f2f35] bg-[#18181b] px-3 py-3">{bar}</div>
    </div>
  );
}
