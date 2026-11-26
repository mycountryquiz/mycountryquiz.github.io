import { DEFAULT_METRIC_ID } from './metrics.ts';

export interface Stats {
  correctAnswers: number;
  totalQuestions: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Settings {
  selectedQuestionId: string;
  feedbackEnabled: boolean;
}

export type PersistedState = Stats & Settings;

const STORAGE_KEY = 'countryQuizState';

export const EMPTY_STATS: Readonly<Stats> = { correctAnswers: 0, totalQuestions: 0, currentStreak: 0, bestStreak: 0 };

const DEFAULTS: Readonly<PersistedState> = { ...EMPTY_STATS, selectedQuestionId: DEFAULT_METRIC_ID, feedbackEnabled: true };

const count = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : fallback;

export const loadState = (): PersistedState => {
  try {
    const parsed: Record<string, unknown> = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      correctAnswers: count(parsed['correctAnswers'], DEFAULTS.correctAnswers),
      totalQuestions: count(parsed['totalQuestions'], DEFAULTS.totalQuestions),
      currentStreak: count(parsed['currentStreak'], DEFAULTS.currentStreak),
      bestStreak: count(parsed['bestStreak'], DEFAULTS.bestStreak),
      selectedQuestionId: typeof parsed['selectedQuestionId'] === 'string' ? parsed['selectedQuestionId'] : DEFAULTS.selectedQuestionId,
      feedbackEnabled: typeof parsed['feedbackEnabled'] === 'boolean' ? parsed['feedbackEnabled'] : DEFAULTS.feedbackEnabled
    };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveState = (state: PersistedState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
};
