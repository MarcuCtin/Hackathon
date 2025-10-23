import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export async function chatWithAi(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
): Promise<string> {
  // Extract system prompt (if present) and conversation
  const systemPrompt = messages.find((m) => m.role === 'system')?.content || '';

  // Convert messages to Gemini's format: { role: 'user' | 'model', parts: [{ text }] }
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  // Initialize model with system instruction
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash', // Use stable 1.5-flash model
    systemInstruction: systemPrompt || undefined,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 800, // Increased for structured JSON responses
    },
  });

  try {
    // Generate response
    const result = await model.generateContent({ contents });
    const response = result.response;

    // Try to get text from response
    const text =
      (typeof response.text === 'function' ? response.text() : '') ||
      response.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p.text ?? '')
        .join('') ||
      '';

    if (!text) {
      // Check if response was blocked
      const blocked =
        response.promptFeedback?.blockReason || response.candidates?.[0]?.finishReason;
      return blocked
        ? 'I could not answer that safely. Please rephrase.'
        : "I couldn't generate a response. Please try again.";
    }

    return text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'There was an issue contacting the AI. Please try again.';
  }
}

export default chatWithAi;
