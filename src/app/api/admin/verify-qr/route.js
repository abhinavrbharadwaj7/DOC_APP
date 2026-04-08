import connectToDatabase from '../../../../lib/db';
import Appointment from '../../../../models/Appointment';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    await connectToDatabase();

    const appointment = await Appointment.findOne({ entryToken: token }).populate('patientId', 'name email').populate('doctorId', 'name');

    if (!appointment) {
      return Response.json({ error: 'Invalid QR Code token' }, { status: 404 });
    }

    if (appointment.isPresent) {
      return Response.json({ error: 'This ticket has already been scanned and verified.' }, { status: 409 });
    }

    // Mark as present
    appointment.isPresent = true;
    await appointment.save();

    // Re-fetch populated appointment to return for sync
    const updated = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty');

    return Response.json({
      message: 'Presence verified!',
      patient: updated.patientId,
      doctor: updated.doctorId,
      date: updated.date,
      slot: updated.slot,
      isPresent: true
    }, { status: 200 });

  } catch (err) {
    console.error('[VERIFY ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
