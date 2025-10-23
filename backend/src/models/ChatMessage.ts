import { Schema, model, type Document } from 'mongoose';

export interface ChatMessageDoc extends Document {
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<ChatMessageDoc>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    sessionId: { type: String, index: true },
  },
  { timestamps: true },
);

ChatMessageSchema.index({ userId: 1, timestamp: -1 });
ChatMessageSchema.index({ sessionId: 1, timestamp: 1 });

export const ChatMessage = model<ChatMessageDoc>('ChatMessage', ChatMessageSchema);
