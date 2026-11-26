import './style.css';
import { COUNTRIES } from './data.ts';
import { Feedback } from './feedback.ts';
import { DEFAULT_METRIC_ID, METRICS, findMetric } from './metrics.ts';
import { createRound, isPlayable, valueOf, type Round } from './quiz.ts';
import { EMPTY_STATS, loadState, saveState, type PersistedState } from './storage.ts';
import type { Country, Metric } from './types.ts';

const TEMPLATE = `
  <main class="game-container">
    <h1 class="game-title">🌍 Country Quiz</h1>
    <div class="controls">
      <select id="question-select" aria-label="Question category"></select>
      <button id="feedback-btn" type="button"></button>
      <button id="reset-btn" type="button">Reset</button>
    </div>
    <div class="score-display">
      <span class="score">Score: <span id="score">0/0</span></span>
      <span id="streak"></span>
      <span id="best-streak"></span>
    </div>
    <p id="question-text" class="question-text" aria-live="polite"></p>
    <div class="comparison-container">
      <button id="country1" type="button" class="country-card"></button>
      <div class="vs-badge" aria-hidden="true">VS</div>
      <button id="country2" type="button" class="country-card"></button>
    </div>
    <div id="result-message" class="result-message hidden" role="status"></div>
    <button id="next-btn" type="button" class="next-btn hidden">Next →</button>
    <footer class="attribution">Data: World Bank WDI · UNDP HDR via Our World in Data (CC BY 4.0)</footer>
  </main>
`;

type CardState = 'pending' | 'revealed' | 'correct' | 'wrong';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
};

class QuizApp {
  readonly #state: PersistedState;
  readonly #feedback: Feedback;
  readonly #metrics: readonly Metric[];
  #round: Round | null = null;
  #answered = false;

  readonly #question: HTMLElement;
  readonly #cards: readonly [HTMLButtonElement, HTMLButtonElement];
  readonly #result: HTMLElement;
  readonly #next: HTMLButtonElement;
  readonly #score: HTMLElement;
  readonly #streak: HTMLElement;
  readonly #best: HTMLElement;
  readonly #select: HTMLSelectElement;
  readonly #feedbackToggle: HTMLButtonElement;

  constructor(root: HTMLElement) {
    root.innerHTML = TEMPLATE;
    this.#state = loadState();
    this.#feedback = new Feedback(this.#state.feedbackEnabled);
    this.#metrics = METRICS.filter(m => isPlayable(m, COUNTRIES));

    this.#question = byId('question-text');
    this.#cards = [byId('country1'), byId('country2')];
    this.#result = byId('result-message');
    this.#next = byId('next-btn');
    this.#score = byId('score');
    this.#streak = byId('streak');
    this.#best = byId('best-streak');
    this.#select = byId('question-select');
    this.#feedbackToggle = byId('feedback-btn');

    this.#bind(byId('reset-btn'));
    this.#renderSelect();
    this.#renderFeedbackToggle();
    this.#renderScore();
    this.#nextRound();
  }

