// setTimeout w przeglądarkach przepełnia się (i odpala natychmiast) powyżej ~24.8 dnia (2^31 ms),
// więc planujemy tylko przypomnienia w bezpiecznym oknie, a resztę dopiero gdy się do niego zbliżą.
const MAX_DELAY_MS = 20 * 24 * 60 * 60 * 1000;
const REMINDER_MINUTES_BEFORE = 15;

const alreadyScheduled = new Set();
let visibilityListenerAttached = false;

function eventDateTime(event) {
  return new Date(`${event.date}T${event.start}:00`);
}

export function isNotificationSupported() {
  return 'Notification' in window;
}

export function getPermission() {
  return isNotificationSupported() ? Notification.permission : 'unsupported';
}

export async function requestPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.requestPermission();
}

export function scheduleReminders(events) {
  if (getPermission() !== 'granted') return;

  const now = Date.now();
  events.forEach((event) => {
    if (alreadyScheduled.has(event.id)) return;

    const startMs = eventDateTime(event).getTime();
    const reminderMs = startMs - REMINDER_MINUTES_BEFORE * 60 * 1000;
    const delay = reminderMs - now;
    if (delay < 0 || delay > MAX_DELAY_MS) return;

    alreadyScheduled.add(event.id);
    setTimeout(() => {
      new Notification(`Za ${REMINDER_MINUTES_BEFORE} minut: ${event.title}`, {
        body: [event.start, event.location].filter(Boolean).join(' · '),
        icon: './assets/icons/icon-192.png',
        tag: `forte-trip-${event.id}`,
      });
    }, delay);
  });
}

// TYMCZASOWE (do usunięcia w Etapie 6) — pozwala sprawdzić realne powiadomienie systemowe bez czekania do września.
export async function sendTestNotification() {
  if (getPermission() !== 'granted') {
    const result = await requestPermission();
    if (result !== 'granted') return false;
  }
  setTimeout(() => {
    new Notification('Testowe powiadomienie Forte Trip', {
      body: 'Jeśli to widzisz, powiadomienia działają 🎉',
      icon: './assets/icons/icon-192.png',
      tag: 'forte-trip-test',
    });
  }, 10000);
  return true;
}

/**
 * Nasłuchuje na powrót do aplikacji, żeby ponownie zaplanować przypomnienia
 * dla wydarzeń, które w międzyczasie weszły w bezpieczne okno planowania.
 */
export function keepRemindersScheduled(getEvents) {
  if (visibilityListenerAttached) return;
  visibilityListenerAttached = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleReminders(getEvents());
  });
}
