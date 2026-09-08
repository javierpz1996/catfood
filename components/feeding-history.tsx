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
  const visible = records.slice(0, 3);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#efeff1]">
          Historial de alimentación
        </h2>
        <p className="text-xs text-[#adadb8]">
          {isLoading ? "Cargando…" : <span className="font-semibold text-[#efeff1]">Últimos 3</span>}
        </p>
      </div>

      {isLoading ? (
        <ul className="space-y-1.5">
          {[0, 1, 2].map((item) => (
            <li
              key={item}
              className="h-9 animate-pulse rounded-md bg-[#1f1f23]"
            />
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#2f2f35] bg-[#1f1f23] px-3 py-3 text-center">
          <p className="text-sm font-medium text-[#efeff1]">Todavía no comió</p>
          <p className="mt-0.5 text-xs leading-5 text-[#adadb8]">
            Cuando alimentes al gato, el registro va a aparecer acá.
          </p>
        </div>
      ) : (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
          {visible.map((record, index) => {
            const isLatest = index === 0;
            const fedBy = record.fed_by?.trim() || "—";

            return (
              <li
                key={record.id}
                className={`rounded-md px-2 py-1.5 ${
                  isLatest
                    ? `border-2 border-[#3b82f6] bg-[#1e3a5f] shadow-[0_0_12px_rgba(59,130,246,0.45)] ${
                        record.id === newestId ? "animate-feed-in" : ""
                      }`
                    : "border border-[#2f2f35] bg-[#1f1f23]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#18181b] text-xs">
                    🍗
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-4 text-[#efeff1]">
                      {formatFeedingStatusLabel(record.status)}
                    </p>
                    <p className="text-[11px] leading-4 text-[#adadb8]">
                      {formatFeedingWhen(record.created_at)} · Por {fedBy}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#18181b] px-2 py-0.5 text-[11px] font-bold text-[#efeff1]">
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
