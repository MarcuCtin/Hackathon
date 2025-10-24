import { Schema, model, type Document, type Types } from 'mongoose';

export interface UserTargetsDoc extends Document {
  userId: Types.ObjectId;
  // Macronutrients
  calories: { target: number; current: number };
  protein: { target: number; current: number };
  carbs: { target: number; current: number };
  fat: { target: number; current: number };

  // Micronutrients
  vitaminD: { target: number; current: number };
  calcium: { target: number; current: number };
  magnesium: { target: number; current: number };
  iron: { target: number; current: number };
  zinc: { target: number; current: number };
  omega3: { target: number; current: number };
  b12: { target: number; current: number };
  folate: { target: number; current: number };

  // Other metrics
  water: { target: number; current: number };
  caffeine: { target: number; current: number };

  // AI suggestions
  suggestedByAi: boolean;
  aiReason?: string; // Why AI suggested these targets

  createdAt: Date;
  updatedAt: Date;
}

const UserTargetsSchema = new Schema<UserTargetsDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },

    // Macronutrients
    calories: {
      target: { type: Number, default: 2000 },
      current: { type: Number, default: 0 },
    },
    protein: {
      target: { type: Number, default: 120 },
      current: { type: Number, default: 0 },
    },
    carbs: {
      target: { type: Number, default: 250 },
      current: { type: Number, default: 0 },
    },
    fat: {
      target: { type: Number, default: 70 },
      current: { type: Number, default: 0 },
    },

    // Micronutrients
    vitaminD: {
      target: { type: Number, default: 15 },
      current: { type: Number, default: 0 },
    },
    calcium: {
      target: { type: Number, default: 1000 },
      current: { type: Number, default: 0 },
    },
    magnesium: {
      target: { type: Number, default: 400 },
      current: { type: Number, default: 0 },
    },
    iron: {
      target: { type: Number, default: 18 },
      current: { type: Number, default: 0 },
    },
    zinc: {
      target: { type: Number, default: 11 },
      current: { type: Number, default: 0 },
    },
    omega3: {
      target: { type: Number, default: 1000 },
      current: { type: Number, default: 0 },
    },
    b12: {
      target: { type: Number, default: 2.4 },
      current: { type: Number, default: 0 },
    },
    folate: {
      target: { type: Number, default: 400 },
      current: { type: Number, default: 0 },
    },

    // Other metrics
    water: {
      target: { type: Number, default: 3 },
      current: { type: Number, default: 0 },
    },
    caffeine: {
      target: { type: Number, default: 400 },
      current: { type: Number, default: 0 },
    },

    // AI suggestions
    suggestedByAi: { type: Boolean, default: false },
    aiReason: { type: String },
  },
  { timestamps: true },
);

UserTargetsSchema.index({ userId: 1 });

export const UserTargets = model<UserTargetsDoc>('UserTargets', UserTargetsSchema);
