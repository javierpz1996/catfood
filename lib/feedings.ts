import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, FeedingRow } from "@/lib/supabase/database.types";

const feedingColumns = "id, created_at, amount, status, fed_by";

export async function listFeedings(
  supabase: SupabaseClient<Database>,
): Promise<FeedingRow[]> {
  const { data, error } = await supabase
    .from("feedings")
    .select(feedingColumns)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function insertFeeding(
  supabase: SupabaseClient<Database>,
  fedBy: string,
): Promise<FeedingRow> {
  const { data, error } = await supabase
    .from("feedings")
    .insert({
      amount: 1,
      status: "pending",
      fed_by: fedBy,
    })
    .select(feedingColumns)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function insertPlateClean(
  supabase: SupabaseClient<Database>,
  fedBy: string,
): Promise<FeedingRow> {
  const { data, error } = await supabase
    .from("feedings")
    .insert({
      amount: 0,
      status: "plate_clean",
      fed_by: fedBy,
    })
    .select(feedingColumns)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function sortFeedingsByNewest(records: FeedingRow[]): FeedingRow[] {
  return [...records].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function upsertFeeding(
  records: FeedingRow[],
  next: FeedingRow,
): FeedingRow[] {
  return sortFeedingsByNewest([
    next,
    ...records.filter((record) => record.id !== next.id),
  ]);
}
