import mongoose, { Schema, Document, Model } from 'mongoose';
import { InterestStatus } from '@speed-date/shared';

export interface IInterest extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  fromParticipantId: mongoose.Types.ObjectId;
  toParticipantId: mongoose.Types.ObjectId;
  status: InterestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const interestSchema = new Schema<IInterest>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    fromParticipantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toParticipantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(InterestStatus),
      default: InterestStatus.Pending,
    },
  },
  { timestamps: true },
);

// Unique directional pair per event
interestSchema.index({ eventId: 1, fromParticipantId: 1, toParticipantId: 1 }, { unique: true });

export const Interest: Model<IInterest> = mongoose.model<IInterest>('Interest', interestSchema);
