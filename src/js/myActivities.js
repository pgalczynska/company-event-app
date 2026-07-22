import { renderEventList } from './eventList.js';

function minutesSinceMidnight(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function individualSlotToEvent(slot, activitiesByCode) {
  const activity = activitiesByCode.get(slot.activityCode);
  return {
    id: `slot-${slot.id}`,
    date: slot.date,
    start: slot.start,
    end: slot.end,
    crossesMidnight: minutesSinceMidnight(slot.end) < minutesSinceMidnight(slot.start),
    title: activity ? `${activity.name} — ${slot.subtype}` : slot.subtype,
    description: null,
    location: 'Hotel',
    type: 'indywidualne',
  };
}

/** Wydarzenia wspólne/grupowe przypisane uczestnikowi + jego indywidualne terminy. */
export function getMyEvents(data, participant) {
  const myCodes = new Set([...participant.common, ...participant.group]);
  const agendaEvents = data.agenda.filter((e) => myCodes.has(e.activityCode));

  const activitiesByCode = new Map(data.activities.map((a) => [a.code, a]));
  const mySlots = data.individualSlots
    .filter((s) => s.email === participant.email)
    .map((s) => individualSlotToEvent(s, activitiesByCode));

  return [...agendaEvents, ...mySlots];
}

export function renderMyActivities(container, data, participant) {
  renderEventList(container, getMyEvents(data, participant), {
    emptyMessage: 'Nie masz jeszcze przypisanych aktywności.',
  });
}
