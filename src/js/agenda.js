import { renderEventList } from './eventList.js';

export function renderAgenda(container, data) {
  renderEventList(container, data.agenda, { emptyMessage: 'Agenda pojawi się tutaj, gdy organizatorzy ją uzupełnią.' });
}
