"use client";

import { FeedButton } from "@/components/feed-button";
import { FeedHome } from "@/components/feed-home";
import { LiveChat } from "@/components/live-chat";
import { TwitchPlayer } from "@/components/twitch-player";
import { useFeedCat } from "@/lib/use-feed-cat";

export function FeedPage() {
  const feed = useFeedCat();

  return (
    <div className="flex h-dvh flex-1 flex-col overflow-hidden bg-[#0e0e10] text-[#efeff1]">
      <header className="flex h-12 shrink-0 items-center border-b border-[#2f2f35] bg-[#18181b] px-4">
        <span className="text-lg font-bold text-[#3b82f6]">MisCroquetitas</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <TwitchPlayer
          bar={
            <div className="flex flex-col gap-2">
              {feed.cooldownLabel ? (
                <p className="w-full rounded-md bg-[#eb0400] px-6 py-3 text-center text-sm font-semibold text-white">
                  ⏱️ {feed.cooldownLabel}
                </p>
              ) : (
                <FeedButton
                  disabled={feed.isButtonDisabled}
                  feeding={feed.isSaving}
                  onFeed={() => {
                    void feed.handleFeed();
                  }}
                />
              )}
              {feed.showSuccess ? (
                <p className="rounded-md bg-[#0e3e24] px-3 py-2 text-center text-sm font-medium text-[#7dffb3]">
                  Pedido enviado. Esperando que se dispense...
                </p>
              ) : null}
              {feed.errorMessage ? (
                <p
                  className="rounded-md bg-[#3d0f0f] px-3 py-2 text-center text-sm font-medium text-[#ff8280]"
                  role="alert"
                >
                  {feed.errorMessage}
                </p>
              ) : null}
            </div>
          }
        />
        <LiveChat />
      </div>

      <div className="max-h-[32vh] shrink-0 overflow-y-auto">
        <FeedHome
          records={feed.records}
          newestId={feed.newestId}
          isLoading={feed.isLoading}
        />
      </div>
    </div>
  );
}
