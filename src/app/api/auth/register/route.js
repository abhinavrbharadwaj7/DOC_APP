import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, password, phone, role } = await req.json();

    if (!name || !email || !password) {
      return Response.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return Response.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'patient',
    });

    return Response.json(
      { message: 'Account created successfully!', userId: user._id },
      { status: 201 }
    );
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
