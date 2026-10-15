import mongoose, { Schema, Document, Model } from 'mongoose';
import { RegistrationStatus } from '@speed-date/shared';

export interface IRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  registrationStatus: RegistrationStatus;
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'waitlisted';
  questionnaireStatus: 'not_started' | 'in_progress' | 'submitted';
  checkInStatus: 'not_checked_in' | 'checked_in';
  registeredAt: Date;
  approvedAt?: Date;
  checkedInAt?: Date;
  withdrawalAt?: Date;
  organizerMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationStatus: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.Submitted,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'waitlisted'],
      default: 'pending',
    },
    questionnaireStatus: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted'],
      default: 'not_started',
    },
    checkInStatus: {
      type: String,
      enum: ['not_checked_in', 'checked_in'],
      default: 'not_checked_in',
    },
    registeredAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    checkedInAt: { type: Date },
    withdrawalAt: { type: Date },
    organizerMessage: { type: String },
  },
  { timestamps: true },
);

// Prevent duplicate registrations
registrationSchema.index({ eventId: 1, participantId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, registrationStatus: 1 });
registrationSchema.index({ participantId: 1 });

export const Registration: Model<IRegistration> = mongoose.model<IRegistration>(
  'Registration',
  registrationSchema,
);
