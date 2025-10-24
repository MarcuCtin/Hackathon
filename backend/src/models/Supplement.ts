import { Schema, model, type Document, type Types } from 'mongoose';

export interface SupplementDoc extends Document {
  userId: Types.ObjectId;
  name: string;
  benefit: string; // e.g., "for recovery", "for heart health"
  description: string;
  dosage?: string;
  frequency?: string; // daily, weekly, etc.
  addedToPlan: boolean;
  icon?: string;
  category?: 'recovery' | 'immunity' | 'energy' | 'focus' | 'heart' | 'general';
  nutrients?: {
    vitaminD?: number; // mcg
    calcium?: number; // mg
    magnesium?: number; // mg
    iron?: number; // mg
    zinc?: number; // mg
    omega3?: number; // mg
    b12?: number; // mcg
    folate?: number; // mcg
    [key: string]: number | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SupplementSchema = new Schema<SupplementDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    benefit: { type: String, required: true },
    description: { type: String, required: true },
    dosage: { type: String },
    frequency: { type: String },
    addedToPlan: { type: Boolean, default: false },
    icon: { type: String },
    category: {
      type: String,
      enum: ['recovery', 'immunity', 'energy', 'focus', 'heart', 'general'],
      default: 'general',
    },
    nutrients: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

SupplementSchema.index({ userId: 1, addedToPlan: 1 });
SupplementSchema.index({ userId: 1, category: 1 });

export const Supplement = model<SupplementDoc>('Supplement', SupplementSchema);
