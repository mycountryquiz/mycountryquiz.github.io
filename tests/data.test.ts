import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { COUNTRIES, toFlag } from '../src/data.ts';
import { METRICS } from '../src/metrics.ts';
import { isPlayable } from '../src/quiz.ts';

describe('bundled dataset', () => {
  it('has unique ISO codes', () => assert.equal(new Set(COUNTRIES.map(c => c.iso2)).size, COUNTRIES.length));

  it('has valid ISO 3166-1 alpha-2 codes and names', () => {
    for (const c of COUNTRIES) {
      assert.match(c.iso2, /^[A-Z]{2}$/);
      assert.ok(c.name.trim().length > 0);
    }
  });

  it('only contains finite metric values for known metrics', () => {
    const known = new Set<string>(METRICS.map(m => m.id));
    for (const c of COUNTRIES) {
      for (const [id, observation] of Object.entries(c.metrics)) {
        assert.ok(known.has(id), `${c.iso2} has unknown metric ${id}`);
        assert.ok(Number.isFinite(observation.value), `${c.iso2}.${id} is not finite`);
      }
    }
  });

  it('keeps the core categories playable', () => {
    for (const id of ['population', 'area', 'gdp', 'life_expectancy']) {
      assert.ok(isPlayable(METRICS.find(m => m.id === id)!, COUNTRIES), id);
    }
  });
});

describe('toFlag', () => {
  it('builds regional indicator flags', () => assert.equal(toFlag('ca'), '🇨🇦'));
});
