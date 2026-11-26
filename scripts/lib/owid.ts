import { fetchText } from './http.ts';
import type { RawObservation } from './observations.ts';

const KEY_COLUMNS = ['Entity', 'Code', 'Year'] as const;

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(cell => cell !== ''));
};

export const toRawObservations = (rows: readonly string[][]): RawObservation[] => {
  const [header, ...data] = rows;
  if (!header) return [];
  const columnOf = (name: string): number => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`OWID CSV is missing column "${name}": ${header.join(',')}`);
    return index;
  };
  const code = columnOf('Code');
  const year = columnOf('Year');
  const value = header.findIndex(name => !(KEY_COLUMNS as readonly string[]).includes(name));
  if (value === -1) throw new Error(`OWID CSV has no value column: ${header.join(',')}`);
  return data.flatMap(r => {
    const iso3 = r[code] ?? '';
    const raw = r[value] ?? '';
    return /^[A-Z]{3}$/.test(iso3) && raw !== '' ? [{ iso3, year: Number(r[year]), value: Number(raw) }] : [];
  });
};

export const fetchChart = async (chart: string): Promise<RawObservation[]> => {
  const params = new URLSearchParams({ v: '1', csvType: 'full', useColumnShortNames: 'false' });
  return toRawObservations(parseCsv(await fetchText(`https://ourworldindata.org/grapher/${encodeURIComponent(chart)}.csv?${params}`)));
};
