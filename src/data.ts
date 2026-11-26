import raw from './data/countries.json' with { type: 'json' };
import type { Country, Dataset } from './types.ts';

const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - 'A'.charCodeAt(0);

export const toFlag = (iso2: string): string =>
  String.fromCodePoint(...[...iso2.toUpperCase()].map(c => c.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET));

const dataset = raw as Dataset;

export const COUNTRIES: readonly Country[] = dataset.countries.map(c => ({ ...c, flag: toFlag(c.iso2) }));
