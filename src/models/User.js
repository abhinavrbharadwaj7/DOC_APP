import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  // Doctor specific fields
  specialty: { type: String },
  // Patient specific fields
  medicalHistory: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
