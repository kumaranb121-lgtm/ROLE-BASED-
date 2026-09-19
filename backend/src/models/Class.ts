import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    year: { type: String, enum: ['1st', '2nd', '3rd', '4th'], required: true },
    department: { type: String, default: 'CSBS' },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    classroom: { type: String, required: false },
    totalStudents: { type: Number, default: 62 },
    effectiveFrom: { type: Date, required: false },
  },
  { timestamps: true }
);

export const Class = mongoose.model('Class', classSchema);
