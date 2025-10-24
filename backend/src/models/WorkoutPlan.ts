import { Schema, model, type Document } from 'mongoose';

export interface Exercise {
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string; // e.g., "10-12" or "12"
  notes?: string;
}

export interface WorkoutDay {
  day: string; // e.g., "Monday", "Day 1"
  exercises: Exercise[];
  restDay?: boolean;
}

export interface WorkoutPlanDoc extends Document {
  userId: string;
  planName: string;
  description: string;
  days: WorkoutDay[];
  duration: number; // weeks
  level: 'beginner' | 'intermediate' | 'advanced';
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanSchema = new Schema<WorkoutPlanDoc>(
  {
    userId: { type: String, required: true, index: true },
    planName: { type: String, required: true },
    description: { type: String, required: true },
    days: [
      {
        day: { type: String, required: true },
        exercises: [
          {
            name: { type: String, required: true },
            muscleGroup: { type: String, required: true },
            sets: { type: Number, required: true },
            reps: { type: String, required: true },
            notes: { type: String },
          },
        ],
        restDay: { type: Boolean, default: false },
      },
    ],
    duration: { type: Number, required: true },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    generatedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

WorkoutPlanSchema.index({ userId: 1, createdAt: -1 });
WorkoutPlanSchema.index({ userId: 1, level: 1 });

export const WorkoutPlan = model<WorkoutPlanDoc>('WorkoutPlan', WorkoutPlanSchema);

