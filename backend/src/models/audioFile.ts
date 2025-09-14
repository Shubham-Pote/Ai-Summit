// models/audioFile.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAudioFile extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration: number;
  userId?: mongoose.Types.ObjectId;
  characterId?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  audioType: 'user_input' | 'character_response' | 'system';
  processingStatus: 'pending' | 'processed' | 'error';
  storageProvider: 'local' | 'aws' | 'gcp';
  storageLocation: string;
  publicUrl: string;
  expiresAt?: Date;
  isTemporary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AudioFileSchema: Schema = new Schema({
  filename: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  duration: { type: Number, default: 0 },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
  audioType: { 
    type: String, 
    enum: ['user_input', 'character_response', 'system'],
    required: true 
  },
  processingStatus: { 
    type: String, 
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  storageProvider: { 
    type: String, 
    enum: ['local', 'aws', 'gcp'],
    default: 'local'
  },
  storageLocation: { type: String, required: true },
  publicUrl: { type: String, required: true },
  expiresAt: { type: Date },
  isTemporary: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Auto-delete expired files
AudioFileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IAudioFile>('AudioFile', AudioFileSchema);
