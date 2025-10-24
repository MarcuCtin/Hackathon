import { Schema, model, type Document, type Types } from 'mongoose';

export interface DailyTaskDoc extends Document {
  userId: Types.ObjectId;
  title: string;
  scheduledTime: string; // HH:MM format
  completed: boolean;
  completedAt?: Date;
  date: Date; // Date for which this task is scheduled
  category?: 'wellness' | 'nutrition' | 'exercise' | 'supplements' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}

const DailyTaskSchema = new Schema<DailyTaskDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    scheduledTime: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    date: { type: Date, required: true, index: true },
    category: {
      type: String,
      enum: ['wellness', 'nutrition', 'exercise', 'supplements', 'custom'],
      default: 'custom',
    },
  },
  { timestamps: true },
);

DailyTaskSchema.index({ userId: 1, date: -1 });
DailyTaskSchema.index({ userId: 1, completed: 1 });

export const DailyTask = model<DailyTaskDoc>('DailyTask', DailyTaskSchema);
