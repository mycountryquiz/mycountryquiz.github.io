import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { METRICS } from '../src/metrics.ts';
import type { Metric, MetricId } from '../src/types.ts';
import { buildDataset, displayName, isoName, serialize, validateDataset, type CoverageRule, type SourceCountry } from './lib/dataset.ts';
import { latestByCountry, type ObservationsByIso3, type RawObservation } from './lib/observations.ts';
import { fetchChart } from './lib/owid.ts';
import { fetchCountries, fetchIndicator } from './lib/world-bank.ts';

const OUTPUT = fileURLToPath(new URL('../src/data/countries.json', import.meta.url));
const LOOKBACK_YEARS = 20;
const COVERAGE: CoverageRule = { required: ['population', 'area'], minCountries: 180, minPerMetric: 60 };

const fetchMetric = (metric: Metric, fromYear: number, toYear: number): Promise<RawObservation[]> => {
  const { source } = metric;
  switch (source.kind) {
    case 'worldBank':
      return fetchIndicator(source.indicator, fromYear, toYear);
    case 'owid':
      return fetchChart(source.chart);
  }
};

const loadCountries = async (): Promise<SourceCountry[]> =>
  (await fetchCountries())
    .filter(c => isoName(c.iso2Code) !== null)
    .map(c => ({ iso2: c.iso2Code, iso3: c.id, name: displayName(c.iso2Code, c.name.trim()), region: c.region.value.trim() }));

const loadObservations = async (fromYear: number, toYear: number): Promise<Map<MetricId, ObservationsByIso3>> => {
  const observations = new Map<MetricId, ObservationsByIso3>();
  for (const metric of METRICS) {
    const latest = latestByCountry(await fetchMetric(metric, fromYear, toYear), fromYear);
    console.log(`${metric.id.padEnd(20)} ${String(latest.size).padStart(4)} countries`);
    observations.set(metric.id, latest);
  }
  return observations;
};

const readExisting = async (): Promise<string | null> => {
  try {
    return await readFile(OUTPUT, 'utf8');
  } catch {
    return null;
  }
};

const main = async (): Promise<void> => {
  const toYear = new Date().getUTCFullYear();
  const fromYear = toYear - LOOKBACK_YEARS;
  const [countries, observations] = await Promise.all([loadCountries(), loadObservations(fromYear, toYear)]);
  const dataset = buildDataset(countries, METRICS, observations, COVERAGE.required);

  const problems = validateDataset(dataset, METRICS, COVERAGE);
  if (problems.length > 0) throw new Error(`Dataset failed validation:\n- ${problems.join('\n- ')}`);

  const output = serialize(dataset);
  if (output === (await readExisting())) {
    console.log('Data unchanged.');
    return;
  }
  await writeFile(OUTPUT, output, 'utf8');
  console.log(`Wrote ${dataset.countries.length} countries to ${OUTPUT}`);
};

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
