const USERNAME_KEY = "cat_feeder_username";

const CAT_NAME_BASES = [
  "MichiNinja",
  "GatoCósmico",
  "Bigotes",
  "PatitasAzules",
  "MichiSupremo",
  "Ronroneo",
  "GatitoLunar",
  "ColaPeluda",
  "MichiFuego",
  "WhiskerBoss",
] as const;

function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

export function generateCatUsername() {
  const base = CAT_NAME_BASES[randomInt(CAT_NAME_BASES.length)];
  const suffix = 100 + randomInt(900);
  return `${base}${suffix}`;
}

export function getOrCreateChatUsername() {
  const existing = window.localStorage.getItem(USERNAME_KEY)?.trim();
  if (existing) {
    return existing;
  }

  return saveChatUsername(generateCatUsername());
}

export function saveChatUsername(name: string) {
  const next = name.trim();
  if (!next) {
    throw new Error("El nick no puede estar vacío.");
  }

  window.localStorage.setItem(USERNAME_KEY, next);
  return next;
}
