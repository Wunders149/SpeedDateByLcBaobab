import mongoose, { Schema, Document, Model } from 'mongoose';
import { AccountStatus, UserRole } from '@speed-date/shared';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  normalizedEmail: string;
  phone?: string;
  passwordHash: string;
  roles: UserRole[];
  accountStatus: AccountStatus;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    normalizedEmail: { type: String, required: true, unique: true, index: true },
    phone: { type: String, sparse: true },
    passwordHash: { type: String, required: true },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.Participant],
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.Active,
    },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (this.isModified('email')) {
    this.normalizedEmail = this.email.toLowerCase().trim();
  }
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
