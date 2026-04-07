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

    return Response.json({ 
      message: 'Ticket Verified Successfully!', 
      patient: appointment.patientId,
      doctor: appointment.doctorId,
      slot: appointment.slot,
      date: appointment.date
    }, { status: 200 });

  } catch (err) {
    console.error('[VERIFY ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
