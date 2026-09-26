import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ['HOD', 'STAFF', 'CLASS_REPRESENTATIVE', 'STUDENT'], required: true },
    isAvailable: { type: Boolean, default: true },
    availabilityStatus: { type: String, default: 'Available' }, // Leave, Permission, Emergency, etc.
    pushSubscriptions: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
