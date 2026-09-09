type FeedButtonProps = {
  disabled: boolean;
  feeding: boolean;
  unavailable?: boolean;
  onFeed: () => void;
};

export function FeedButton({
  disabled,
  feeding,
  unavailable = false,
  onFeed,
}: FeedButtonProps) {
  const label = feeding
    ? "Alimentando…"
    : unavailable
      ? "No disponible"
      : "Comida disponible 1 🍗";

  return (
    <button
      type="button"
      onClick={onFeed}
      disabled={disabled}
      className="h-12 w-full rounded-md bg-[#00c853] px-6 text-base font-semibold text-white transition-colors hover:bg-[#00b34a] disabled:cursor-not-allowed disabled:bg-[#3a3a40] disabled:text-[#848494]"
    >
      {label}
    </button>
  );
}

type PlateCleanButtonProps = {
  disabled: boolean;
  unavailable?: boolean;
  onClean: () => void;
};

export function PlateCleanButton({
  disabled,
  unavailable = false,
  onClean,
}: PlateCleanButtonProps) {
  return (
    <button
      type="button"
      onClick={onClean}
      disabled={disabled}
      className="h-12 w-full rounded-md bg-[#3b82f6] px-2 text-xs font-semibold leading-tight text-white transition-colors hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:bg-[#3a3a40] disabled:text-[#848494] sm:text-sm"
    >
      {unavailable ? "No disponible" : "Limpieza de plato"}
    </button>
  );
}
