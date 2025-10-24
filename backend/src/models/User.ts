import { Schema, model, type Document } from 'mongoose';

export interface UserDoc extends Document {
  email: string;
  passwordHash: string;
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goals?: string[];
  activityLevel?: 'beginner' | 'intermediate' | 'advanced';
  onboardingAnswers?: string[];
  completedOnboarding?: boolean;
  identityComplete?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDoc>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    age: { type: Number },
    heightCm: { type: Number },
    weightKg: { type: Number },
    goals: [{ type: String }],
    activityLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    onboardingAnswers: [{ type: String }],
    completedOnboarding: { type: Boolean, default: false },
    identityComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 }, { unique: true });

export const User = model<UserDoc>('User', UserSchema);
