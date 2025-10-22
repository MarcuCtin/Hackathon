import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export async function chatWithAi(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
): Promise<string> {
  // Get Gemini model (gemini-1.5-flash is optimized for speed and cost)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });

  // Convert messages to Gemini format
  // Gemini uses a single prompt with context
  const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';
  const conversation = messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      const speaker = m.role === 'user' ? 'User' : 'Assistant';
      return `${speaker}: ${m.content}`;
    })
    .join('\n\n');

  // Combine system prompt with conversation
  const prompt = systemPrompt
    ? `${systemPrompt}\n\n${conversation}\n\nAssistant:`
    : `${conversation}\n\nAssistant:`;

  // Generate response
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return text || 'Sorry, I could not generate a response.';
}
