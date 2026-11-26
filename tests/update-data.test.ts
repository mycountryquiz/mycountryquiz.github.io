import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDataset, displayName, validateDataset } from '../scripts/lib/dataset.ts';
import { latestByCountry } from '../scripts/lib/observations.ts';
import { parseCsv, toRawObservations as fromOwid } from '../scripts/lib/owid.ts';
import { isAggregate, toRawObservations as fromWorldBank } from '../scripts/lib/world-bank.ts';
import { METRICS } from '../src/metrics.ts';
import type { MetricId } from '../src/types.ts';

describe('parseCsv', () => {
  it('handles quotes, escaped quotes and CRLF', () => {
    assert.deepEqual(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n'), [['a', 'b'], ['x, y', 'say "hi"']]);
  });
});

describe('OWID rows', () => {
  it('keeps ISO3 rows with values only', () => {
    const rows = parseCsv('Entity,Code,Year,Human Development Index\nWorld,OWID_WRL,2023,0.75\nNorway,NOR,2023,0.97\nChad,TCD,2023,\n');
    assert.deepEqual(fromOwid(rows), [{ iso3: 'NOR', year: 2023, value: 0.97 }]);
  });
});

describe('World Bank rows', () => {
  it('drops null values', () => {
    assert.deepEqual(
      fromWorldBank([
        { countryiso3code: 'CAN', date: '2024', value: 41 },
        { countryiso3code: 'CAN', date: '2025', value: null }
      ]),
      [{ iso3: 'CAN', year: 2024, value: 41 }]
    );
  });

  it('detects aggregates', () => {
    assert.equal(isAggregate({ id: 'WLD', iso2Code: '1W', name: 'World', region: { id: 'NA', value: 'Aggregates' } }), true);
  });
});

describe('latestByCountry', () => {
  it('picks the most recent year within range', () => {
    const latest = latestByCountry(
      [
        { iso3: 'CAN', year: 2020, value: 1 },
        { iso3: 'CAN', year: 2023, value: 3 },
        { iso3: 'CAN', year: 2022, value: 2 },
        { iso3: 'MEX', year: 1990, value: 9 }
      ],
      2000
    );
    assert.deepEqual(latest.get('CAN'), { value: 3, year: 2023 });
    assert.equal(latest.has('MEX'), false);
  });
});

describe('buildDataset', () => {
  const countries = [
    { iso2: 'NO', iso3: 'NOR', name: 'Norway', region: 'Europe & Central Asia' },
    { iso2: 'CA', iso3: 'CAN', name: 'Canada', region: 'North America' }
  ];
  const observations = new Map<MetricId, Map<string, { value: number; year: number }>>([
    ['population', new Map([['NOR', { value: 5_500_000.4, year: 2024 }], ['CAN', { value: 41_000_000, year: 2024 }]])],
    ['area', new Map([['CAN', { value: 9_984_670, year: 2022 }]])],
    ['hdi', new Map([['NOR', { value: 0.96612, year: 2023 }]])]
  ]);

  it('rounds, sorts and drops countries missing required metrics', () => {
    const dataset = buildDataset(countries, METRICS, observations, ['population', 'area']);
    assert.deepEqual(dataset.countries.map(c => c.iso2), ['CA']);
    const withoutArea = buildDataset(countries, METRICS, observations, ['population']);
    assert.deepEqual(withoutArea.countries.map(c => c.iso2), ['CA', 'NO']);
    assert.deepEqual(withoutArea.countries[1]!.metrics.population, { value: 5_500_000, year: 2024 });
    assert.deepEqual(withoutArea.countries[1]!.metrics.hdi, { value: 0.966, year: 2023 });
  });

  it('reports coverage problems', () => {
    const dataset = buildDataset(countries, METRICS, observations, ['population']);
    const problems = validateDataset(dataset, METRICS, { required: ['population'], minCountries: 3, minPerMetric: 1 });
    assert.ok(problems.some(p => p.startsWith('Only 2 countries')));
    assert.ok(problems.some(p => p.startsWith('gdp:')));
  });
});

describe('displayName', () => {
  it('prefers overrides, then CLDR names, then the fallback', () => {
    assert.equal(displayName('CD', 'Congo, Dem. Rep.'), 'DR Congo');
    assert.equal(displayName('EG', 'Egypt, Arab Rep.'), 'Egypt');
    assert.equal(displayName('JG', 'Channel Islands'), 'Channel Islands');
  });
});
