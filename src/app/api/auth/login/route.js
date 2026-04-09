import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    // Return safe user info (never return the password)
    return Response.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePic: user.profilePic,
        specialty: user.specialty,
        medicalHistory: user.medicalHistory
      }
    }, { status: 200 });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
