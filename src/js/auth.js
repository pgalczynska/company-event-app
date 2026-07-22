const STORAGE_KEY = 'forteTrip.userEmail';

export function getStoredEmail() {
  return localStorage.getItem(STORAGE_KEY);
}

export function setStoredEmail(email) {
  localStorage.setItem(STORAGE_KEY, email);
}

export function clearStoredEmail() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Renders an accessible searchable combobox (ARIA combobox pattern) into `container`.
 * Calls onSelect(participant) when the user picks someone from the list.
 */
export function renderLoginCombobox(container, participants, onSelect) {
  container.innerHTML = `
    <input
      class="combobox__input"
      type="text"
      role="combobox"
      aria-expanded="false"
      aria-autocomplete="list"
      aria-controls="participant-listbox"
      aria-label="Wybierz swoje imię i nazwisko"
      placeholder="Zacznij pisać swoje imię…"
      autocomplete="off"
    />
    <ul class="combobox__list hidden" role="listbox" id="participant-listbox"></ul>
  `;

  const input = container.querySelector('.combobox__input');
  const list = container.querySelector('.combobox__list');
  let matches = [];
  let activeIndex = -1;

  function closeList() {
    list.classList.add('hidden');
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function renderMatches(query) {
    const q = query.trim().toLowerCase();
    matches = q ? participants.filter((p) => p.label?.toLowerCase().includes(q)) : [];
    activeIndex = -1;

    if (!q) {
      closeList();
      return;
    }

    if (matches.length === 0) {
      list.innerHTML = `<li class="combobox__empty">Nie znaleziono nikogo. Sprawdź pisownię lub skontaktuj się z organizatorem.</li>`;
    } else {
      list.innerHTML = matches
        .map(
          (p, i) =>
            `<li class="combobox__option" role="option" id="option-${i}" data-index="${i}" aria-selected="false">${p.label}</li>`
        )
        .join('');
    }
    list.classList.remove('hidden');
    input.setAttribute('aria-expanded', 'true');
  }

  function setActive(index) {
    const options = list.querySelectorAll('.combobox__option');
    options.forEach((el) => el.setAttribute('aria-selected', 'false'));
    if (index >= 0 && options[index]) {
      options[index].setAttribute('aria-selected', 'true');
      options[index].scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', `option-${index}`);
    }
    activeIndex = index;
  }

  function selectMatch(index) {
    const participant = matches[index];
    if (!participant) return;
    input.value = participant.label;
    closeList();
    onSelect(participant);
  }

  input.addEventListener('input', () => renderMatches(input.value));

  input.addEventListener('keydown', (e) => {
    if (list.classList.contains('hidden') && e.key !== 'ArrowDown') return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      renderMatches(input.value || '');
      setActive(Math.min(activeIndex + 1, matches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) selectMatch(activeIndex);
    } else if (e.key === 'Escape') {
      closeList();
    }
  });

  list.addEventListener('click', (e) => {
    const li = e.target.closest('.combobox__option[data-index]');
    if (!li) return;
    selectMatch(Number(li.dataset.index));
  });

  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) closeList();
  });
}
