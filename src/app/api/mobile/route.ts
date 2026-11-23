import { adminAuth, adminDb } from '@/lib/server/firebase-admin';
import { requireUser, errorResponse, HttpError, takeQuota } from '@/lib/server/ai';
import { deviceId, sendMobilePush } from '@/lib/server/mobile-push';
import { pushToken } from '@/lib/mobile-validation';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    if (body.action === 'native_auth') return Response.json({token:await adminAuth.createCustomToken(user.uid)});
    if (body.action === 'register' || body.action === 'unregister') {
      let token: string;
      try { token = pushToken(body.token); } catch { throw new HttpError(400, 'Invalid device token.'); }
      const ref = adminDb.doc(`mobileDevices/${deviceId(token)}`);
      await adminDb.runTransaction(async tx => {
        const current = await tx.get(ref);
        if (body.action === 'register') tx.set(ref,{uid:user.uid,token,updatedAt:Date.now()});
        else if (current.get('uid') === user.uid) tx.delete(ref);
      });
      return Response.json({ok:true});
    }
    if (body.action === 'test') {
      await takeQuota(user.uid, 'pushTests', 20);
      const sent = await sendMobilePush(user.uid, 'Abhyas is connected', 'Push notifications are working on your phone.', '/profile');
      if (!sent) throw new HttpError(409, 'No connected device received this test. Enable notifications and try again.');
      return Response.json({ok:true,sent});
    }
    throw new HttpError(400, 'Unknown mobile action.');
  } catch (error) { return errorResponse(error); }
}
