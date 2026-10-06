import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IQuestionnaireResponse extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  questionnaireVersionId: mongoose.Types.ObjectId;
  answers: Array<{
    questionId: mongoose.Types.ObjectId;
    value: number | string | string[];
  }>;
  completionStatus: 'draft' | 'submitted';
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const questionnaireResponseSchema = new Schema<IQuestionnaireResponse>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionnaireVersionId: { type: Schema.Types.ObjectId, ref: 'QuestionnaireVersion', required: true },
    answers: [
      {
        questionId: { type: Schema.Types.ObjectId, ref: 'Question' },
        value: { type: Schema.Types.Mixed, required: true },
      },
    ],
    completionStatus: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft',
    },
    submittedAt: { type: Date },
  },
  { timestamps: true },
);

// One active response per participant per event per questionnaire version
questionnaireResponseSchema.index(
  { eventId: 1, participantId: 1, questionnaireVersionId: 1 },
  { unique: true },
);

export const QuestionnaireResponse: Model<IQuestionnaireResponse> = mongoose.model<IQuestionnaireResponse>(
  'QuestionnaireResponse',
  questionnaireResponseSchema,
);
