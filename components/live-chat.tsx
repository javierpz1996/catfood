"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getOrCreateChatUsername, saveChatUsername } from "@/lib/chat-username";
import {
  insertMessage,
  listMessages,
  upsertMessage,
} from "@/lib/messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MessageRow } from "@/lib/supabase/database.types";

const MAX_MESSAGE_LENGTH = 300;

function formatMessageTime(value: string) {
  const date = new Date(value);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function LiveChat() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const listRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState("");
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nickDraft, setNickDraft] = useState("");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getOrCreateChatUsername());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await listMessages(supabase);
        if (!cancelled) {
          setMessages(next);
          setErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el chat.",
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
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as MessageRow;
          if (!row.id) return;
          setMessages((current) => upsertMessage(current, row));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isSending || !username) return;

    setIsSending(true);
    setErrorMessage(null);

    try {
      const next = await insertMessage(supabase, {
        name: username,
        message: text.slice(0, MAX_MESSAGE_LENGTH),
      });
      setMessages((current) => upsertMessage(current, next));
      setDraft("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo enviar el mensaje.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleSaveNick(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const next = saveChatUsername(nickDraft.slice(0, 24));
      setUsername(next);
      setIsEditingNick(false);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo cambiar el nick.",
      );
    }
  }

  return (
    <section className="flex h-[52vh] min-h-[320px] w-full flex-col border-t border-[#2f2f35] bg-[#18181b] lg:h-auto lg:min-h-0 lg:w-[28rem] xl:w-[32rem] lg:border-l lg:border-t-0">
      <div className="flex items-center justify-between gap-2 border-b border-[#2f2f35] px-3 py-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#efeff1]">
          CHAT
        </h2>
        {isEditingNick ? (
          <form className="flex min-w-0 items-center gap-1" onSubmit={handleSaveNick}>
            <input
              type="text"
              value={nickDraft}
              maxLength={24}
              onChange={(event) => setNickDraft(event.target.value)}
              className="w-28 rounded-md border border-[#2f2f35] bg-[#1f1f23] px-2 py-1 text-xs text-[#efeff1] outline-none focus:border-[#3b82f6]"
              autoFocus
            />
            <button
              type="submit"
              className="text-xs font-semibold text-[#60a5fa] hover:underline"
            >
              Guardar
            </button>
            <button
              type="button"
              className="text-xs text-[#adadb8] hover:underline"
              onClick={() => setIsEditingNick(false)}
            >
              Cancelar
            </button>
          </form>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-xs text-[#adadb8]">{username || "…"}</p>
            <button
              type="button"
              className="shrink-0 text-xs font-semibold text-[#60a5fa] hover:underline"
              onClick={() => {
                setNickDraft(username);
                setIsEditingNick(true);
              }}
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {isLoading ? (
          <div className="space-y-2 pt-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-8 animate-pulse rounded bg-[#2f2f35]" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <p className="text-sm leading-6 text-[#adadb8]">
              El chat está vacío. Mandá el primer mensaje.
            </p>
          </div>
        ) : (
          messages.map((item) => (
            <article key={item.id} className="rounded px-1 py-1 hover:bg-[#1f1f23]">
              <p className="text-[13px] leading-5 text-[#efeff1]">
                <time className="mr-1.5 text-[11px] text-[#848494]">
                  {formatMessageTime(item.created_at)}
                </time>
                <span className="mr-1.5 font-semibold text-[#60a5fa]">
                  {item.name}
                </span>
                <span className="break-words">{item.message}</span>
              </p>
            </article>
          ))
        )}
      </div>

      {errorMessage ? (
        <p className="px-3 pb-2 text-xs text-[#ff8280]" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <form
        className="flex gap-2 border-t border-[#2f2f35] p-3"
        onSubmit={handleSend}
      >
        <input
          type="text"
          value={draft}
          maxLength={MAX_MESSAGE_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Enviar un mensaje"
          className="min-w-0 flex-1 rounded-md border border-[#2f2f35] bg-[#1f1f23] px-3 py-2 text-sm text-[#efeff1] outline-none placeholder:text-[#848494] focus:border-[#3b82f6]"
          disabled={isSending || !username}
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim() || !username}
          className="rounded-md bg-[#3b82f6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#3a3a40] disabled:text-[#848494]"
        >
          Chat
        </button>
      </form>
    </section>
  );
}
