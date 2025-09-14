import mongoose from 'mongoose';

export interface INote extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  language: 'spanish' | 'japanese';
  topic: string;
  tags: string[];
  aiGenerated: boolean;
  lessonId?: mongoose.Types.ObjectId;
  starred: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  language: {
    type: String,
    enum: ['spanish', 'japanese'],
    required: true
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    enum: ['Grammar', 'Vocabulary', 'Culture', 'Pronunciation', 'Beginner', 'Intermediate', 'Advanced']
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiGenerated: {
    type: Boolean,
    default: false
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  starred: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

noteSchema.index({ userId: 1, language: 1 });
noteSchema.index({ userId: 1, starred: 1 });
noteSchema.index({ userId: 1, topic: 1 });
noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INote>('Note', noteSchema);
