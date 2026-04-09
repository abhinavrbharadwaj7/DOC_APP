import connectToDatabase from '../../../lib/db';
import Notification from '../../../models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { doctorId, doctorName, message } = await req.json();

    if (!doctorId || !doctorName || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    const notif = await Notification.create({
      doctorId,
      doctorName,
      message,
    });

    return Response.json({ success: true, notification: notif }, { status: 201 });
  } catch (error) {
    console.error('[POST NOTIFICATION]', error);
    return Response.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    // Return only top 50 unread notifications
    const notifications = await Notification.find({ read: false })
                                          .sort({ createdAt: -1 })
                                          .limit(50);

    return Response.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error('[GET NOTIFICATIONS]', error);
    return Response.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
