import { Schema, model, type Document } from 'mongoose';

export interface SuggestionDoc extends Document {
  userId: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'hydration' | 'wellness' | 'recovery';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'dismissed';
  emoji: string;
  actionText?: string;
  dismissText?: string;
  generatedAt: Date;
  expiresAt?: Date;
  completedAt?: Date;
  dismissedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<SuggestionDoc>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['nutrition', 'exercise', 'sleep', 'hydration', 'wellness', 'recovery'],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dismissed'],
      required: true,
      default: 'active',
      index: true,
    },
    emoji: { type: String, required: true },
    actionText: { type: String, default: "I'll do it" },
    dismissText: { type: String, default: 'Dismiss' },
    generatedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date },
    completedAt: { type: Date },
    dismissedAt: { type: Date },
  },
  { timestamps: true },
);

// Indexes for performance
SuggestionSchema.index({ userId: 1, status: 1, createdAt: -1 });
SuggestionSchema.index({ userId: 1, category: 1, status: 1 });
SuggestionSchema.index({ generatedAt: 1 });

export const Suggestion = model<SuggestionDoc>('Suggestion', SuggestionSchema);

