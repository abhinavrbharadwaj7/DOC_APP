import mongoose from 'mongoose';

const slotLockSchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  slot: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// COMPOUND UNIQUE INDEX: One user/doctor/date/slot combination can only have one lock.
// This prevents two users from locking the same slot simultaneously.
slotLockSchema.index({ doctorId: 1, date: 1, slot: 1 }, { unique: true });

// TTL INDEX: MongoDB will automatically delete the document when 'expiresAt' is reached.
slotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.SlotLock || mongoose.model('SlotLock', slotLockSchema);
