import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, readAt: 1 });
notificationSchema.index({ eventId: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
