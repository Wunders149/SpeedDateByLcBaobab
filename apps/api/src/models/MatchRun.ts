import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMatchRun extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  algorithmVersion: string;
  configurationSnapshot: {
    mode: string;
    minimumThreshold: number;
    dealBreakerAction: string;
    allowMultipleMatches: boolean;
    respectNoRepeat: boolean;
    categoryWeights: Record<string, number>;
  };
  questionnaireVersionId: mongoose.Types.ObjectId;
  status: 'pending' | 'generated' | 'finalized' | 'published';
  initiatedBy: mongoose.Types.ObjectId;
  generatedAt?: Date;
  finalizedAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const matchRunSchema = new Schema<IMatchRun>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    algorithmVersion: { type: String, required: true },
    configurationSnapshot: { type: Schema.Types.Mixed, required: true },
    questionnaireVersionId: { type: Schema.Types.ObjectId, ref: 'QuestionnaireVersion', required: true },
    status: {
      type: String,
      enum: ['pending', 'generated', 'finalized', 'published'],
      default: 'pending',
    },
    initiatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    generatedAt: { type: Date },
    finalizedAt: { type: Date },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

matchRunSchema.index({ eventId: 1, status: 1 });
matchRunSchema.index({ eventId: 1, createdAt: -1 });

export const MatchRun: Model<IMatchRun> = mongoose.model<IMatchRun>('MatchRun', matchRunSchema);
