import { Schema, model, type Document, type Types } from 'mongoose';

export type LogType = 'workout' | 'sleep' | 'mood' | 'hydration' | 'steps' | 'caffeine' | 'custom';

export interface LogDoc extends Document {
  userId: Types.ObjectId;
  type: LogType;
  value: number;
  unit?: string;
  note?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LogSchema = new Schema<LogDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    note: { type: String },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

LogSchema.index({ userId: 1, date: -1 });

export const Log = model<LogDoc>('Log', LogSchema);
