import mongoose, { Schema, Document, Model } from 'mongoose';
import { MatchStatus, QuestionCategory } from '@speed-date/shared';

export interface IMatch extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  matchRunId: mongoose.Types.ObjectId;
  participantAId: mongoose.Types.ObjectId;
  participantBId: mongoose.Types.ObjectId;
  directionalScoreAtoB: number;
  directionalScoreBtoA: number;
  mutualCompatibilityScore: number;
  categoryScores: Array<{
    category: QuestionCategory;
    score: number;
    weight: number;
    answeredCount: number;
    totalCount: number;
  }>;
  eligibilityMetadata: {
    eligible: boolean;
    exclusionReasons: string[];
  };
  matchStatus: MatchStatus;
  finalizationMetadata?: {
    finalizedAt: Date;
    finalizedBy: mongoose.Types.ObjectId;
    manuallyAdjusted: boolean;
    adjustedBy?: mongoose.Types.ObjectId;
    reason?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    matchRunId: { type: Schema.Types.ObjectId, ref: 'MatchRun', required: true },
    participantAId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participantBId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    directionalScoreAtoB: { type: Number, required: true, min: 0, max: 100 },
    directionalScoreBtoA: { type: Number, required: true, min: 0, max: 100 },
    mutualCompatibilityScore: { type: Number, required: true, min: 0, max: 100 },
    categoryScores: [
      {
        category: { type: String, required: true },
        score: { type: Number, required: true },
        weight: { type: Number, required: true },
        answeredCount: { type: Number, required: true },
        totalCount: { type: Number, required: true },
      },
    ],
    eligibilityMetadata: {
      eligible: { type: Boolean, required: true },
      exclusionReasons: { type: [String], default: [] },
    },
    matchStatus: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.Provisional,
    },
    finalizationMetadata: {
      finalizedAt: { type: Date },
      finalizedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      manuallyAdjusted: { type: Boolean, default: false },
      adjustedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      reason: { type: String },
    },
  },
  { timestamps: true },
);

// Ensure canonical ordering to prevent duplicate pairs
matchSchema.pre('save', async function () {
  const aId = this.participantAId?.toString() ?? '';
  const bId = this.participantBId?.toString() ?? '';
  if (aId > bId) {
    const temp = this.participantAId;
    this.participantAId = this.participantBId;
    this.participantBId = temp;
  }
});

matchSchema.index({ eventId: 1, matchRunId: 1 });
matchSchema.index({ participantAId: 1, eventId: 1 });
matchSchema.index({ participantBId: 1, eventId: 1 });
matchSchema.index({ eventId: 1, matchStatus: 1 });

export const Match: Model<IMatch> = mongoose.model<IMatch>('Match', matchSchema);
