import { Schema, model, type Document, type Types } from 'mongoose';

export interface SupplementLogDoc extends Document {
  userId: Types.ObjectId;
  supplementId: Types.ObjectId;
  supplementName: string;
  date: Date;
  dosage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplementLogSchema = new Schema<SupplementLogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    supplementId: { type: Schema.Types.ObjectId, ref: 'Supplement', required: true },
    supplementName: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    dosage: { type: String },
    notes: { type: String },
  },
  { timestamps: true },
);

SupplementLogSchema.index({ userId: 1, date: -1 });
SupplementLogSchema.index({ supplementId: 1 });

export const SupplementLog = model<SupplementLogDoc>('SupplementLog', SupplementLogSchema);
