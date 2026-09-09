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
      className="w-full rounded-md bg-[#00c853] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#00b34a] disabled:cursor-not-allowed disabled:bg-[#3a3a40] disabled:text-[#848494]"
    >
      {label}
    </button>
  );
}
