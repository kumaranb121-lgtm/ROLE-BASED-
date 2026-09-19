import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'substitution_request', 'new_message', 'leave_request'
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, required: false }, // Could be message ID or substitution ID
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
