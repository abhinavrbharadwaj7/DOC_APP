import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    await connectToDatabase();
    
    // Only allow updating certain fields to prevent role/password escalation
    const updateFields = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.phone !== undefined) updateFields.phone = body.phone;
    if (body.specialty !== undefined) updateFields.specialty = body.specialty;
    if (body.profilePic !== undefined) updateFields.profilePic = body.profilePic;
    if (body.medicalHistory !== undefined) updateFields.medicalHistory = body.medicalHistory;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    // sanitize before sending back
    const safeUser = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      specialty: updatedUser.specialty,
      profilePic: updatedUser.profilePic,
      medicalHistory: updatedUser.medicalHistory
    };

    return Response.json({ user: safeUser }, { status: 200 });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
