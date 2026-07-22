const DAY_NAMES = {
  0: 'niedziela',
  1: 'poniedziałek',
  2: 'wtorek',
  3: 'środa',
  4: 'czwartek',
  5: 'piątek',
  6: 'sobota',
};

const TYPE_LABELS = {
  wspólne: 'Wspólne',
  grupowe: 'Grupowe',
  indywidualne: 'Indywidualne',
};

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dayName(dateISO) {
  const d = new Date(`${dateISO}T00:00:00`);
  return DAY_NAMES[d.getDay()];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Zakładka dnia: samo imię dnia, np. "piątek".
function dayTabLabel(dateISO) {
  return dayName(dateISO);
}

// Nagłówek sekcji: imię dnia z wielkiej litery + data, np. "Piątek 11.09".
function dayHeadingLabel(dateISO) {
  const [, m, day] = dateISO.split('-');
  return `${capitalize(dayName(dateISO))} ${day}.${m}`;
}

function resolveTargetDay(days) {
  const today = todayISO();
  if (days.includes(today)) return today;
  if (today < days[0]) return days[0];
  return days[days.length - 1];
}

function eventCard(event) {
  const timeRange = event.crossesMidnight
    ? `${event.start}–${event.end} <span class="event-card__next-day">(następny dzień)</span>`
    : `${event.start}–${event.end}`;
  const typeBadge = event.type
    ? `<span class="event-card__badge event-card__badge--${event.type}">${TYPE_LABELS[event.type] ?? event.type}</span>`
    : '';

  return `
    <li class="event-card">
      <div class="event-card__time">${timeRange}</div>
      <div class="event-card__body">
        <div class="event-card__header">
          <h3 class="event-card__title">${event.title}</h3>
          ${typeBadge}
        </div>
        ${event.location ? `<div class="event-card__location">📍 ${event.location}</div>` : ''}
        ${event.description ? `<p class="event-card__description">${event.description}</p>` : ''}
      </div>
    </li>
  `;
}

/**
 * Renders a day-tabbed, chronological event list.
 * `events` must already be filtered/merged and each item shaped like agenda.json entries
 * (id, date, start, end, crossesMidnight, title, description, location, type).
 */
export function renderEventList(container, events, { emptyMessage } = {}) {
  if (events.length === 0) {
    container.innerHTML = `<div class="placeholder-card">${emptyMessage ?? 'Brak wydarzeń do wyświetlenia.'}</div>`;
    return;
  }

  const sorted = [...events].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const days = [...new Set(sorted.map((e) => e.date))].sort();

  const dayTabs = days
    .map((date) => `<button class="day-tabs__item" data-day="${date}">${dayTabLabel(date)}</button>`)
    .join('');

  const sections = days
    .map((date) => {
      const dayEvents = sorted.filter((e) => e.date === date);
      return `
        <section class="day-section" id="day-${date}">
          <h2 class="day-section__title">${dayHeadingLabel(date)}</h2>
          <ul class="event-card-list">
            ${dayEvents.map(eventCard).join('')}
          </ul>
        </section>
      `;
    })
    .join('');

  container.innerHTML = `
    <nav class="day-tabs" aria-label="Przewiń do dnia">${dayTabs}</nav>
    <div class="day-sections">${sections}</div>
  `;

  const target = resolveTargetDay(days);
  const tabButtons = container.querySelectorAll('.day-tabs__item');

  const setActiveTab = (day) => {
    tabButtons.forEach((btn) => {
      if (btn.dataset.day === day) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  };

  setActiveTab(target);

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveTab(btn.dataset.day);
      document.getElementById(`day-${btn.dataset.day}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.getElementById(`day-${target}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
}
