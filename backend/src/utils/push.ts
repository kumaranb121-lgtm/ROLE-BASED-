import webpush from 'web-push';
import { User } from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export const sendPushNotification = async (userId: string, payload: { title: string, body: string, url?: string }) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

    const pushPayload = JSON.stringify(payload);

    const promises = user.pushSubscriptions.map((sub: any) => 
      webpush.sendNotification(sub, pushPayload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, we should ideally remove it
          return User.findByIdAndUpdate(userId, { $pull: { pushSubscriptions: { endpoint: sub.endpoint } } });
        }
        console.error('Push error:', err);
      })
    );

    await Promise.all(promises);
  } catch (err) {
    console.error('Failed to send push notification', err);
  }
};
