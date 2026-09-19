import mongoose from 'mongoose';

const substitutionSchema = new mongoose.Schema(
  {
    fromStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toStaff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timetableSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Accepted', 'Declined'], default: 'Pending' },
    message: { type: String, required: false },
  },
  { timestamps: true }
);

export const Substitution = mongoose.model('Substitution', substitutionSchema);
