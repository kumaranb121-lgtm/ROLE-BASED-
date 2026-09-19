import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    timetableSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'Timetable', required: true },
    date: { type: Date, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    presentCount: { type: Number, required: true },
    absentCount: { type: Number, required: true },
    absentRollNos: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model('Attendance', attendanceSchema);
