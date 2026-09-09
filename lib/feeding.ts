export function formatFeedingWhen(value: string | Date, now = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) return `Hoy, ${time}`;
  if (dayDiff === 1) return `Ayer, ${time}`;

  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPortionLabel(amount: number, status?: string) {
  if (status === "plate_clean" || amount === 0) return "Limpieza";
  return amount === 1 ? "1 porción" : `${amount} porciones`;
}

export function formatFeedingStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Esperando que se dispense...";
    case "completed":
      return "Alimentado correctamente";
    case "failed":
      return "No se pudo alimentar";
    case "plate_clean":
      return "Limpieza de plato";
    default:
      return status;
  }
}

export function isPlateCleanRecord(status: string) {
  return status === "plate_clean";
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
