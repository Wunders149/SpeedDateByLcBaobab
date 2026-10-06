import mongoose, { Schema, Document, Model } from 'mongoose';
import { QuestionCategory, QuestionType, ScoringModel } from '@speed-date/shared';

export interface IQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  text: string;
  type: QuestionType;
  category: QuestionCategory;
  options: Array<{
    id: string;
    text: string;
    value?: number;
    weight?: number;
  }>;
  weight: number;
  scoringModel: ScoringModel;
  required: boolean;
  dealBreakerConfig?: {
    enabled: boolean;
    optionIds: string[];
    action: 'exclude' | 'flag';
  };
  tags: string[];
  displayOrder: number;
  active: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: Object.values(QuestionType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(QuestionCategory),
      required: true,
    },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        value: { type: Number },
        weight: { type: Number },
      },
    ],
    weight: { type: Number, default: 1, min: 0.1, max: 10 },
    scoringModel: {
      type: String,
      enum: Object.values(ScoringModel),
      default: ScoringModel.Similarity,
    },
    required: { type: Boolean, default: true },
    dealBreakerConfig: {
      enabled: { type: Boolean, default: false },
      optionIds: { type: [String], default: [] },
      action: { type: String, enum: ['exclude', 'flag'], default: 'exclude' },
    },
    tags: { type: [String], default: [] },
    displayOrder: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

questionSchema.index({ category: 1, active: 1 });
questionSchema.index({ displayOrder: 1 });

export const Question: Model<IQuestion> = mongoose.model<IQuestion>('Question', questionSchema);
