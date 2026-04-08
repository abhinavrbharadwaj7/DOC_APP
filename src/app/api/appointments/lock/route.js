import connectToDatabase from '../../../../lib/db';
import SlotLock from '../../../../models/SlotLock';
import Appointment from '../../../../models/Appointment';

export async function POST(req) {
  try {
    const { doctorId, date, slot, patientId } = await req.json();

    if (!doctorId || !date || !slot || !patientId) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Check if there's a confirmed appointment already
    const confirmed = await Appointment.findOne({ 
      doctorId, 
      date: new Date(date), 
      slot, 
      status: { $ne: 'cancelled' } 
    });
    if (confirmed) {
      return Response.json({ error: 'This slot is already booked.' }, { status: 409 });
    }

    // 2. Check if locked by someone else
    const existingLock = await SlotLock.findOne({ 
      doctorId, 
      date: new Date(date), 
      slot 
    });

    if (existingLock) {
      if (existingLock.patientId.toString() === patientId) {
        // User already has the lock, extend it? Or just return success
        return Response.json({ message: 'Slot already reserved by you.', expiresAt: existingLock.expiresAt }, { status: 200 });
      } else {
        return Response.json({ error: 'This slot is currently being booked by someone else.' }, { status: 423 }); // 423 Locked
      }
    }

    // 3. Create new lock (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await connectToDatabase();

    // 1. Clear any existing locks for this patient with this doctor/date
    // This allows them to switch slots without hoarding locks
    await SlotLock.deleteMany({ doctorId, date: new Date(date), patientId });

    // 2. Try to create new lock
    try {
      const lock = await SlotLock.create({
        doctorId,
        date: new Date(date),
        slot,
        patientId,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
      });

      return Response.json({ 
        message: 'Slot reserved for 5 minutes.', 
        expiresAt: lock.expiresAt 
      }, { status: 201 });
    } catch (dbErr) {
      // Handle the rare case where two users lock at the same microsecond (caught by index)
      if (dbErr.code === 11000) {
        return Response.json({ error: 'This slot was just reserved by another user.' }, { status: 423 });
      }
      throw dbErr;
    }

  } catch (err) {
    console.error('[LOCK ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Optional: DELETE lock if user explicitly deselects or leaves (can be called via fetch in cleanup)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const date = searchParams.get('date');
    const slot = searchParams.get('slot');
    const patientId = searchParams.get('patientId');

    await connectToDatabase();
    await SlotLock.deleteOne({ doctorId, date: new Date(date), slot, patientId });
    
    return Response.json({ message: 'Lock released.' }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Error releasing lock.' }, { status: 500 });
  }
}
