import mongoose, { Schema, Document, Model } from 'mongoose';
import { SessionStatus } from '@speed-date/shared';

export interface ISpeedDatingSession extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  name: string;
  rounds: number;
  schedule: Array<{
    round: number;
    participantAId: mongoose.Types.ObjectId;
    participantBId: mongoose.Types.ObjectId;
    tableNumber?: number;
    startTime: Date;
    endTime: Date;
  }>;
  startAt: Date;
  endAt: Date;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const speedDatingSessionSchema = new Schema<ISpeedDatingSession>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    rounds: { type: Number, required: true, min: 1 },
    schedule: [
      {
        round: { type: Number, required: true },
        participantAId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        participantBId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tableNumber: { type: Number },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
      },
    ],
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.Scheduled,
    },
  },
  { timestamps: true },
);

speedDatingSessionSchema.index({ eventId: 1, status: 1 });

export const SpeedDatingSession: Model<ISpeedDatingSession> = mongoose.model<ISpeedDatingSession>(
  'SpeedDatingSession',
  speedDatingSessionSchema,
);
