import type { Metric, MetricId } from './types.ts';

const number = (digits: number) =>
  new Intl.NumberFormat(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
const usd = (options: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', ...options });

const integer = number(0);
const oneDecimal = number(1);
const twoDecimals = number(2);
const threeDecimals = number(3);
const usdCompact = usd({ notation: 'compact', maximumFractionDigits: 2 });
const usdWhole = usd({ maximumFractionDigits: 0 });

const worldBank = (indicator: string) => ({ kind: 'worldBank', indicator }) as const;
const percent = (v: number) => `${oneDecimal.format(v)}%`;

export const METRICS: readonly Metric[] = [
  {
    id: 'population', label: 'Population', question: 'Which country has a larger population?',
    precision: 0, source: worldBank('SP.POP.TOTL'), format: v => integer.format(v)
  },
  {
    id: 'area', label: 'Area', question: 'Which country is larger by area?',
    precision: 0, source: worldBank('AG.SRF.TOTL.K2'), format: v => `${integer.format(v)} km²`
  },
  {
    id: 'gdp', label: 'GDP', question: 'Which country has a higher GDP?',
    precision: 0, source: worldBank('NY.GDP.MKTP.CD'), format: v => usdCompact.format(v)
  },
  {
    id: 'gdp_per_capita', label: 'GDP per Capita', question: 'Which country has a higher GDP per capita?',
    precision: 0, source: worldBank('NY.GDP.PCAP.CD'), format: v => usdWhole.format(v)
  },
  {
    id: 'gni_per_capita_ppp', label: 'GNI per Capita (PPP)', question: 'Which country has a higher GNI per capita (PPP)?',
    precision: 0, source: worldBank('NY.GNP.PCAP.PP.CD'), format: v => `${usdWhole.format(v)} PPP`
  },
  {
    id: 'density', label: 'Pop. Density', question: 'Which country has a higher population density?',
    precision: 1, source: worldBank('EN.POP.DNST'), format: v => `${oneDecimal.format(v)}/km²`
  },
  {
    id: 'literacy', label: 'Literacy Rate', question: 'Which country has a higher adult literacy rate?',
    precision: 1, source: worldBank('SE.ADT.LITR.ZS'), format: percent
  },
  {
    id: 'hdi', label: 'HDI', question: 'Which country has a higher Human Development Index?',
    precision: 3, source: { kind: 'owid', chart: 'human-development-index' }, format: v => threeDecimals.format(v)
  },
  {
    id: 'life_expectancy', label: 'Life Expectancy', question: 'Which country has a higher life expectancy?',
    precision: 1, source: worldBank('SP.DYN.LE00.IN'), format: v => `${oneDecimal.format(v)} years`
  },
  {
    id: 'fertility', label: 'Fertility Rate', question: 'Which country has a higher fertility rate?',
    precision: 2, source: worldBank('SP.DYN.TFRT.IN'), format: v => `${twoDecimals.format(v)} births/woman`
  },
  {
    id: 'urban_population', label: 'Urbanization', question: 'Which country has a higher share of people living in cities?',
    precision: 1, source: worldBank('SP.URB.TOTL.IN.ZS'), format: percent
  },
  {
    id: 'internet_users', label: 'Internet Use', question: 'Which country has a higher share of internet users?',
    precision: 1, source: worldBank('IT.NET.USER.ZS'), format: percent
  },
  {
    id: 'forest_area', label: 'Forest Cover', question: 'Which country has a higher share of land covered by forest?',
    precision: 1, source: worldBank('AG.LND.FRST.ZS'), format: percent
  }
];

export const DEFAULT_METRIC_ID: MetricId = 'population';

export const findMetric = (id: string): Metric | undefined => METRICS.find(m => m.id === id);
