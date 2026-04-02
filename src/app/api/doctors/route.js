import connectToDatabase from '../../../lib/db';
import User from '../../../models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    return Response.json({ doctors }, { status: 200 });
  } catch (err) {
    console.error('[GET DOCTORS ERROR]', err);
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
