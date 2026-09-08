import { formatFeedingStatusLabel, formatFeedingWhen, formatPortionLabel } from "@/lib/feeding";
import type { FeedingRow } from "@/lib/supabase/database.types";

type FeedingHistoryProps = {
  records: FeedingRow[];
  newestId: string | null;
  isLoading: boolean;
};

export function FeedingHistory({
  records,
  newestId,
  isLoading,
}: FeedingHistoryProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-stone-800">
          Historial de alimentación
        </h2>
        <p className="text-sm text-stone-400">
          {isLoading ? "Cargando…" : `${records.length} registros`}
        </p>
      </div>

      {isLoading ? (
        <ul className="space-y-3">
          {[0, 1, 2].map((item) => (
            <li
              key={item}
              className="h-[4.5rem] animate-pulse rounded-2xl border border-stone-100 bg-stone-50"
            />
          ))}
        </ul>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-5 py-8 text-center">
          <p className="text-2xl">😺</p>
          <p className="mt-2 font-medium text-stone-700">Todavía no comió</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">
            Cuando alimentes al gato, el registro va a aparecer acá.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {records.map((record) => {
            const isNewest = record.id === newestId;
            const fedBy = record.fed_by?.trim() || "Anónimo";

            return (
              <li
                key={record.id}
                className={`rounded-2xl border bg-white px-4 py-3.5 shadow-sm transition-all duration-300 ${
                  isNewest
                    ? "animate-feed-in border-amber-200 ring-2 ring-amber-100"
                    : "border-stone-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg">
                    🥣
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-800">
                      {formatFeedingStatusLabel(record.status)}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      {formatFeedingWhen(record.created_at)}
                    </p>
                    <p className="mt-0.5 text-sm text-stone-400">Por {fedBy}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                    {formatPortionLabel(record.amount)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
