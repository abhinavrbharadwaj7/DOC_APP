import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import Appointment from '../../../../models/Appointment';

export async function GET() {
  try {
    await connectToDatabase();
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const patientCount = await User.countDocuments({ role: 'patient' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayCount = await Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });
    return Response.json({ doctorCount, patientCount, todayCount }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
