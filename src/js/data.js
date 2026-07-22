const FILES = ['agenda', 'activities', 'participants', 'individualSlots', 'settings'];

let cache = null;

export async function loadData() {
  if (cache) return cache;

  const entries = await Promise.all(
    FILES.map(async (name) => {
      const res = await fetch(`./data/${name}.json`);
      if (!res.ok) {
        throw new Error(`Nie udało się wczytać danych (${name}.json): ${res.status}`);
      }
      return [name, await res.json()];
    })
  );

  cache = Object.fromEntries(entries);
  return cache;
}

export function findParticipantByEmail(data, email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return data.participants.find((p) => p.email === normalized) ?? null;
}
