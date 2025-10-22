import OpenAI from 'openai';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export async function chatWithAi(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
): Promise<string> {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  });
  return res.choices[0]?.message?.content ?? '';
}
