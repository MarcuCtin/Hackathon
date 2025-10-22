import { Schema, model, type Document, type Types } from 'mongoose';

export interface NutritionLogDoc extends Document {
  userId: Types.ObjectId;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: Array<{ name: string; calories: number; protein: number; carbs: number; fat: number }>;
  total: { calories: number; protein: number; carbs: number; fat: number };
  createdAt: Date;
  updatedAt: Date;
}

const NutritionLogSchema = new Schema<NutritionLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        calories: { type: Number, required: true },
        protein: { type: Number, required: true },
        carbs: { type: Number, required: true },
        fat: { type: Number, required: true },
      },
    ],
    total: {
      calories: { type: Number, required: true },
      protein: { type: Number, required: true },
      carbs: { type: Number, required: true },
      fat: { type: Number, required: true },
    },
  },
  { timestamps: true },
);

NutritionLogSchema.index({ userId: 1, date: -1 });

export const NutritionLog = model<NutritionLogDoc>('NutritionLog', NutritionLogSchema);
