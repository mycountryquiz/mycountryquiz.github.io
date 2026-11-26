import type { CountryRecord, Dataset, Metric, MetricId, Observation } from '../../src/types.ts';
import type { ObservationsByIso3 } from './observations.ts';

export interface SourceCountry {
  iso2: string;
  iso3: string;
  name: string;
  region: string;
}

export interface CoverageRule {
  readonly required: readonly MetricId[];
  readonly minCountries: number;
  readonly minPerMetric: number;
}

const NAME_OVERRIDES: Readonly<Record<string, string>> = {
  CD: 'DR Congo',
  CG: 'Republic of the Congo',
  HK: 'Hong Kong',
  MO: 'Macao',
  MM: 'Myanmar',
  PS: 'Palestine',
  FM: 'Micronesia',
  CI: "Côte d'Ivoire"
};

const regionNames = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'code' });

export const isoName = (iso2: string): string | null => {
  if (!/^[A-Z]{2}$/.test(iso2)) return null;
  const name = regionNames.of(iso2);
  return name && name !== iso2 ? name : null;
};

export const displayName = (iso2: string, fallback: string): string => NAME_OVERRIDES[iso2] ?? isoName(iso2) ?? fallback;

const round = (value: number, precision: number): number => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

export const buildDataset = (
  countries: readonly SourceCountry[],
  metrics: readonly Metric[],
  observations: ReadonlyMap<MetricId, ObservationsByIso3>,
  required: readonly MetricId[]
): Dataset => {
  const records = countries.flatMap((country): CountryRecord[] => {
    const entries = metrics.flatMap((metric): [MetricId, Observation][] => {
      const found = observations.get(metric.id)?.get(country.iso3);
      return found ? [[metric.id, { value: round(found.value, metric.precision), year: found.year }]] : [];
    });
    const values = Object.fromEntries(entries) as CountryRecord['metrics'];
    if (required.some(id => values[id] === undefined)) return [];
    return [{ iso2: country.iso2, iso3: country.iso3, name: country.name, region: country.region, metrics: values }];
  });
  records.sort((a, b) => a.name.localeCompare(b.name, 'en') || a.iso2.localeCompare(b.iso2));
  return { countries: records };
};

export const validateDataset = (dataset: Dataset, metrics: readonly Metric[], rule: CoverageRule): string[] => {
  const problems: string[] = [];
  const { countries } = dataset;
  if (countries.length < rule.minCountries) problems.push(`Only ${countries.length} countries (minimum ${rule.minCountries})`);
  const duplicates = countries.length - new Set(countries.map(c => c.iso2)).size;
  if (duplicates > 0) problems.push(`${duplicates} duplicate ISO codes`);
  for (const metric of metrics) {
    const covered = countries.filter(c => c.metrics[metric.id] !== undefined).length;
    if (covered < rule.minPerMetric) problems.push(`${metric.id}: only ${covered} countries (minimum ${rule.minPerMetric})`);
  }
  return problems;
};

export const serialize = (dataset: Dataset): string => `${JSON.stringify(dataset, null, 2)}\n`;
