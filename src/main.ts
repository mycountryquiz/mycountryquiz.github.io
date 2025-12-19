import './style.css';
import type { CountryData, QuestionType, GameState } from './data';
import { QUESTIONS, COUNTRIES } from './data';

// Storage keys
const STORAGE_KEY = 'countryQuizState';

// DOM Elements
let questionText: HTMLElement;
let country1Card: HTMLElement;
let country2Card: HTMLElement;
let resultMessage: HTMLElement;
let nextBtn: HTMLElement;
let scoreDisplay: HTMLElement;
let streakDisplay: HTMLElement;
let bestStreakDisplay: HTMLElement;
let questionSelect: HTMLElement;
let resetBtn: HTMLElement;

// Game state
let state: GameState = {
  correctAnswers: 0,
  totalQuestions: 0,
  currentStreak: 0,
  bestStreak: 0,
  hasAnswered: false,
  currentQuestion: null,
  country1: null,
  country2: null,
  correctCountry: null,
  selectedQuestionId: 'population'
};

function loadState(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.correctAnswers = parsed.correctAnswers ?? 0;
      state.totalQuestions = parsed.totalQuestions ?? 0;
      state.currentStreak = parsed.currentStreak ?? 0;
      state.bestStreak = parsed.bestStreak ?? 0;
      state.selectedQuestionId = parsed.selectedQuestionId ?? 'population';
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
}

function saveState(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      correctAnswers: state.correctAnswers,
      totalQuestions: state.totalQuestions,
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      selectedQuestionId: state.selectedQuestionId
    }));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

function getRandomPair(question: QuestionType): [CountryData, CountryData] | null {
  const valid = COUNTRIES.filter(c => question.getValue(c) !== null);
  if (valid.length < 2) return null;
  
  for (let i = 0; i < 100; i++) {
    const c1 = valid[Math.floor(Math.random() * valid.length)];
    const c2 = valid[Math.floor(Math.random() * valid.length)];
    if (c1.name !== c2.name && question.getValue(c1) !== question.getValue(c2)) {
      return [c1, c2];
    }
  }
  return null;
}

function getCorrectAnswer(q: QuestionType, c1: CountryData, c2: CountryData): CountryData {
  const v1 = q.getValue(c1) ?? 0;
  const v2 = q.getValue(c2) ?? 0;
  return v1 > v2 ? c1 : c2;
}

function formatValue(q: QuestionType, c: CountryData): string {
  const val = q.getValue(c);
  if (val === null) return 'N/A';
  return q.format(val);
}

function updateScoreDisplay(): void {
  scoreDisplay.textContent = `${state.correctAnswers}/${state.totalQuestions}`;
  streakDisplay.textContent = state.currentStreak > 0 ? `🔥 ${state.currentStreak}` : '';
  bestStreakDisplay.textContent = state.bestStreak > 0 ? `⭐ Best: ${state.bestStreak}` : '';
}

function renderCard(card: HTMLElement, country: CountryData, showValue: boolean, isCorrect: boolean | null, q: QuestionType): void {
  let cardClass = 'country-card';
  if (showValue) {
    cardClass += isCorrect ? ' correct' : ' wrong';
  }
  
  card.className = cardClass;
  card.innerHTML = `
    <div class="country-flag">${country.flag}</div>
    <div class="country-name">${country.name}</div>
    ${showValue ? `<div class="value-reveal">${formatValue(q, country)}</div>` : ''}
  `;
}

function nextRound(): void {
  const question = QUESTIONS.find(q => q.id === state.selectedQuestionId) ?? QUESTIONS[0];
  const pair = getRandomPair(question);
  
  if (!pair) {
    questionText.textContent = 'Not enough data for this question type.';
    return;
  }
  
  state.currentQuestion = question;
  state.country1 = pair[0];
  state.country2 = pair[1];
  state.correctCountry = getCorrectAnswer(question, pair[0], pair[1]);
  state.hasAnswered = false;
  
  questionText.textContent = question.template;
  renderCard(country1Card, state.country1, false, null, question);
  renderCard(country2Card, state.country2, false, null, question);
  
  resultMessage.className = 'result-message hidden';
  nextBtn.classList.add('hidden');
  
  country1Card.onclick = () => selectCountry(state.country1!);
  country2Card.onclick = () => selectCountry(state.country2!);
}

