import connectToDatabase from '../../../lib/db';
import Appointment from '../../../models/Appointment';
import SlotLock from '../../../models/SlotLock';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const { patientId, doctorId, date, slot, reason } = await req.json();

    if (!patientId || !doctorId || !date || !slot || !reason) {
      return Response.json({ error: 'All fields are required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if the 30-min slot is already taken for that doctor on that date
    const conflict = await Appointment.findOne({ doctorId, date, slot, status: { $ne: 'cancelled' } });
    if (conflict) {
      return Response.json({ error: 'This slot is already booked. Please choose another.' }, { status: 409 });
    }

    const entryToken = crypto.randomUUID();

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      slot,
      reason,
      status: 'pending',
      entryToken,
      isPresent: false
    });

    // Clear any slot lock for this user/slot
    try {
      await SlotLock.deleteOne({ doctorId, date: new Date(date), slot, patientId });
    } catch (e) {
      console.warn('[SILENT LOCK CLEAR ERROR]', e);
    }

    return Response.json({ message: 'Appointment booked!', appointment }, { status: 201 });
  } catch (err) {
    console.error('[BOOK ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    // Security Guard: Prevent global fetch
    if (!patientId && !doctorId) {
      return Response.json({ error: 'Unauthorized: Filter required.' }, { status: 403 });
    }

    await connectToDatabase();

    const query = {};
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .sort({ date: 1, slot: 1 });

    return Response.json({ appointments }, { status: 200 });
  } catch (err) {
    console.error('[GET APPOINTMENTS ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
