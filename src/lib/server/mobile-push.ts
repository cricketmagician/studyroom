import { createHash } from 'node:crypto';
import { getMessaging } from 'firebase-admin/messaging';
import { adminDb } from './firebase-admin';
import { notificationPath } from '../mobile-validation';
export const deviceId = (token: string) => createHash('sha256').update(token).digest('hex');

export async function sendMobilePush(uid: string, title: string, body: string, url: string) {
  const docs = await adminDb.collection('mobileDevices').where('uid', '==', uid).limit(20).get();
  if (docs.empty) return 0;
  const result = await getMessaging().sendEachForMulticast({tokens:docs.docs.map(d => d.get('token')),
    notification:{title,body}, data:{url:notificationPath(url)}, android:{priority:'high',notification:{channelId:'updates',icon:'ic_notification'}}});
  await Promise.all(result.responses.map(async (response, index) => {
    if (['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(response.error?.code ?? '')) {
      await docs.docs[index].ref.delete();
    }
  }));
  return result.successCount;
}
