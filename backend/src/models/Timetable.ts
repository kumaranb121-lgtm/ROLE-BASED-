import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    day: { type: String, enum: ['MON', 'TUE', 'WED', 'THU', 'FRI'], required: true },
    period: { type: Number, required: true }, // 1 to 8
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: false },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    room: { type: String, required: false },
    isBreak: { type: Boolean, default: false },
    breakName: { type: String, required: false },
  },
  { timestamps: true }
);

export const Timetable = mongoose.model('Timetable', timetableSchema);
