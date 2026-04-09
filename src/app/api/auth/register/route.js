import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, phone, role, specialty } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Guard: public registration cannot create admin accounts
    // Admin accounts can only be created by passing the internal bypass header
    const isAdminBypass = req.headers.get('x-admin-bypass') === process.env.ADMIN_BYPASS_SECRET;
    const safeRole = (role === 'admin' && !isAdminBypass) ? 'patient' : (role || 'patient');

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: safeRole,
    };

    // Save specialty for doctor accounts
    if (safeRole === 'doctor' && specialty) {
      userData.specialty = specialty;
    }

    const user = await User.create(userData);

    return Response.json(
      { 
        message: 'Account created successfully!', 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          specialty: user.specialty,
          medicalHistory: user.medicalHistory
        }
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
