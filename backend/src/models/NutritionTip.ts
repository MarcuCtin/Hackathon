import { Schema, model, type Document, type Types } from 'mongoose';

export interface NutritionTipDoc extends Document {
  userId: Types.ObjectId;
  content: string;
  category: 'protein' | 'calories' | 'hydration' | 'macros' | 'general';
  priority: 'high' | 'medium' | 'low';
  date: Date;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NutritionTipSchema = new Schema<NutritionTipDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['protein', 'calories', 'hydration', 'macros', 'general'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    date: { type: Date, required: true, index: true },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

NutritionTipSchema.index({ userId: 1, date: -1 });
NutritionTipSchema.index({ userId: 1, seen: 1 });

export const NutritionTip = model<NutritionTipDoc>('NutritionTip', NutritionTipSchema);
