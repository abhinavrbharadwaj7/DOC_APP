import connectToDatabase from '../../../../lib/db';
import Notification from '../../../../models/Notification';

export async function POST(req) {
  try {
    const { notificationId } = await req.json();

    if (!notificationId) {
      return Response.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    await connectToDatabase();

    await Notification.findByIdAndUpdate(notificationId, { read: true });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[MARK READ ERROR]', error);
    return Response.json({ error: 'Failed to mark notification as read' }, { status: 500 });
  }
}
