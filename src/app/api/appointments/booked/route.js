import connectToDatabase from '../../../../lib/db';
import Appointment from '../../../../models/Appointment';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');

    if (!doctorId || !date) {
      return Response.json({ error: 'doctorId and date are required.' }, { status: 400 });
    }

    await connectToDatabase();

    // Find all non-cancelled appointments for this doctor and date
    const booked = await Appointment.find({
      doctorId,
      date: new Date(date),
      status: { $ne: 'cancelled' }
    }).select('slot');

    // Find all active locks
    const locks = await SlotLock.find({
      doctorId,
      date: new Date(date)
    }).select('slot patientId');

    return Response.json({ 
      bookedSlots: booked.map(app => app.slot),
      lockedSlots: locks.map(lock => ({
        slot: lock.slot,
        patientId: lock.patientId
      }))
    }, { status: 200 });
  } catch (err) {
    console.error('[FETCH BOOKED SLOTS ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
