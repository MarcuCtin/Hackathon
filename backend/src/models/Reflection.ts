import { Schema, model, Document, Types } from 'mongoose';

export interface ReflectionDoc extends Document {
  userId: Types.ObjectId;
  date: Date; // Date for this reflection (day bucket at 00:00)
  mood:
    | 'calm'
    | 'stressed'
    | 'focused'
    | 'energized'
    | 'tired'
    | 'motivated'
    | 'anxious'
    | 'content';
  energyLevel: number; // 0-100
  stressLevel: number; // 0-100
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string; // Free text reflection
  createdAt: Date;
  updatedAt: Date;
}

const reflectionSchema = new Schema<ReflectionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    mood: {
      type: String,
      enum: [
        'calm',
        'stressed',
        'focused',
        'energized',
        'tired',
        'motivated',
        'anxious',
        'content',
      ],
      required: true,
    },
    energyLevel: { type: Number, min: 0, max: 100, required: true },
    stressLevel: { type: Number, min: 0, max: 100, required: true },
    sleepQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      required: true,
    },
    notes: { type: String, maxlength: 500 },
  },
  {
    timestamps: true,
  },
);

reflectionSchema.index({ userId: 1, date: -1 });

export const Reflection = model<ReflectionDoc>('Reflection', reflectionSchema);
