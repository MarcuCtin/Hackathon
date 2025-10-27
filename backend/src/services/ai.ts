import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Content,
} from '@google/generative-ai';
import { loadEnv } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const env = loadEnv();

const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

type Role = 'system' | 'user' | 'assistant';

function toContents(messages: Array<{ role: Role; content: string }>): {
  systemInstruction?: string;
  contents: Content[];
} {
  const systemMsg = messages.find((m) => m.role === 'system')?.content;
  const rest = messages.filter((m) => m.role !== 'system');

  const MAX_CHARS = 8000;
  const MAX_TURNS = 12;
  let accLen = 0;
  const selected = [] as typeof rest;
  for (let i = rest.length - 1; i >= 0 && selected.length < MAX_TURNS; i--) {
    const m = rest[i]!;
    accLen += m.content.length;
    if (accLen > MAX_CHARS) break;
    selected.unshift(m);
  }

  const contents: Content[] = selected.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return { systemInstruction: systemMsg, contents };
}

async function generateOnce(params: {
  messages: Array<{ role: Role; content: string }>;
  model?: string;
}) {
  const { systemInstruction, contents } = toContents(params.messages);

  const model = genAI.getGenerativeModel({
    model: params.model ?? env.GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      temperature: env.GEMINI_TEMPERATURE,
      maxOutputTokens: env.GEMINI_MAX_TOKENS,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  });

  const result = await model.generateContent({ contents });
  const text = result.response.text();
  return text?.trim() ?? '';
}

export async function chatWithAi(
  messages: Array<{ role: Role; content: string }>,
): Promise<string> {
  const SUPPORTED_MODELS = new Set(['gemini-2.5-flash', 'gemini-2.5-pro']);

  const normalizeModel = (m: string): string => (SUPPORTED_MODELS.has(m) ? m : 'gemini-2.5-flash');

  const primary = normalizeModel(env.GEMINI_MODEL);
  const models = [primary, 'gemini-2.5-pro', 'gemini-2.5-flash'];

  let lastErr: unknown;
  for (const [i, m] of models.entries()) {
    try {
      const reply = await generateOnce({ messages, model: m });
      if (reply) return reply;
      lastErr = new Error('Empty response');
    } catch (err) {
      lastErr = err;
      if (i < models.length - 1) await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }

  throw new AppError(502, 'AI provider unavailable', 'AI_UNAVAILABLE', { error: String(lastErr) });
}
