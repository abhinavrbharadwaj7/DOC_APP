import connectToDatabase from '../../../../lib/db';
import Appointment from '../../../../models/Appointment';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name phone email medicalHistory')
      .populate('doctorId', 'name specialty');
    if (!appointment) return Response.json({ error: 'Not found.' }, { status: 404 });
    return Response.json({ appointment }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, notes, prescriptionUrl, reportUrl } = body;

    await connectToDatabase();

    const updateFields = {};
    if (status)          updateFields.status          = status;
    if (notes !== undefined)           updateFields.notes           = notes;
    if (prescriptionUrl !== undefined) updateFields.prescriptionUrl = prescriptionUrl;
    if (reportUrl !== undefined)       updateFields.reportUrl       = reportUrl;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).populate('patientId', 'name phone email medicalHistory').populate('doctorId', 'name specialty');

    if (!updated) return Response.json({ error: 'Appointment not found.' }, { status: 404 });
    return Response.json({ appointment: updated }, { status: 200 });
  } catch (err) {
    console.error('[PATCH ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
