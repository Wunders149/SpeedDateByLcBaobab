import mongoose, { Schema, Document, Model } from 'mongoose';
import { EventStatus } from '@speed-date/shared';

export interface IEvent extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  venue: string;
  timezone: string;
  startAt: Date;
  endAt: Date;
  registrationDeadline: Date;
  capacity: number;
  eligibleGroups: string[];
  eventMode: string;
  organizerContact: string;
  instructions?: string;
  questionnaireVersionId?: mongoose.Types.ObjectId;
  matchingConfiguration: {
    mode: 'compatibility_ranking' | 'global_optimal';
    minimumThreshold: number;
    dealBreakerAction: 'exclude' | 'flag';
    allowMultipleMatches: boolean;
    respectNoRepeat: boolean;
  };
  publicationSettings: {
    showCompatibilityScores: boolean;
    showSharedInterests: boolean;
    contactSharingMode: 'in_app' | 'organizer_mediated' | 'mutual_opt_in';
  };
  status: EventStatus;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    venue: { type: String, required: true },
    timezone: { type: String, default: 'UTC' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    eligibleGroups: { type: [String], default: [] },
    eventMode: {
      type: String,
      enum: [
        'in_person',
        'quiz_based',
        'guided_conversation',
        'post_event_matching',
        'organizer_mediated',
      ],
      default: 'in_person',
    },
    organizerContact: { type: String, required: true },
    instructions: { type: String },
    questionnaireVersionId: { type: Schema.Types.ObjectId, ref: 'QuestionnaireVersion' },
    matchingConfiguration: {
      mode: {
        type: String,
        enum: ['compatibility_ranking', 'global_optimal'],
        default: 'compatibility_ranking',
      },
      minimumThreshold: { type: Number, default: 0, min: 0, max: 100 },
      dealBreakerAction: { type: String, enum: ['exclude', 'flag'], default: 'exclude' },
      allowMultipleMatches: { type: Boolean, default: false },
      respectNoRepeat: { type: Boolean, default: true },
    },
    publicationSettings: {
      showCompatibilityScores: { type: Boolean, default: true },
      showSharedInterests: { type: Boolean, default: true },
      contactSharingMode: {
        type: String,
        enum: ['in_app', 'organizer_mediated', 'mutual_opt_in'],
        default: 'mutual_opt_in',
      },
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.Draft,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

eventSchema.index({ status: 1, startAt: -1 });

export const Event: Model<IEvent> = mongoose.model<IEvent>('Event', eventSchema);
