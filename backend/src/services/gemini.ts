import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
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
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
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

      // Return a valid JSON response instead of plain text error
      if (blocked) {
        console.error('Gemini blocked response:', blocked);
        return '{"message":"I apologize, but I need more information to help you safely. Could you please provide more details about what you would like to do?","actions":[]}';
      }
      return '{"message":"I had trouble processing that. Could you rephrase your request?","actions":[]}';
    }

    return text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'There was an issue contacting the AI. Please try again.';
  }
}

export default chatWithAi;