function selectCountry(selected: CountryData): void {
  if (state.hasAnswered || !state.currentQuestion || !state.country1 || !state.country2 || !state.correctCountry) return;
  
  state.hasAnswered = true;
  state.totalQuestions++;
  
  const isCorrect = selected.name === state.correctCountry.name;
  
  if (isCorrect) {
    state.correctAnswers++;
    state.currentStreak++;
    if (state.currentStreak > state.bestStreak) {
      state.bestStreak = state.currentStreak;
    }
    resultMessage.textContent = '✓ Correct!';
    resultMessage.className = 'result-message correct';
  } else {
    state.currentStreak = 0;
    resultMessage.textContent = `✗ Wrong! ${state.correctCountry.name} was correct.`;
    resultMessage.className = 'result-message wrong';
  }
  
  renderCard(country1Card, state.country1, true, state.country1.name === state.correctCountry.name, state.currentQuestion);
  renderCard(country2Card, state.country2, true, state.country2.name === state.correctCountry.name, state.currentQuestion);
  
  country1Card.onclick = null;
  country2Card.onclick = null;
  
  nextBtn.classList.remove('hidden');
  updateScoreDisplay();
  saveState();
}

function resetGame(): void {
  if (!confirm('Reset all scores?')) return;
  state.correctAnswers = 0;
  state.totalQuestions = 0;
  state.currentStreak = 0;
  state.bestStreak = 0;
  saveState();
  updateScoreDisplay();
  nextRound();
}

function initQuestionSelect(): void {
  questionSelect.innerHTML = QUESTIONS.map(q => 
    `<option value="${q.id}" ${q.id === state.selectedQuestionId ? 'selected' : ''}>${q.label}</option>`
  ).join('');
  
  questionSelect.addEventListener('change', (e) => {
    state.selectedQuestionId = (e.target as HTMLSelectElement).value;
    saveState();
    nextRound();
  });
}

function init(): void {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="game-container">
      <h1 class="game-title">🌍 Country Quiz</h1>
      
      <div class="controls">
        <select id="question-select"></select>
        <button id="reset-btn">Reset</button>
      </div>
      
      <div class="score-display">
        <span class="score">Score: <span id="score">0/0</span></span>
        <span id="streak"></span>
        <span id="best-streak"></span>
      </div>
      
      <p id="question-text" class="question-text"></p>
      
      <div class="comparison-container">
        <div id="country1" class="country-card"></div>
        <div class="vs-badge">VS</div>
        <div id="country2" class="country-card"></div>
      </div>
      
      <div id="result-message" class="result-message hidden"></div>
      
      <button id="next-btn" class="next-btn hidden">Next →</button>
    </div>
  `;
  
  questionText = document.getElementById('question-text')!;
  country1Card = document.getElementById('country1')!;
  country2Card = document.getElementById('country2')!;
  resultMessage = document.getElementById('result-message')!;
  nextBtn = document.getElementById('next-btn')!;
  scoreDisplay = document.getElementById('score')!;
  streakDisplay = document.getElementById('streak')!;
  bestStreakDisplay = document.getElementById('best-streak')!;
  questionSelect = document.getElementById('question-select')!;
  resetBtn = document.getElementById('reset-btn')!;
  
  loadState();
  initQuestionSelect();
  updateScoreDisplay();
  
  nextBtn.addEventListener('click', nextRound);
  resetBtn.addEventListener('click', resetGame);
  
  nextRound();
}

document.addEventListener('DOMContentLoaded', init);
