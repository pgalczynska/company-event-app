import { loadData, findParticipantByEmail } from './data.js';
import { getStoredEmail, setStoredEmail, clearStoredEmail, renderLoginCombobox } from './auth.js';
import { renderAgenda } from './agenda.js';
import { renderMyActivities, getMyEvents } from './myActivities.js';
import { renderInfo } from './info.js';
import { getPermission, requestPermission, scheduleReminders, keepRemindersScheduled } from './notifications.js';

const NOTIF_DISMISSED_KEY = 'forteTrip.notifBannerDismissed';

const root = document.getElementById('app');

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

async function start() {
  let data;
  try {
    data = await loadData();
  } catch (err) {
    root.innerHTML = `<div class="login"><p class="login__error">Nie udało się wczytać danych wyjazdu. Spróbuj odświeżyć stronę lub napisz do organizatora.</p></div>`;
    console.error(err);
    return;
  }

  const storedEmail = getStoredEmail();
  const storedParticipant = storedEmail ? findParticipantByEmail(data, storedEmail) : null;

  if (storedParticipant) {
    renderApp(data, storedParticipant);
  } else {
    if (storedEmail && !storedParticipant) clearStoredEmail();
    renderLogin(data);
  }
}

function renderLogin(data, notice) {
  root.innerHTML = `
    <div class="login">
      <img class="login__logo" src="./assets/Forte-logo_bg-cream.svg" alt="Forte" />
      <h1 class="login__title">${data.settings.eventName ?? 'Forte Trip'}</h1>
      <p class="login__subtitle">Wybierz siebie z listy, aby zobaczyć swój plan wyjazdu.</p>
      ${notice ? `<p class="login__error">${notice}</p>` : ''}
      <div class="combobox" id="login-combobox"></div>
      <p class="login__help">Nie widzisz siebie na liście? Napisz do organizatora: ${formatOrganizers(data.settings.organizers)}</p>
    </div>
  `;

  renderLoginCombobox(document.getElementById('login-combobox'), data.participants, (participant) => {
    setStoredEmail(participant.email);
    renderApp(data, participant);
  });
}

function formatOrganizers(organizers = []) {
  return organizers.map((o) => `${o.name} (${o.phone})`).join(', ');
}

function renderApp(data, participant) {
  root.innerHTML = `
    <header class="topbar">
      <span class="topbar__title">${data.settings.eventName ?? 'Forte Trip'}</span>
      <button class="button-ghost" id="logout-btn">Wyloguj (${participant.label})</button>
    </header>
    <div id="notif-banner"></div>
    <main class="view" id="view-content"></main>
    <nav class="bottom-nav" aria-label="Główna nawigacja">
      <button class="bottom-nav__item" data-view="agenda" aria-current="page">
        <span class="bottom-nav__icon" aria-hidden="true">📅</span>Agenda
      </button>
      <button class="bottom-nav__item" data-view="my-activities">
        <span class="bottom-nav__icon" aria-hidden="true">⭐</span>Moje aktywności
      </button>
      <button class="bottom-nav__item" data-view="info">
        <span class="bottom-nav__icon" aria-hidden="true">ℹ️</span>Informacje
      </button>
    </nav>
  `;

  document.getElementById('logout-btn').addEventListener('click', () => {
    clearStoredEmail();
    renderLogin(data);
  });

  const navButtons = root.querySelectorAll('.bottom-nav__item');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      navButtons.forEach((b) => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'page');
      renderView(btn.dataset.view, data, participant);
    });
  });

  initNotifications(data, participant);

  renderView('agenda', data, participant);
}

function initNotifications(data, participant) {
  const myEvents = () => getMyEvents(data, participant);
  keepRemindersScheduled(myEvents);

  const banner = document.getElementById('notif-banner');
  const permission = getPermission();

  if (permission === 'granted') {
    scheduleReminders(myEvents());
    return;
  }

  if (permission !== 'default' || localStorage.getItem(NOTIF_DISMISSED_KEY)) return;

  banner.innerHTML = `
    <div class="notif-banner">
      <span>Włączyć przypomnienia 15 minut przed każdym wydarzeniem? Działają tylko gdy appka jest otwarta w tle.</span>
      <div class="notif-banner__actions">
        <button class="button-ghost" id="notif-enable-btn">Włącz</button>
        <button class="button-ghost" id="notif-dismiss-btn" aria-label="Zamknij">Nie teraz</button>
      </div>
    </div>
  `;

  document.getElementById('notif-enable-btn').addEventListener('click', async () => {
    const result = await requestPermission();
    banner.innerHTML = '';
    if (result === 'granted') scheduleReminders(myEvents());
  });

  document.getElementById('notif-dismiss-btn').addEventListener('click', () => {
    localStorage.setItem(NOTIF_DISMISSED_KEY, '1');
    banner.innerHTML = '';
  });
}

function renderView(view, data, participant) {
  const content = document.getElementById('view-content');

  if (view === 'agenda') {
    content.innerHTML = `<h2>Agenda</h2><div id="agenda-list"></div>`;
    renderAgenda(document.getElementById('agenda-list'), data);
  } else if (view === 'my-activities') {
    content.innerHTML = `<h2>Moje aktywności</h2><div id="my-activities-list"></div>`;
    renderMyActivities(document.getElementById('my-activities-list'), data, participant);
  } else if (view === 'info') {
    content.innerHTML = `<h2>Informacje</h2><div id="info-content"></div>`;
    renderInfo(document.getElementById('info-content'), data);
  }
}

start();
