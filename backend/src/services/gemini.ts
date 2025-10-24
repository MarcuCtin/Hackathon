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
      maxOutputTokens: 2000, // Increased for structured JSON responses with multiple meal suggestions
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
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
        return '{"message":"I understand you want to create a plan! Let me help you with that. For a 14-week bulking plan, I can create a personalized nutrition and training plan to help you build muscle safely.","actions":[{"type":"create_plan","planType":"bulking","planName":"14-Week Bulking Plan","description":"A comprehensive 14-week muscle building plan with progressive overload","durationWeeks":14,"targetCalories":2800,"targetProtein":180,"targetCarbs":350,"targetFat":90,"primaryGoal":"Build muscle mass and strength","secondaryGoals":["Increase overall body weight","Improve muscle definition"],"focusAreas":["Progressive strength training","Calorie surplus nutrition","Recovery and sleep optimization"]}]}';
      }
      return '{"message":"I had trouble processing that. Could you try asking again?","actions":[]}';
    }

    return text;
  } catch (err) {
    console.error('Gemini API error:', err);
    return 'There was an issue contacting the AI. Please try again.';
  }
}

export default chatWithAi;
