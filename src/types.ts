export type MetricId =
  | 'population'
  | 'area'
  | 'gdp'
  | 'gdp_per_capita'
  | 'gni_per_capita_ppp'
  | 'density'
  | 'literacy'
  | 'hdi'
  | 'life_expectancy'
  | 'fertility'
  | 'urban_population'
  | 'internet_users'
  | 'forest_area';

export type MetricSource =
  | { readonly kind: 'worldBank'; readonly indicator: string }
  | { readonly kind: 'owid'; readonly chart: string };

export interface Metric {
  readonly id: MetricId;
  readonly label: string;
  readonly question: string;
  readonly precision: number;
  readonly source: MetricSource;
  readonly format: (value: number) => string;
}

export interface Observation {
  value: number;
  year?: number;
}

export interface CountryRecord {
  iso2: string;
  iso3?: string;
  name: string;
  region: string;
  metrics: Partial<Record<MetricId, Observation>>;
}

export interface Dataset {
  countries: CountryRecord[];
}

export interface Country extends CountryRecord {
  flag: string;
}
