import { FeedingHistory } from "@/components/feeding-history";
import type { FeedingRow } from "@/lib/supabase/database.types";

type FeedHomeProps = {
  records: FeedingRow[];
  newestId: string | null;
  isLoading: boolean;
};

export function FeedHome({ records, newestId, isLoading }: FeedHomeProps) {
  return (
    <div className="w-full border-t border-[#2f2f35] bg-[#0e0e10] px-4 py-4 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-2 md:items-stretch">
        <FeedingHistory
          records={records}
          newestId={newestId}
          isLoading={isLoading}
        />

        <div className="mt-4 flex flex-col justify-center gap-2">
          <p className="text-sm leading-6 text-[#adadb8]">
            🍗 <strong className="font-semibold text-[#efeff1]">Enviá 1 porción</strong> de
            comida.
          </p>
          <p className="text-sm leading-6 text-[#adadb8]">
            ⏱️ Podés alimentarlo una vez{" "}
            <strong className="font-semibold text-[#efeff1]">cada 5 minutos.</strong>
          </p>
          <p className="text-sm leading-6 text-[#adadb8]">
            ⚠️ Por favor, no lo alimentes{" "}
            <strong className="font-semibold text-[#efeff1]">
              si todavía tiene comida en el plato.
            </strong>{" "}
            🐱
          </p>
          <p className="text-sm leading-6 text-[#adadb8]">
            <strong className="font-semibold text-[#efeff1]">Mis gatos</strong>:
            🐈‍⬛ Teo · 🤍 Milo · 🐯 Luqui
          </p>
          <p className="w-fit rounded-md bg-[#9146ff] px-2.5 py-1 text-sm font-semibold text-white">
            🎁 Premios para los gatos · Próximamente
          </p>
        </div>
      </div>
    </div>
  );
}
