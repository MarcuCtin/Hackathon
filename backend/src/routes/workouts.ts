import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { chatWithAi } from '../services/gemini.js';

const router = Router();

// Generate a personalized workout plan
router.post(
  '/generate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).lean();
    if (!user) {
      return void res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // Get user's goals and fitness level
    const goals = user.goals?.join(', ') || 'general fitness';
    const level = user.activityLevel || 'intermediate';
    const age = user.age || 30;
    const weight = user.weightKg || 70;

    // Create system prompt for AI
    const systemPrompt = `You are a professional fitness coach. Generate a personalized workout plan based on user information.

User Profile:
- Goals: ${goals}
- Fitness Level: ${level}
- Age: ${age}
- Weight: ${weight}kg

Create a workout plan with the following structure:
- Duration: 4 weeks
- Days per week: Based on fitness level (beginner: 3 days, intermediate: 4 days, advanced: 5-6 days)
- Include 1-2 rest days per week
- Each workout day should focus on specific muscle groups
- Provide 4-6 exercises per workout day
- Include sets and reps for each exercise

Return ONLY a JSON object with this exact format:
{
  "planName": "Personalized Workout Plan",
  "description": "Brief description of the plan",
  "duration": 4,
  "level": "${level}",
  "days": [
    {
      "day": "Monday",
      "restDay": false,
      "exercises": [
        {
          "name": "Bench Press",
          "muscleGroup": "Chest",
          "sets": 4,
          "reps": "8-10",
          "notes": "Focus on controlled movement"
        }
      ]
    },
    {
      "day": "Tuesday",
      "restDay": true,
      "exercises": []
    }
  ]
}

Important:
- Mix different muscle groups across days
- Vary rep ranges based on goals (strength: 3-6 reps, hypertrophy: 8-12 reps, endurance: 12+ reps)
- Include compound movements
- Progress overload recommendations`;

    try {
      const aiResponse = await chatWithAi([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate a personalized workout plan for me.' },
      ]);

      // Parse AI response
      let workoutPlan: {
        planName: string;
        description: string;
        duration: number;
        level: 'beginner' | 'intermediate' | 'advanced';
        days: Array<{
          day: string;
          restDay?: boolean;
          exercises: Array<{
            name: string;
            muscleGroup: string;
            sets: number;
            reps: string;
            notes?: string;
          }>;
        }>;
      };

      try {
        workoutPlan = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI workout plan:', parseError);
        return void res.status(500).json({
          success: false,
          error: { message: 'Failed to generate workout plan' },
        });
      }

      // Save workout plan to database
      const savedPlan = await WorkoutPlan.create({
        userId: req.userId,
        planName: workoutPlan.planName,
        description: workoutPlan.description,
        days: workoutPlan.days,
        duration: workoutPlan.duration,
        level: workoutPlan.level,
        generatedAt: new Date(),
      });

      void res.json({ success: true, data: savedPlan });
    } catch (error) {
      console.error('Error generating workout plan:', error);
      void res.status(500).json({
        success: false,
        error: { message: 'Failed to generate workout plan' },
      });
    }
  }),
);

// Get user's workout plans
router.get(
  '/plans',
  requireAuth,
  asyncHandler(async (req, res) => {
    const plans = await WorkoutPlan.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    void res.json({ success: true, data: plans });
  }),
);

// Get a specific workout plan
router.get(
  '/plans/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const plan = await WorkoutPlan.findOne({ _id: id, userId: req.userId }).lean();

    if (!plan) {
      return void res.status(404).json({
        success: false,
        error: { message: 'Workout plan not found' },
      });
    }

    void res.json({ success: true, data: plan });
  }),
);

export default router;




