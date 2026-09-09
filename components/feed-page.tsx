"use client";

import { useState } from "react";
import Image from "next/image";
import { FeedButton, PlateCleanButton } from "@/components/feed-button";
import { FeedHome } from "@/components/feed-home";
import { LiveChat } from "@/components/live-chat";
import { TwitchPlayer } from "@/components/twitch-player";
import { useFeedCat, type FeedCatState } from "@/lib/use-feed-cat";
import { usePlateClean } from "@/lib/use-plate-clean";

export function FeedPage() {
  const feed: FeedCatState = useFeedCat();
  const plate = usePlateClean();
  const [isLive, setIsLive] = useState(false);

  return (
    <div className="flex h-dvh flex-1 flex-col overflow-hidden bg-[#0e0e10] text-[#efeff1]">
      <header className="flex h-[4.5rem] shrink-0 items-center border-b border-[#2f2f35] bg-black px-4">
        <Image
          src="/images/logo1.png"
          alt="MisCroquetitas"
          width={240}
          height={60}
          className="h-14 w-auto object-contain"
          priority
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <TwitchPlayer
          onLiveChange={setIsLive}
          bar={
            <div className="flex flex-col gap-2">
              <div className="flex items-stretch gap-2">
                <div className="w-[30%] min-w-0">
                  {!isLive ? (
                    <PlateCleanButton
                      disabled
                      unavailable
                      onClean={() => undefined}
                    />
                  ) : plate.cooldownLabel ? (
                    <p className="flex h-12 w-full items-center justify-center rounded-md bg-[#eb0400] px-1 text-center text-[11px] font-semibold leading-tight text-white sm:text-xs">
                      ⏱️ {plate.cooldownLabel}
                    </p>
                  ) : (
                    <PlateCleanButton
                      disabled={!plate.isReady || feed.isCleaning || feed.isSaving}
                      onClean={() => {
                        void feed.handlePlateClean();
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {!isLive ? (
                    <FeedButton
                      disabled
                      unavailable
                      feeding={false}
                      onFeed={() => undefined}
                    />
                  ) : feed.cooldownLabel ? (
                    <p className="flex h-12 w-full items-center justify-center rounded-md bg-[#eb0400] px-6 text-center text-sm font-semibold text-white">
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
                </div>
              </div>
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
