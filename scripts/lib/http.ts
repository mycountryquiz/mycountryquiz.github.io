const USER_AGENT = 'mycountryquiz-data-updater (+https://github.com/mycountryquiz/mycountryquiz.github.io)';
const TIMEOUT_MS = 60_000;
const ATTEMPTS = 4;

const isRetryable = (status: number): boolean => status === 429 || status >= 500;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchText = async (url: string): Promise<string> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (response.ok) return await response.text();
      lastError = new Error(`${response.status} ${response.statusText} for ${url}`);
      if (!isRetryable(response.status)) break;
    } catch (error) {
      lastError = error;
    }
    if (attempt < ATTEMPTS) await sleep(1000 * 2 ** attempt);
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to fetch ${url}`);
};

export const fetchJson = async <T>(url: string): Promise<T> => JSON.parse(await fetchText(url)) as T;
