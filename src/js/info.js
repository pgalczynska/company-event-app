import { sendTestNotification } from './notifications.js';

function telHref(phone) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function mapsLink(address) {
  if (!address) return null;
  const query = encodeURIComponent(address.replace(/\n/g, ', '));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function contactRow({ href, label, value, external = false }) {
  if (!href) return '';
  const attrs = external ? ' target="_blank" rel="noopener"' : '';
  return `
    <a class="contact-row" href="${href}"${attrs}>
      <span class="contact-row__label">${label}</span>
      <span class="contact-row__value">${value}${external ? ' ↗' : ''}</span>
    </a>
  `;
}

export function renderInfo(container, data) {
  const { hotel = {}, organizers = [], wifiPassword, announcements } = data.settings;

  const cards = [];

  if (announcements) {
    cards.push(`
      <div class="info-card info-card--highlight">
        <h3 class="info-card__title">📣 Ważne komunikaty</h3>
        <p>${announcements}</p>
      </div>
    `);
  }

  if (hotel.name || hotel.address) {
    const map = mapsLink(hotel.address);
    cards.push(`
      <div class="info-card">
        <h3 class="info-card__title">🏨 Hotel</h3>
        ${hotel.name ? `<p>${hotel.name.replace(/\n/g, '<br>')}</p>` : ''}
        ${hotel.address ? `<p>${hotel.address.replace(/\n/g, '<br>')}</p>` : ''}
        ${hotel.checkoutTime ? `<p>Wymeldowanie: <strong>${hotel.checkoutTime}</strong></p>` : ''}
        <div class="contact-row-list">
          ${map ? contactRow({ href: map, label: '📍 Mapa', value: 'Zobacz na mapie', external: true }) : ''}
          ${hotel.website ? contactRow({ href: hotel.website, label: '🌐 Strona', value: 'Otwórz stronę hotelu', external: true }) : ''}
        </div>
      </div>
    `);
  }

  if (hotel.receptionPhone || hotel.spaPhone) {
    cards.push(`
      <div class="info-card">
        <h3 class="info-card__title">☎️ Kontakt na miejscu</h3>
        <div class="contact-row-list">
          ${hotel.receptionPhone ? contactRow({ href: telHref(hotel.receptionPhone), label: 'Recepcja', value: hotel.receptionPhone }) : ''}
          ${hotel.spaPhone ? contactRow({ href: telHref(hotel.spaPhone), label: 'Spa', value: hotel.spaPhone }) : ''}
        </div>
      </div>
    `);
  }

  if (wifiPassword) {
    cards.push(`
      <div class="info-card">
        <h3 class="info-card__title">📶 WiFi</h3>
        <p>Hasło: <strong>${wifiPassword}</strong></p>
      </div>
    `);
  }

  if (organizers.length > 0) {
    cards.push(`
      <div class="info-card">
        <h3 class="info-card__title">🧑‍💼 Organizatorzy</h3>
        <div class="contact-row-list">
          ${organizers.map((o) => contactRow({ href: telHref(o.phone), label: o.name.split(' ')[0], value: o.phone })).join('')}
        </div>
        <p class="info-card__note">Prosimy o kontakt tylko w razie nagłych sytuacji.</p>
      </div>
    `);
  }

  // TYMCZASOWE (do usunięcia w Etapie 6) — do ręcznego testowania powiadomień bez czekania do września.
  cards.push(`
    <div class="info-card" style="border-style: dashed;">
      <h3 class="info-card__title">🧪 Test powiadomień (tymczasowe)</h3>
      <p>Sprawdź, czy Twoja przeglądarka pokaże prawdziwe powiadomienie systemowe.</p>
      <button class="button-ghost" id="test-notif-btn">Wyślij testowe powiadomienie (za 10s)</button>
      <p id="test-notif-status"></p>
    </div>
  `);

  container.innerHTML =
    cards.length > 0
      ? cards.join('')
      : `<div class="placeholder-card">Informacje organizacyjne pojawią się tutaj, gdy organizatorzy je uzupełnią.</div>`;

  const testBtn = document.getElementById('test-notif-btn');
  const testStatus = document.getElementById('test-notif-status');
  testBtn?.addEventListener('click', async () => {
    testStatus.textContent = 'Wysyłanie prośby o zgodę (jeśli potrzebna)…';
    const ok = await sendTestNotification();
    testStatus.textContent = ok
      ? 'Zaplanowano! Zminimalizuj kartę i poczekaj ~10 sekund.'
      : 'Brak zgody na powiadomienia w przeglądarce.';
  });
}
