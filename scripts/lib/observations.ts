import type { Observation } from '../../src/types.ts';

export type ObservationsByIso3 = Map<string, Required<Observation>>;

export interface RawObservation {
  iso3: string;
  year: number;
  value: number;
}

export const latestByCountry = (rows: Iterable<RawObservation>, minYear: number): ObservationsByIso3 => {
  const latest: ObservationsByIso3 = new Map();
  for (const { iso3, year, value } of rows) {
    if (!iso3 || !Number.isFinite(value) || !Number.isInteger(year) || year < minYear) continue;
    const current = latest.get(iso3);
    if (!current || year > current.year) latest.set(iso3, { value, year });
  }
  return latest;
};
