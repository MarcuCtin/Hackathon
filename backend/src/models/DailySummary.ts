import { Schema, model, type Document, type Types } from 'mongoose';

export interface DailySummaryDoc extends Document {
  userId: Types.ObjectId;
  date: Date; // day bucket (00:00)
  totals: { calories: number; protein: number; carbs: number; fat: number };
  logs: { workouts: number; sleepHours: number; steps: number };
  insights: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<DailySummaryDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    totals: {
      calories: { type: Number, required: true, default: 0 },
      protein: { type: Number, required: true, default: 0 },
      carbs: { type: Number, required: true, default: 0 },
      fat: { type: Number, required: true, default: 0 },
    },
    logs: {
      workouts: { type: Number, required: true, default: 0 },
      sleepHours: { type: Number, required: true, default: 0 },
      steps: { type: Number, required: true, default: 0 },
    },
    insights: [{ type: String }],
  },
  { timestamps: true },
);

DailySummarySchema.index({ userId: 1, date: -1 }, { unique: true });

export const DailySummary = model<DailySummaryDoc>('DailySummary', DailySummarySchema);
