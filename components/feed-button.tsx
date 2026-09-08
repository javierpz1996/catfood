type FeedButtonProps = {
  disabled: boolean;
  feeding: boolean;
  onFeed: () => void;
};

export function FeedButton({ disabled, feeding, onFeed }: FeedButtonProps) {
  return (
    <button
      type="button"
      onClick={onFeed}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-2xl bg-amber-500 px-6 py-5 text-lg font-semibold text-white shadow-[0_12px_28px_-8px_rgba(217,119,6,0.55)] transition-[transform,box-shadow,background-color] duration-200 hover:bg-amber-400 hover:shadow-[0_16px_32px_-8px_rgba(217,119,6,0.6)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-amber-300 disabled:shadow-none disabled:active:scale-100"
    >
      <span className="relative z-10">
        {feeding ? "Alimentando…" : "🥣 Alimentar gato"}
      </span>
    </button>
  );
}