  #bind(reset: HTMLButtonElement): void {
    this.#cards.forEach((card, index) => card.addEventListener('click', () => this.#answer(index)));
    this.#next.addEventListener('click', () => {
      this.#feedback.play('tap');
      this.#nextRound();
    });
    reset.addEventListener('click', () => {
      this.#feedback.play('tap');
      this.#reset();
    });
    this.#feedbackToggle.addEventListener('click', () => this.#toggleFeedback());
    this.#select.addEventListener('change', () => {
      this.#feedback.play('tap');
      this.#state.selectedQuestionId = this.#select.value;
      this.#persist();
      this.#nextRound();
    });
  }

  get #metric(): Metric {
    return this.#metrics.find(m => m.id === this.#state.selectedQuestionId)
      ?? findMetric(DEFAULT_METRIC_ID)
      ?? METRICS[0]!;
  }

  #nextRound(): void {
    this.#round = createRound(this.#metric, COUNTRIES);
    this.#answered = false;
    this.#result.className = 'result-message hidden';
    this.#next.classList.add('hidden');

    if (!this.#round) {
      this.#question.textContent = 'Not enough data for this question type.';
      this.#cards.forEach(card => (card.hidden = true));
      return;
    }

    this.#question.textContent = this.#round.metric.question;
    this.#renderCard(this.#cards[0], this.#round.first, 'pending');
    this.#renderCard(this.#cards[1], this.#round.second, 'pending');
  }

  #answer(index: number): void {
    const round = this.#round;
    if (this.#answered || !round) return;
    this.#answered = true;

    const selected = index === 0 ? round.first : round.second;
    const correct = selected.iso2 === round.answer.iso2;
    this.#feedback.play(correct ? 'correct' : 'wrong');
    this.#record(correct);

    this.#result.textContent = correct ? '✓ Correct!' : `✗ Wrong! ${round.answer.name} was correct.`;
    this.#result.className = `result-message ${correct ? 'correct' : 'wrong'}`;

    const outcome: CardState = correct ? 'correct' : 'wrong';
    this.#renderCard(this.#cards[0], round.first, index === 0 ? outcome : 'revealed');
    this.#renderCard(this.#cards[1], round.second, index === 1 ? outcome : 'revealed');

    this.#next.classList.remove('hidden');
    this.#next.focus({ preventScroll: true });
    this.#renderScore();
    this.#persist();
  }

  #record(correct: boolean): void {
    this.#state.totalQuestions++;
    if (correct) {
      this.#state.correctAnswers++;
      this.#state.currentStreak++;
      this.#state.bestStreak = Math.max(this.#state.bestStreak, this.#state.currentStreak);
    } else {
      this.#state.currentStreak = 0;
    }
  }

  #reset(): void {
    if (!confirm('Reset all scores?')) return;
    Object.assign(this.#state, EMPTY_STATS);
    this.#persist();
    this.#renderScore();
    this.#nextRound();
  }

  #toggleFeedback(): void {
    this.#state.feedbackEnabled = !this.#state.feedbackEnabled;
    this.#feedback.enabled = this.#state.feedbackEnabled;
    this.#feedback.play('tap');
    this.#renderFeedbackToggle();
    this.#persist();
  }

  #persist(): void {
    saveState(this.#state);
  }

  #renderCard(card: HTMLButtonElement, country: Country, state: CardState): void {
    const revealed = state !== 'pending';
    card.hidden = false;
    card.disabled = revealed;
    card.className = state === 'correct' || state === 'wrong' ? `country-card ${state}` : 'country-card';

    const flag = document.createElement('span');
    flag.className = 'country-flag';
    flag.textContent = country.flag;
    flag.setAttribute('aria-hidden', 'true');

    const name = document.createElement('span');
    name.className = 'country-name';
    name.textContent = country.name;

    card.replaceChildren(flag, name);
    if (revealed && this.#round) card.append(this.#valueElement(this.#round.metric, country));
  }

  #valueElement(metric: Metric, country: Country): HTMLElement {
    const value = valueOf(metric, country);
    const year = country.metrics[metric.id]?.year;
    const element = document.createElement('span');
    element.className = 'value-reveal';
    element.textContent = value === undefined ? 'N/A' : `${metric.format(value)}${year ? ` (${year})` : ''}`;
    return element;
  }

  #renderSelect(): void {
    this.#select.replaceChildren(...this.#metrics.map(m => new Option(m.label, m.id, false, m.id === this.#metric.id)));
  }

  #renderFeedbackToggle(): void {
    const on = this.#state.feedbackEnabled;
    this.#feedbackToggle.textContent = on ? '🔊' : '🔇';
    this.#feedbackToggle.setAttribute('aria-pressed', String(on));
    this.#feedbackToggle.setAttribute('aria-label', on ? 'Sound and vibration on' : 'Sound and vibration off');
    this.#feedbackToggle.title = this.#feedbackToggle.getAttribute('aria-label')!;
  }

  #renderScore(): void {
    const s = this.#state;
    this.#score.textContent = `${s.correctAnswers}/${s.totalQuestions}`;
    this.#streak.textContent = s.currentStreak > 0 ? `🔥 ${s.currentStreak}` : '';
    this.#best.textContent = s.bestStreak > 0 ? `⭐ Best: ${s.bestStreak}` : '';
  }
}

const registerServiceWorker = (): void => {
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(e => console.warn('Service worker registration failed:', e));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  new QuizApp(byId('app'));
  registerServiceWorker();
});
