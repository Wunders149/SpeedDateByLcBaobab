import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipantProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  displayName: string;
  dateOfBirth: Date;
  publicProfile: {
    bio?: string;
    interests: string[];
    languages: string[];
    relationshipIntention?: string;
    values: string[];
    aspirations?: string;
    conversationStarters: string[];
    profilePhotoUrl?: string;
  };
  privateProfile: {
    communicationPreference: 'in_app' | 'organizer_mediated' | 'mutual_opt_in';
  };
  consentRecords: Array<{
    policyVersion: string;
    purpose: string;
    consentedAt: Date;
    revokedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const participantProfileSchema = new Schema<IParticipantProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    publicProfile: {
      bio: { type: String, maxlength: 500 },
      interests: { type: [String], default: [] },
      languages: { type: [String], default: [] },
      relationshipIntention: { type: String, maxlength: 100 },
      values: { type: [String], default: [] },
      aspirations: { type: String, maxlength: 500 },
      conversationStarters: { type: [String], default: [] },
      profilePhotoUrl: { type: String },
    },
    privateProfile: {
      communicationPreference: {
        type: String,
        enum: ['in_app', 'organizer_mediated', 'mutual_opt_in'],
        default: 'mutual_opt_in',
      },
    },
    consentRecords: [
      {
        policyVersion: { type: String, required: true },
        purpose: { type: String, required: true },
        consentedAt: { type: Date, default: Date.now },
        revokedAt: { type: Date },
      },
    ],
  },
  { timestamps: true },
);

export const ParticipantProfile: Model<IParticipantProfile> = mongoose.model<IParticipantProfile>(
  'ParticipantProfile',
  participantProfileSchema,
);
