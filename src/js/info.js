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
      </div>
    `);
  }

  container.innerHTML =
    cards.length > 0
      ? cards.join('')
      : `<div class="placeholder-card">Informacje organizacyjne pojawią się tutaj, gdy organizatorzy je uzupełnią.</div>`;
}
