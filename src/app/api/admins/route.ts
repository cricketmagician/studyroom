import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';

export async function POST(request: Request) {
  try {
    const actor = await requireUser(request);
    if (actor.role !== 'teacher') throw new HttpError(403, 'Only admins can manage admin access.');
    const body = await request.json();
    if (body?.action === 'list') {
      const admins = await adminDb.collection('profiles').where('role', '==', 'teacher').get();
      return Response.json({ admins: admins.docs.map(d => ({ id:d.id, name:d.get('name'), email:d.get('email') })) });
    }
    if (body?.action === 'revoke') {
      if (typeof body.uid !== 'string' || !body.uid) throw new HttpError(400, 'User ID required.');
      if (body.uid === actor.uid) throw new HttpError(400, 'You cannot revoke your own admin access.');
      const targetRef = adminDb.doc(`profiles/${body.uid}`);
      const target = await targetRef.get();
      if (!target.exists) throw new HttpError(404, 'User profile not found.');
      await targetRef.update({
        role: 'student',
        roleRevokedBy: actor.uid,
        roleRevokedAt: FieldValue.serverTimestamp(),
      });
      return Response.json({ ok: true, revoked: true, email: target.get('email') });
    }
    if (body?.action === 'delete_student') {
      if (typeof body.uid !== 'string' || !/^[\w-]{1,128}$/.test(body.uid)) throw new HttpError(400, 'User ID required.');
      if (body.uid === actor.uid) throw new HttpError(400, 'You cannot delete your own account here.');
      const profile = await adminDb.doc(`profiles/${body.uid}`).get();
      if (profile.get('role') === 'teacher') throw new HttpError(400, 'Remove admin access before deleting this person.');
      // Sign-in goes first so a half-finished delete never leaves a working account; a missing user is fine on retry.
      await adminAuth.deleteUser(body.uid).catch((error) => { if ((error as {code?:string}).code !== 'auth/user-not-found') throw error; });
      const [friends, devices] = await Promise.all([
        adminDb.collection('friendships').where('members', 'array-contains', body.uid).get(),
        adminDb.collection('mobileDevices').where('uid', '==', body.uid).get(),
      ]);
      await Promise.all([
        ...['profiles', 'studyUsers', 'users'].map((c) => adminDb.recursiveDelete(adminDb.doc(`${c}/${body.uid}`))),
        ...friends.docs.map((d) => adminDb.recursiveDelete(d.ref)),
        ...devices.docs.map((d) => d.ref.delete()),
      ]);
      return Response.json({ ok: true, deleted: true });
    }
    if (body?.action !== 'grant') throw new HttpError(400, 'Unknown admin action.');
    if (typeof body.email !== 'string' || body.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) throw new HttpError(400, 'Enter a valid registered email address.');
    let target;
    try { target = await adminAuth.getUserByEmail(body.email.trim().toLowerCase()); }
    catch (error) {
      if ((error as {code?:string}).code === 'auth/user-not-found') throw new HttpError(404, 'This person must sign in to the app with Google first.');
      if ((error as {code?:string}).code === 'auth/invalid-email') throw new HttpError(400, 'Enter a valid registered email address.');
      throw error;
    }
    if (target.disabled || !target.emailVerified) throw new HttpError(400, 'This account needs an active, verified email. Ask them to sign in with Google first.');
    const targetRef = adminDb.doc(`profiles/${target.uid}`);
    const changed = await adminDb.runTransaction(async tx => {
      const [currentActor, profile] = await Promise.all([tx.get(adminDb.doc(`profiles/${actor.uid}`)), tx.get(targetRef)]);
      if (currentActor.get('role') !== 'teacher') throw new HttpError(403, 'Your admin access has changed. Please refresh.');
      if (!profile.exists) throw new HttpError(409, 'This person must finish signing in to the app first.');
      if (profile.get('role') === 'teacher') return false;
      tx.update(targetRef, {role:'teacher',roleGrantedBy:actor.uid,roleGrantedAt:FieldValue.serverTimestamp()});
      return true;
    });
    return Response.json({ok:true, changed, email:target.email});
  } catch (error) { return errorResponse(error); }
}
