/**
 * gemini.js — Thin client for the Google Gemini API (Google AI Studio).
 * Get a free API key at https://aistudio.google.com/api-keys and set
 * GEMINI_API_KEY in backend/.env.
 */

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export const isGeminiConfigured = () => !!process.env.GEMINI_API_KEY;

/**
 * Call Gemini and return parsed JSON (responseMimeType is forced to JSON).
 * Retries once on transient failures (429/500/503).
 */
export async function generateJson({ systemInstruction, prompt, model = DEFAULT_MODEL, temperature = 0.4, maxOutputTokens = 65536 }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error('GEMINI_API_KEY is not configured. Create a key at https://aistudio.google.com/api-keys and add it to backend/.env');
    err.status = 503;
    throw err;
  }

  const body = {
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: 'application/json',
    },
  };

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${BASE_URL}/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err = new Error(`Gemini API error (${res.status}): ${extractApiError(text)}`);
        err.status = res.status;
        if ([429, 500, 503].includes(res.status) && attempt === 0) {
          lastError = err;
          await sleep(1500);
          continue;
        }
        throw err;
      }

      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const text = candidate?.content?.parts?.map((p) => p.text || '').join('') || '';
      if (!text) {
        const reason = candidate?.finishReason || data?.promptFeedback?.blockReason || 'empty response';
        throw new Error(`Gemini returned no content (${reason}).`);
      }
      return parseJsonLoose(text);
    } catch (err) {
      lastError = err;
      if (attempt === 0 && !err.status) {
        await sleep(1500);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function extractApiError(text) {
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message || text.slice(0, 300);
  } catch {
    return text.slice(0, 300);
  }
}

/** Parse JSON, tolerating markdown fences or leading prose. */
export function parseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch { /* fall through */ }
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1]); } catch { /* fall through */ }
  }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    return JSON.parse(text.slice(start, end + 1));
  }
  throw new Error('Gemini response was not valid JSON.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
