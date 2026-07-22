import ExcelJS from 'exceljs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(__dirname, '..', 'data', 'Event_Data.xlsx');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');

const DAY_ORDER = ['piątek', 'sobota', 'niedziela'];

const errors = [];
const fail = (message) => errors.push(message);

function cellValue(v) {
  if (v instanceof Date) return v;
  if (v && typeof v === 'object') {
    if ('text' in v) return v.text; // hyperlink cell, e.g. mailto:
    if ('richText' in v) return v.richText.map((rt) => rt.text).join('');
    if ('result' in v) return v.result; // formula cell
  }
  return v;
}

function sheetRows(workbook, sheetName) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) {
    fail(`Brak zakładki "${sheetName}" w pliku Excel.`);
    return [];
  }
  const header = sheet.getRow(1).values.map((v) => (typeof v === 'string' ? v.trim() : v));
  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const values = row.values;
    const isEmpty = values.every((v) => v === null || v === undefined || v === '');
    if (isEmpty) return;
    const obj = {};
    header.forEach((key, i) => {
      if (!key) return;
      obj[key] = cellValue(values[i]);
    });
    rows.push(obj);
  });
  return rows;
}

function timeToHHMM(value, context) {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) {
    const h = String(value.getUTCHours()).padStart(2, '0');
    const m = String(value.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
  fail(`Nieprawidłowa wartość godziny (${JSON.stringify(value)}) w: ${context}`);
  return null;
}

function dateDDMMYYYYtoISO(value, context) {
  if (typeof value !== 'string' || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value.trim())) {
    fail(`Nieprawidłowy format daty (${JSON.stringify(value)}) w: ${context}. Oczekiwano DD.MM.YYYY.`);
    return null;
  }
  const [d, m, y] = value.trim().split('.');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function minutesSinceMidnight(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function splitCodes(value) {
  if (value === null || value === undefined || value === '') return [];
  return String(value)
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

function normalizeEmail(value, context) {
  if (!value) return null;
  const email = String(value).trim().toLowerCase();
  if (!/^[^\s@]+@fortedigital\.com$/.test(email)) {
    fail(`Nieprawidłowy e-mail (${JSON.stringify(value)}) w: ${context}. Oczekiwano adresu @fortedigital.com bez spacji.`);
  }
  return email;
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(SOURCE_PATH);

  // --- Ustawienia ---
  const settingsRows = sheetRows(workbook, 'Ustawienia');
  const organizers = [];
  const settingsMap = {};
  for (const row of settingsRows) {
    const key = String(row['Klucz'] ?? '').trim();
    const val = row['Wartość'];
    const orgMatch = key.match(/^Kontakt organizatora (\d+)$/);
    const phoneMatch = key.match(/^Telefon organizatora (\d+)$/);
    if (orgMatch) {
      organizers[Number(orgMatch[1]) - 1] = {
        ...organizers[Number(orgMatch[1]) - 1],
        name: val,
      };
    } else if (phoneMatch) {
      organizers[Number(phoneMatch[1]) - 1] = {
        ...organizers[Number(phoneMatch[1]) - 1],
        phone: `+${val}`,
      };
    } else {
      settingsMap[key] = val;
    }
  }

  const startDateISO = dateDDMMYYYYtoISO(settingsMap['Data rozpoczęcia'], 'Ustawienia > Data rozpoczęcia');
  const endDateISO = dateDDMMYYYYtoISO(settingsMap['Data zakończenia'], 'Ustawienia > Data zakończenia');

  const dayNameToDate = {};
  if (startDateISO) {
    const start = new Date(`${startDateISO}T00:00:00Z`);
    DAY_ORDER.forEach((name, i) => {
      const d = new Date(start);
      d.setUTCDate(d.getUTCDate() + i);
      dayNameToDate[name] = d.toISOString().slice(0, 10);
    });
  }

  const settings = {
    eventName: settingsMap['Nazwa wydarzenia'] ?? null,
    startDate: startDateISO,
    endDate: endDateISO,
    organizers: organizers.filter(Boolean),
    hotel: {
      name: settingsMap['Hotel'] ?? null,
      address: settingsMap['Adres'] ?? null,
      website: settingsMap['Strona hotelu'] ?? null,
      checkoutTime: timeToHHMM(settingsMap['Godzina wymeldowania'], 'Ustawienia > Godzina wymeldowania'),
      receptionPhone: settingsMap['Telefon recepcja'] ?? null,
      spaPhone: settingsMap['Telefon spa'] ?? null,
    },
    // Opcjonalne — nie ma ich jeszcze w Excelu; jeśli organizator doda taki wiersz
    // w zakładce Ustawienia, appka podejmie go bez zmian w kodzie.
    wifiPassword: settingsMap['Hasło WiFi'] ?? settingsMap['WiFi'] ?? null,
    announcements: settingsMap['Ważne komunikaty'] ?? null,
  };

  // --- Aktywności ---
  const activityRows = sheetRows(workbook, 'Aktywności').filter((r) => r['Kod aktywności']);
  const activities = activityRows.map((r) => ({
    code: String(r['Kod aktywności']).trim(),
    name: r['Nazwa'] ?? null,
    type: r['Typ'] ?? null,
    description: r['Opis'] ?? null,
  }));
  const activityCodes = new Set(activities.map((a) => a.code));

  // --- Agenda ---
  const agendaRows = sheetRows(workbook, 'Agenda');
  const agenda = agendaRows.map((r) => {
    const context = `Agenda > ID ${r['ID']}`;
    const date = dateDDMMYYYYtoISO(r['Data'], `${context} (Data)`);
    const start = timeToHHMM(r['Start'], `${context} (Start)`);
    const end = timeToHHMM(r['Koniec'], `${context} (Koniec)`);
    const activityCode = r['Kod aktywności'] ? String(r['Kod aktywności']).trim() : null;

    if (!r['Nazwa']) fail(`${context}: brak nazwy wydarzenia.`);
    if (!r['Lokalizacja']) fail(`${context}: brak lokalizacji.`);
    if (!r['Typ']) fail(`${context}: brak typu wydarzenia.`);
    if (activityCode && !activityCodes.has(activityCode)) {
      fail(`${context}: kod aktywności "${activityCode}" nie istnieje w zakładce Aktywności.`);
    }

    return {
      id: r['ID'],
      date,
      start,
      end,
      crossesMidnight: start && end ? minutesSinceMidnight(end) < minutesSinceMidnight(start) : false,
      title: r['Nazwa'] ?? null,
      activityCode,
      description: r['Opis'] ?? null,
      location: r['Lokalizacja'] ?? null,
      type: r['Typ'] ?? null,
    };
  });

  // --- Uczestnicy ---
  const participantRows = sheetRows(workbook, 'Uczestnicy');
  const participants = participantRows.map((r) => {
    const context = `Uczestnicy > ${r['Email']}`;
    const email = normalizeEmail(r['Email'], context);
    const common = splitCodes(r['Wspólne']);
    const group = splitCodes(r['Grupowe']);
    const individual = splitCodes(r['Indywidualne']);
    [...common, ...group, ...individual].forEach((code) => {
      if (!activityCodes.has(code)) {
        fail(`${context}: kod aktywności "${code}" nie istnieje w zakładce Aktywności.`);
      }
    });
    return {
      email,
      label: r['Imię'] ? String(r['Imię']).trim() : null,
      common,
      group,
      individual,
    };
  });

  const labelCounts = new Map();
  for (const p of participants) {
    if (!p.label) continue;
    labelCounts.set(p.label, (labelCounts.get(p.label) ?? 0) + 1);
  }
  for (const [label, count] of labelCounts) {
    if (count > 1) fail(`Uczestnicy: etykieta "${label}" powtarza się ${count} razy — dropdown logowania będzie niejednoznaczny.`);
  }

  const participantEmails = new Set(participants.map((p) => p.email).filter(Boolean));

  // --- Terminy indywidualne ---
  const individualSlotRows = sheetRows(workbook, 'Terminy indywidualne').filter((r) => r['Email']);
  const individualSlots = individualSlotRows.map((r) => {
    const context = `Terminy indywidualne > ${r['ID']}`;
    const email = normalizeEmail(r['Email'], context);
    const activityCode = r['Kod aktywności'] ? String(r['Kod aktywności']).trim() : null;
    const dayName = String(r['Data'] ?? '').trim();
    const date = dayNameToDate[dayName] ?? null;

    if (!date) fail(`${context}: nierozpoznana nazwa dnia "${dayName}".`);
    if (activityCode && !activityCodes.has(activityCode)) {
      fail(`${context}: kod aktywności "${activityCode}" nie istnieje w zakładce Aktywności.`);
    }
    if (email && !participantEmails.has(email)) {
      fail(`${context}: e-mail "${email}" nie występuje w zakładce Uczestnicy.`);
    }

    return {
      id: r['ID'],
      activityCode,
      email,
      date,
      start: timeToHHMM(r['Start'], `${context} (Start)`),
      end: timeToHHMM(r['Koniec'], `${context} (Koniec)`),
      subtype: r['Typ'] ?? null,
    };
  });

  if (errors.length > 0) {
    console.error(`\nBuild danych przerwany — ${errors.length} błąd(ów):\n`);
    errors.forEach((e) => console.error(`  - ${e}`));
    console.error('');
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const files = { agenda, activities, participants, individualSlots, settings };
  await Promise.all(
    Object.entries(files).map(([name, data]) =>
      writeFile(path.join(OUTPUT_DIR, `${name}.json`), JSON.stringify(data, null, 2) + '\n', 'utf8')
    )
  );

  console.log('Build danych zakończony pomyślnie:');
  console.log(`  agenda.json          — ${agenda.length} wydarzeń`);
  console.log(`  activities.json      — ${activities.length} kodów aktywności`);
  console.log(`  participants.json    — ${participants.length} uczestników`);
  console.log(`  individualSlots.json — ${individualSlots.length} terminów indywidualnych`);
  console.log(`  settings.json        — OK`);
}

main().catch((err) => {
  console.error('Nieoczekiwany błąd budowania danych:', err);
  process.exit(1);
});
