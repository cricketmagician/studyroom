import { randomUUID } from 'node:crypto';
import { adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';
import { indiaDay } from '@/lib/cma';
import { occursOn, Routine, RoutineInput, validateRoutine } from '@/lib/routines';

export async function POST(request: Request) {
  try {
    const { uid } = await requireUser(request);
    const body = await request.json().catch(() => { throw new HttpError(400, 'Invalid request.'); });
    if (!body || !['list', 'save', 'delete', 'complete'].includes(body.action)) throw new HttpError(400, 'Unknown routine action.');
    const day = indiaDay();
    const ref = adminDb.doc(`profiles/${uid}/private/routines`);
    const dailyRef = adminDb.doc(`profiles/${uid}/routineDays/${day}`);
    let input: RoutineInput | undefined;
    if (body.action === 'save') {
      try { input = validateRoutine(body.routine); }
      catch (e) { throw new HttpError(400, (e as Error).message); }
    }
    if (body.action !== 'list' && !(body.action === 'save' && body.id === undefined) &&
      (typeof body.id !== 'string' || !/^[a-f0-9-]{36}$/.test(body.id))) throw new HttpError(400, 'Unknown routine.');
    if (body.action === 'complete' && (typeof body.done !== 'boolean' || body.day !== day)) throw new HttpError(400, 'Refresh before updating today’s routine.');
    const result = await adminDb.runTransaction(async tx => {
      const [saved, daily] = await Promise.all([tx.get(ref), tx.get(dailyRef)]);
      let items = (saved.get('items') ?? []) as Routine[];
      let done = (daily.get('done') ?? []) as string[];
      if (body.action !== 'list') {
        const existing = items.find(r => r.id === body.id);
        if (body.id && !existing) throw new HttpError(404, 'This routine was removed. Refresh and try again.');
        if (body.action === 'save' && input) {
          if (!body.id && items.length >= 50) throw new HttpError(400, 'You can keep up to 50 routines. Remove one before adding more.');
          const routine = { ...input, id: body.id ?? randomUUID() };
          items = existing ? items.map(r => r.id === body.id ? routine : r) : [...items, routine];
          tx.set(ref, { items });
        } else if (body.action === 'delete') {
          items = items.filter(r => r.id !== body.id);
          tx.set(ref, { items });
        } else if (body.action === 'complete') {
          if (!existing || !occursOn(existing, day)) throw new HttpError(400, 'This routine is not scheduled for today.');
          done = done.filter(id => id !== body.id);
          if (body.done) done.push(body.id);
          tx.set(dailyRef, { done });
        }
      }
      return { items, day, done };
    });
    return Response.json(result);
  } catch (e) { return errorResponse(e); }
}
