import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return Response.json({ users }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
