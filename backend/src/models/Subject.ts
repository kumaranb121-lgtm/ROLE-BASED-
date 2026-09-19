import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: false },
    name: { type: String, required: true },
    type: { type: String, enum: ['Theory', 'Lab', 'Placement', 'Project', 'Comm', 'Library', 'PT', 'Other'], default: 'Theory' },
    shortName: { type: String, required: true },
  },
  { timestamps: true }
);

export const Subject = mongoose.model('Subject', subjectSchema);
