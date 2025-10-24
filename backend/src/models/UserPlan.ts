import { Schema, model, type Document, type Types } from 'mongoose';

export type PlanType = 'cutting' | 'bulking' | 'maintenance' | 'healing' | 'custom';
export type PlanStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface UserPlanDoc extends Document {
  userId: Types.ObjectId;
  planType: PlanType;
  planName: string; // e.g., "12 Week Cutting Plan"
  description?: string;
  durationWeeks: number;
  startDate: Date;
  endDate: Date;
  status: PlanStatus;

  // AI generated configuration
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;

  // Goals and focus areas
  primaryGoal: string; // e.g., "lose 10kg"
  secondaryGoals?: string[];
  focusAreas?: string[]; // e.g., ["muscle preservation", "strength"]

  // AI conversation context
  aiConversationHistory?: Array<{
    question: string;
    answer: string;
    timestamp: Date;
  }>;

  // Progress tracking
  weeklyProgress?: Array<{
    week: number;
    actualCalories: number;
    actualProtein: number;
    notes?: string;
    timestamp: Date;
  }>;

  createdAt: Date;
  updatedAt: Date;
}

const UserPlanSchema = new Schema<UserPlanDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planType: {
      type: String,
      enum: ['cutting', 'bulking', 'maintenance', 'healing', 'custom'],
      required: true,
    },
    planName: { type: String, required: true },
    description: { type: String },
    durationWeeks: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
    },

    // AI generated configuration
    targetCalories: { type: Number, required: true },
    targetProtein: { type: Number, required: true },
    targetCarbs: { type: Number, required: true },
    targetFat: { type: Number, required: true },

    // Goals
    primaryGoal: { type: String, required: true },
    secondaryGoals: [{ type: String }],
    focusAreas: [{ type: String }],

    // AI conversation history
    aiConversationHistory: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Progress tracking
    weeklyProgress: [
      {
        week: { type: Number, required: true },
        actualCalories: { type: Number },
        actualProtein: { type: Number },
        notes: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

UserPlanSchema.index({ userId: 1, status: 1 });
UserPlanSchema.index({ userId: 1, startDate: -1 });

export const UserPlan = model<UserPlanDoc>('UserPlan', UserPlanSchema);
