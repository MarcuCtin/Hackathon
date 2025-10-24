import { Schema, model, type Document, type Types } from 'mongoose';

export interface AchievementDoc extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'wellness' | 'streak' | 'milestone';
  date: Date;
  icon?: string;
  progress?: number; // 0-100
  target?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<AchievementDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['nutrition', 'exercise', 'sleep', 'wellness', 'streak', 'milestone'],
      required: true,
    },
    date: { type: Date, required: true, index: true },
    icon: { type: String },
    progress: { type: Number, min: 0, max: 100 },
    target: { type: Number },
  },
  { timestamps: true },
);

AchievementSchema.index({ userId: 1, date: -1 });
AchievementSchema.index({ userId: 1, category: 1 });

export const Achievement = model<AchievementDoc>('Achievement', AchievementSchema);
