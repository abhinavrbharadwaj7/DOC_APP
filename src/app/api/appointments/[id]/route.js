import connectToDatabase from '../../../../lib/db';
import Appointment from '../../../../models/Appointment';

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const { status, notes } = await req.json();

    await connectToDatabase();
    const updated = await Appointment.findByIdAndUpdate(
      id,
      { ...(status && { status }), ...(notes && { notes }) },
      { new: true }
    ).populate('patientId', 'name phone email').populate('doctorId', 'name specialty');

    if (!updated) return Response.json({ error: 'Appointment not found.' }, { status: 404 });
    return Response.json({ appointment: updated }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
