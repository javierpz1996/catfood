import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MessageRow } from "@/lib/supabase/database.types";

const messageColumns = "id, created_at, name, message";

export async function listMessages(
  supabase: SupabaseClient<Database>,
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from("messages")
    .select(messageColumns)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function insertMessage(
  supabase: SupabaseClient<Database>,
  input: { name: string; message: string },
): Promise<MessageRow> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      name: input.name,
      message: input.message,
    })
    .select(messageColumns)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function sortMessagesOldestFirst(records: MessageRow[]): MessageRow[] {
  return [...records].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function upsertMessage(
  records: MessageRow[],
  next: MessageRow,
): MessageRow[] {
  return sortMessagesOldestFirst([
    next,
    ...records.filter((record) => record.id !== next.id),
  ]);
}
