import type { Country, Metric } from './types.ts';

export interface Round {
  readonly metric: Metric;
  readonly first: Country;
  readonly second: Country;
  readonly answer: Country;
}

export type Random = () => number;

const MAX_ATTEMPTS = 200;

export const valueOf = (metric: Metric, country: Country): number | undefined => country.metrics[metric.id]?.value;

export const isDistinguishable = (metric: Metric, a: Country, b: Country): boolean => {
  const va = valueOf(metric, a);
  const vb = valueOf(metric, b);
  return va !== undefined && vb !== undefined && va !== vb && metric.format(va) !== metric.format(vb);
};

const candidatesFor = (metric: Metric, countries: readonly Country[]): Country[] =>
  countries.filter(c => valueOf(metric, c) !== undefined);

export const isPlayable = (metric: Metric, countries: readonly Country[]): boolean =>
  new Set(candidatesFor(metric, countries).map(c => metric.format(valueOf(metric, c)!))).size >= 2;

export const createRound = (metric: Metric, countries: readonly Country[], random: Random = Math.random): Round | null => {
  const pool = candidatesFor(metric, countries);
  if (pool.length < 2) return null;

  const pick = () => pool[Math.floor(random() * pool.length)]!;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const first = pick();
    const second = pick();
    if (first.iso2 !== second.iso2 && isDistinguishable(metric, first, second)) {
      const answer = valueOf(metric, first)! > valueOf(metric, second)! ? first : second;
      return { metric, first, second, answer };
    }
  }
  return null;
};
