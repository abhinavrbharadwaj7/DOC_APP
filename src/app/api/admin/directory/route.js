import connectToDatabase from '../../../../lib/db';
import User from '../../../../models/User';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    await connectToDatabase();

    const query = {};
    if (email) query.email = email.toLowerCase().trim();

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return Response.json({ users }, { status: 200 });
  } catch (err) {
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
