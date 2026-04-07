import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true }, // e.g., '10:00 AM - Fixed 30min slot'
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'no-show'], default: 'pending' },
  reason: { type: String, required: true },
  notes: { type: String },
  prescriptionUrl: { type: String },
  reportUrl: { type: String },
  entryToken: { type: String },
  isPresent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
