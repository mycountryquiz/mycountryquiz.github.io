import { fetchJson } from './http.ts';
import type { RawObservation } from './observations.ts';

const API = 'https://api.worldbank.org/v2';
const PAGE_SIZE = 20_000;

interface PageInfo {
  page: number;
  pages: number;
}

type ApiResponse<T> = [PageInfo, T[] | null] | [{ message: unknown }];

export interface WorldBankCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; value: string };
}

interface IndicatorRow {
  countryiso3code: string;
  date: string;
  value: number | null;
}

const fetchAllPages = async <T>(path: string, query: Record<string, string>): Promise<T[]> => {
  const rows: T[] = [];
  for (let page = 1, pages = 1; page <= pages; page++) {
    const params = new URLSearchParams({ ...query, format: 'json', per_page: String(PAGE_SIZE), page: String(page) });
    const body = await fetchJson<ApiResponse<T>>(`${API}/${path}?${params}`);
    const [info, data] = body;
    if (!('pages' in info)) throw new Error(`World Bank API error for ${path}: ${JSON.stringify(info.message)}`);
    pages = info.pages;
    rows.push(...(data ?? []));
  }
  return rows;
};

export const isAggregate = (country: WorldBankCountry): boolean => country.region.id === 'NA' || country.region.value.trim() === 'Aggregates';

export const fetchCountries = async (): Promise<WorldBankCountry[]> =>
  (await fetchAllPages<WorldBankCountry>('country', {})).filter(c => !isAggregate(c));

export const toRawObservations = (rows: readonly IndicatorRow[]): RawObservation[] =>
  rows.flatMap(row => (row.value === null ? [] : [{ iso3: row.countryiso3code, year: Number(row.date), value: row.value }]));

export const fetchIndicator = async (indicator: string, fromYear: number, toYear: number): Promise<RawObservation[]> =>
  toRawObservations(await fetchAllPages<IndicatorRow>(`country/all/indicator/${encodeURIComponent(indicator)}`, { date: `${fromYear}:${toYear}` }));
