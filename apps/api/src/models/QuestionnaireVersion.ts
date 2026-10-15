import mongoose, { Schema, Document, Model } from 'mongoose';
import { QuestionCategory } from '@speed-date/shared';

export interface IQuestionnaireVersion extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  version: number;
  questionSnapshots: Array<{
    questionId: mongoose.Types.ObjectId;
    text: string;
    type: string;
    category: QuestionCategory;
    options: Array<{ id: string; text: string; value?: number; weight?: number }>;
    weight: number;
    scoringModel: string;
    required: boolean;
    dealBreakerConfig?: { enabled: boolean; optionIds: string[]; action: string };
    tags: string[];
    displayOrder: number;
  }>;
  categoryWeights: Record<QuestionCategory, number>;
  completionThreshold: number;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionnaireVersionSchema = new Schema<IQuestionnaireVersion>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    version: { type: Number, required: true },
    questionSnapshots: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
        text: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        options: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true },
            value: { type: Number },
            weight: { type: Number },
          },
        ],
        weight: { type: Number, required: true },
        scoringModel: { type: String, required: true },
        required: { type: Boolean, required: true },
        dealBreakerConfig: {
          enabled: { type: Boolean },
          optionIds: { type: [String] },
          action: { type: String },
        },
        tags: { type: [String] },
        displayOrder: { type: Number },
      },
    ],
    categoryWeights: { type: Schema.Types.Mixed, required: true },
    completionThreshold: { type: Number, default: 0.8, min: 0, max: 1 },
    publishedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

questionnaireVersionSchema.index({ eventId: 1, version: -1 });

export const QuestionnaireVersion: Model<IQuestionnaireVersion> =
  mongoose.model<IQuestionnaireVersion>('QuestionnaireVersion', questionnaireVersionSchema);
