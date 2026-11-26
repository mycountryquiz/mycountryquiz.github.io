import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findMetric } from '../src/metrics.ts';
import { createRound, isDistinguishable, isPlayable } from '../src/quiz.ts';
import type { Country, Metric } from '../src/types.ts';

const metric = findMetric('literacy')!;

const country = (iso2: string, literacy?: number): Country => ({
  iso2,
  name: iso2,
  region: 'Test',
  flag: '',
  metrics: literacy === undefined ? {} : { literacy: { value: literacy } }
});

const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length]!;
};

describe('isDistinguishable', () => {
  it('rejects equal values', () => assert.equal(isDistinguishable(metric, country('AA', 99), country('BB', 99)), false));
  it('rejects values that format identically', () => assert.equal(isDistinguishable(metric, country('AA', 99.01), country('BB', 99.04)), false));
  it('rejects missing values', () => assert.equal(isDistinguishable(metric, country('AA'), country('BB', 50)), false));
  it('accepts distinct values', () => assert.equal(isDistinguishable(metric, country('AA', 98), country('BB', 99)), true));
});

describe('createRound', () => {
  it('picks the higher value as the answer', () => {
    const round = createRound(metric, [country('AA', 40), country('BB', 90)], sequence(0, 0.9));
    assert.ok(round);
    assert.equal(round.answer.iso2, 'BB');
  });

  it('never pairs a country with itself or a tie', () => {
    const pool = [country('AA', 50), country('BB', 50), country('CC', 70)];
    for (let i = 0; i < 200; i++) {
      const round = createRound(metric, pool);
      assert.ok(round);
      assert.notEqual(round.first.iso2, round.second.iso2);
      assert.ok(isDistinguishable(metric, round.first, round.second));
    }
  });

  it('returns null when no valid pair exists', () => {
    assert.equal(createRound(metric, [country('AA', 50), country('BB', 50)]), null);
    assert.equal(createRound(metric, [country('AA', 50), country('BB')]), null);
  });
});

describe('isPlayable', () => {
  const m: Metric = metric;
  it('requires at least two distinguishable values', () => {
    assert.equal(isPlayable(m, [country('AA', 50), country('BB', 50)]), false);
    assert.equal(isPlayable(m, [country('AA', 50), country('BB', 60)]), true);
  });
});
