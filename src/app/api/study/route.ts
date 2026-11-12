import { randomInt, randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';
import { safeId } from '@/lib/server/content';
import { creditedSeconds, DEFAULT_GOAL_MINUTES, examTerms, dailyCredits, indiaDay, LEVELS, SUBJECTS, StudyState } from '@/lib/cma';

/** You plus everyone you are friends with. */
async function myCircle(uid: string) {
    const links = await adminDb.collection('friendships').where('members', 'array-contains', uid).get();
    return new Set<string>([uid, ...links.docs.flatMap(d => d.get('members') as string[])]);
}

/** The friendship doc id for the caller and `friendId`, only if they really are friends. */
async function friendshipId(uid: string, friendId: unknown) {
    const id = [uid, safeId(friendId)].sort().join('_');
    const link = await adminDb.doc(`friendships/${id}`).get();
    if (!link.exists || !(link.get('members') as string[] | undefined)?.includes(uid))
        throw new HttpError(403, 'You can only chat with your friends.');
    return id;
}
export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        const body = await request.json();
        const ref = adminDb.doc(`studyUsers/${user.uid}`);
        const now = Date.now();
        const today = indiaDay(now);
        if (user.role === 'student') {
            await adminDb.runTransaction(async tx => {
                const state: StudyState = (await tx.get(ref)).data() ?? {};
                if (state.lastCheckin === today) return;
                const streak = state.lastCheckin === indiaDay(now - 86400000) ? (state.streak ?? 0) + 1 : 1;
                tx.set(ref, { checkinCount: (state.checkinCount ?? 0) + 1, lastCheckin: today, streak, lastSeen: now }, { merge: true });
                tx.set(ref.collection('checkins').doc(today), { day: today, at: now });
            });
        }
        if (body.action === 'admin') {
            if (user.role !== 'teacher')
                throw new HttpError(403, 'Admin access required.');
            // shortcut: load the roster in one request; paginate when the cohort exceeds 1,000 students.
            const [profiles, stats] = await Promise.all([adminDb.collection('profiles').get(), adminDb.collection('studyUsers').get()]);
            const map = new Map(stats.docs.map(d => [d.id, d.data()]));
            return Response.json({ students: profiles.docs.map(d => ({ id: d.id, ...d.data(), joinedAt: d.get('createdAt')?.toMillis?.() ?? null, ...map.get(d.id) })) });
        }
        if (body.action === 'detail') {
            const uid = body.uid ?? user.uid;
            if (typeof uid !== 'string' || !/^[\w-]{1,128}$/.test(uid))
                throw new HttpError(400, 'Invalid student.');
            if (uid !== user.uid && user.role !== 'teacher')
                throw new HttpError(403, 'Admin access required.');
            const base = adminDb.doc(`studyUsers/${uid}`);
            const [state, sessions, checkins, opened, daily] = await Promise.all([
                base.get(), base.collection('sessions').orderBy('startedAt', 'desc').limit(50).get(),
                base.collection('checkins').orderBy('at', 'desc').limit(60).get(),
                base.collection('opened').orderBy('at', 'desc').limit(50).get(),
                base.collection('daily').orderBy('day', 'desc').limit(90).get(),
            ]);
            return Response.json({ state: state.data() ?? {}, daily: daily.docs.map(d => d.data()), sessions: sessions.docs.map(d => d.data()), checkins: checkins.docs.map(d => d.data()), opened: opened.docs.map(d => d.data()), today, now });
        }
        if (body.action === 'invite') {
            const token = randomUUID();
            const code = Array.from({ length: 6 }, () => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[randomInt(36)]).join('');
            const inviteDoc = { uid: user.uid, token, code, expires: now + 7 * 86400000 };
            // create(), not set(): a colliding code fails instead of silently taking over someone else's invite.
            const batch = adminDb.batch();
            batch.create(adminDb.doc(`invites/${token}`), inviteDoc);
            batch.create(adminDb.doc(`inviteCodes/${code}`), inviteDoc);
            await batch.commit();
            return Response.json({ token, code: `CMA-${code}` });
        }
        if (body.action === 'accept') {
            let invite: { uid: string; expires: number } | undefined;
            if (typeof body.code === 'string' && body.code.trim()) {
                const clean = body.code.trim().toUpperCase().replace(/^CMA-/, '');
                if (/^[A-Z0-9]{6}$/.test(clean)) {
                    const doc = await adminDb.doc(`inviteCodes/${clean}`).get();
                    invite = doc.data() as { uid: string; expires: number } | undefined;
                }
                if (!invite && /^[a-f0-9-]{36}$/.test(body.code.trim())) {
                    const tDoc = await adminDb.doc(`invites/${body.code.trim()}`).get();
                    invite = tDoc.data() as { uid: string; expires: number } | undefined;
                }
            } else if (typeof body.token === 'string' && /^[a-f0-9-]{36}$/.test(body.token)) {
                const doc = await adminDb.doc(`invites/${body.token}`).get();
                invite = doc.data() as { uid: string; expires: number } | undefined;
            } else {
                throw new HttpError(400, 'Invalid invite.');
            }
            if (!invite || invite.expires < now)
                throw new HttpError(400, 'This invite has expired or is invalid. Ask your friend for a new link or code.');
            if (invite.uid === user.uid)
                throw new HttpError(400, 'This is your own invite.');
            const members = [user.uid, invite.uid].sort();
            await adminDb.doc(`friendships/${members.join('_')}`).set({ members, createdAt: now }, { merge: true });
            return Response.json({ ok: true });
        }
        if (body.action === 'privacy') {
            const hide = Boolean(body.hideStudyStatus);
            await adminDb.doc(`studyUsers/${user.uid}`).set({ hideStudyStatus: hide }, { merge: true });
            return Response.json({ ok: true, hideStudyStatus: hide });
        }
        if (body.action === 'save_push_token') {
            const subscription = typeof body.subscription === 'string' ? body.subscription : null;
            if (subscription) {
                await adminDb.doc(`studyUsers/${user.uid}`).set({
                    pushSubscription: subscription,
                    pushUpdatedAt: now,
                }, { merge: true });
            }
            return Response.json({ ok: true });
        }
        if (body.action === 'setup_profile') {
            const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : '';
            const level = typeof body.level === 'string' && LEVELS.includes(body.level as any) ? body.level : 'Intermediate';
            const dailyGoalMinutes = Number(body.dailyGoalMinutes) >= 15 && Number(body.dailyGoalMinutes) <= 720 ? Number(body.dailyGoalMinutes) : DEFAULT_GOAL_MINUTES;
            const targetExam = typeof body.targetExam === 'string' ? body.targetExam.trim().slice(0, 50) : examTerms()[0];
            const primarySubject = typeof body.primarySubject === 'string' ? body.primarySubject.trim().slice(0, 60) : '';
            const hideStudyStatus = body.hideStudyStatus !== undefined ? Boolean(body.hideStudyStatus) : undefined;
            const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : '';
            const city = typeof body.city === 'string' ? body.city.trim().slice(0, 60) : '';
            const registrationNumber = typeof body.registrationNumber === 'string' ? body.registrationNumber.trim().toUpperCase().slice(0, 30) : '';
            const group = typeof body.group === 'string' ? body.group.trim().slice(0, 30) : '';
            const coachingType = typeof body.coachingType === 'string' ? body.coachingType.trim().slice(0, 40) : '';
            const attemptCount = typeof body.attemptCount === 'string' ? body.attemptCount.trim().slice(0, 30) : 'First Attempt';
            const studyTimePreference = typeof body.studyTimePreference === 'string' ? body.studyTimePreference.trim().slice(0, 50) : '';
            const instituteChapter = typeof body.instituteChapter === 'string' ? body.instituteChapter.trim().slice(0, 60) : '';

            const batch = adminDb.batch();
            const userStudyRef = adminDb.doc(`studyUsers/${user.uid}`);
            const updateStudyData: Record<string, any> = {
                onboardingCompleted: true,
                level,
                dailyGoalMinutes,
                targetExam,
                primarySubject,
                phone,
                city,
                registrationNumber,
                group,
                coachingType,
                attemptCount,
                studyTimePreference,
                instituteChapter,
                lastSeen: now,
            };
            if (hideStudyStatus !== undefined) {
                updateStudyData.hideStudyStatus = hideStudyStatus;
            }
            batch.set(userStudyRef, updateStudyData, { merge: true });

            const profileRef = adminDb.doc(`profiles/${user.uid}`);
            const pDoc = await profileRef.get();
            const detailedProfileData = {
                ...(name ? { name } : {}),
                level,
                phone,
                city,
                registrationNumber,
                group,
                coachingType,
                attemptCount,
                studyTimePreference,
                instituteChapter,
                targetExam,
                primarySubject,
                updatedAt: FieldValue.serverTimestamp(),
            };
            if (pDoc.exists) {
                batch.set(profileRef, detailedProfileData, { merge: true });
            } else {
                batch.set(profileRef, {
                    name: name || user.name || 'Student',
                    email: user.email,
                    role: user.role || 'student',
                    createdAt: FieldValue.serverTimestamp(),
                    ...detailedProfileData,
                }, { merge: true });
            }

            await batch.commit();
            return Response.json({
                ok: true,
                onboardingCompleted: true,
                name,
                level,
                phone,
                city,
                registrationNumber,
                group,
                coachingType,
                attemptCount,
                studyTimePreference,
                instituteChapter,
                dailyGoalMinutes,
                targetExam,
                primarySubject,
                hideStudyStatus,
            });
        }
        if (body.action === 'chat_messages') {
            const snap = await adminDb
                .collection(`friendships/${await friendshipId(user.uid, body.friendId)}/messages`)
                .orderBy('createdAt', 'asc')
                .limit(100)
                .get();
            const messages = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return Response.json({ messages });
        }
        if (body.action === 'chat_send') {
            const text = typeof body.text === 'string' ? body.text.trim() : '';
            if (!text || text.length > 2000) throw new HttpError(400, 'Message cannot be empty or over 2,000 characters.');
            const chatId = await friendshipId(user.uid, body.friendId);
            const profile = await adminDb.doc(`profiles/${user.uid}`).get();
            const newMsg = {
                senderId: user.uid,
                senderName: profile.get('name') ?? 'Student',
                text,
                createdAt: now,
            };
            const docRef = await adminDb.collection(`friendships/${chatId}/messages`).add(newMsg);
            return Response.json({ ok: true, message: { id: docRef.id, ...newMsg } });
        }
        if (body.action === 'challenge_list') {
            // Only challenges made by you or your friends, each with a leaderboard of hours studied since it began.
            const circle = await myCircle(user.uid);
            // shortcut: filters the 60 newest challenges in memory; move to a per-friend query if the app grows past a few thousand students.
            const snap = await adminDb.collection('challenges').orderBy('createdAt', 'desc').limit(60).get();
            const visible = snap.docs.map(d => ({ id: d.id, ...d.data() } as { id: string; creatorId: string; participants: string[]; createdAt: number; [k: string]: unknown }))
                .filter(c => circle.has(c.creatorId) || c.participants.includes(user.uid)).slice(0, 25);
            const names = new Map<string, string>();
            const challenges = await Promise.all(visible.map(async (c) => {
                const since = indiaDay(c.createdAt);
                const shown = c.participants.filter(uid => circle.has(uid));
                const board = await Promise.all(shown.map(async (uid) => {
                    if (!names.has(uid)) names.set(uid, (await adminDb.doc(`profiles/${uid}`).get()).get('name') ?? 'Student');
                    const days = await adminDb.collection(`studyUsers/${uid}/daily`).where('day', '>=', since).get();
                    return { uid, name: names.get(uid)!, seconds: days.docs.reduce((sum, d) => sum + (d.get('seconds') ?? 0), 0) };
                }));
                board.sort((a, b) => b.seconds - a.seconds);
                return { ...c, board, others: c.participants.length - shown.length };
            }));
            return Response.json({ challenges });
        }
        if (body.action === 'challenge_create') {
            const title = typeof body.title === 'string' ? body.title.trim() : '';
            const targetHours = Number(body.targetHours);
            const subject = body.subject ?? 'All Subjects';
            if (!title || title.length > 120) throw new HttpError(400, 'Enter a valid challenge title.');
            if (!Number.isInteger(targetHours) || targetHours < 1 || targetHours > 100) throw new HttpError(400, 'Choose a target between 1 and 100 hours.');
            if (subject !== 'All Subjects' && !SUBJECTS.some(s => s.name === subject)) throw new HttpError(400, 'Choose a valid subject.');
            const profile = await adminDb.doc(`profiles/${user.uid}`).get();
            const chRef = adminDb.collection('challenges').doc();
            const chData = {
                id: chRef.id,
                title,
                targetHours,
                subject,
                creatorId: user.uid,
                creatorName: profile.get('name') ?? 'Student',
                participants: [user.uid],
                createdAt: now,
                endsAt: now + 7 * 86400000,
            };
            await chRef.set(chData);
            return Response.json({ ok: true, challenge: chData });
        }
        if (body.action === 'challenge_join') {
            const challenge = adminDb.doc(`challenges/${safeId(body.challengeId)}`);
            const found = await challenge.get();
            if (!found.exists) throw new HttpError(404, 'This challenge no longer exists.');
            if (!(await myCircle(user.uid)).has(found.get('creatorId'))) throw new HttpError(403, 'You can only join challenges made by your friends.');
            await challenge.update({ participants: FieldValue.arrayUnion(user.uid) });
            return Response.json({ ok: true });
        }
        if (body.action === 'unfriend') {
            // Removes the friendship and its chat for both people.
            await adminDb.recursiveDelete(adminDb.doc(`friendships/${await friendshipId(user.uid, body.friendId)}`));
            return Response.json({ ok: true });
        }
        if (body.action === 'friends') {
            const [links, myStudyDoc] = await Promise.all([
                adminDb.collection('friendships').where('members', 'array-contains', user.uid).get(),
                adminDb.doc(`studyUsers/${user.uid}`).get(),
            ]);
            const myStudy = myStudyDoc.data() ?? {};
            const friends = await Promise.all(links.docs.map(async (d) => {
                const uid = d.get('members').find((id: string) => id !== user.uid);
                const [profile, fDoc] = await Promise.all([
                    adminDb.doc(`profiles/${uid}`).get(),
                    adminDb.doc(`studyUsers/${uid}`).get(),
                ]);
                const fData = fDoc.data() ?? {};
                const isStudying = !fData.hideStudyStatus && fData.active && (now - (fData.active.last ?? 0) <= 90000);
                const sub = isStudying ? SUBJECTS.find(s => s.id === fData.active.subject) : null;
                return {
                    id: uid,
                    name: profile.get('name') ?? 'Student',
                    streak: fData.streak ?? 0,
                    totalSeconds: fData.totalSeconds ?? 0,
                    studying: isStudying ? {
                        subjectId: fData.active.subject,
                        subjectName: sub ? `Paper ${sub.id} · ${sub.name}` : `Paper ${fData.active.subject}`,
                        startedAt: fData.active.startedAt,
                    } : null,
                    lastSeen: fData.hideStudyStatus ? null : (fData.lastSeen ?? null),
                };
            }));
            return Response.json({ 
                friends,
                hideStudyStatus: Boolean(myStudy.hideStudyStatus),
            });
        }
        if (body.action === 'open') {
            if (typeof body.materialId !== 'string' || !/^[a-zA-Z0-9]{1,64}$/.test(body.materialId))
                throw new HttpError(400, 'Invalid material.');
            const material = await adminDb.doc(`materials/${body.materialId}`).get();
            if (!material.exists)
                throw new HttpError(404, 'Material no longer available.');
            const batch = adminDb.batch();
            batch.set(ref.collection('opened').doc(body.materialId), { title: material.get('title'), at: now });
            batch.set(ref, { lastMaterial: material.get('title'), lastSeen: now }, { merge: true });
            await batch.commit();
            return Response.json({ ok: true });
        }
        if (!['checkin', 'level', 'goal', 'start', 'tick', 'stop'].includes(body.action))
            throw new HttpError(400, 'Unknown action.');
        await adminDb.runTransaction(async (tx) => {
            const state: StudyState = (await tx.get(ref)).data() ?? {};
            if (body.action === 'goal') {
                if (!Number.isInteger(body.minutes) || body.minutes < 15 || body.minutes > 720) throw new HttpError(400, 'Choose a goal between 15 and 720 minutes.');
                tx.set(ref, { dailyGoalMinutes: body.minutes }, { merge: true });
            }
            if (body.action === 'level') {
                if (!LEVELS.includes(body.level))
                    throw new HttpError(400, 'Choose a CMA level.');
                tx.set(ref, { level: body.level }, { merge: true });
            }
            if (body.action === 'checkin') {
                if (state.lastCheckin !== today) {
                    const streak = state.lastCheckin === indiaDay(now - 86400000) ? (state.streak ?? 0) + 1 : 1;
                    tx.set(ref, { checkinCount: (state.checkinCount ?? 0) + 1, lastCheckin: today, streak, lastSeen: now }, { merge: true });
                    tx.set(ref.collection('checkins').doc(today), { day: today, at: now });
                }
            }
            if (body.action === 'start') {
                if (!SUBJECTS.some(s => s.id === body.subject))
                    throw new HttpError(400, 'Choose a valid subject.');
                if (state.active && now - state.active.last <= 90000)
                    throw new HttpError(409, 'A timer is already running. Pause it first.');
                if (state.active)
                    tx.set(ref.collection('sessions').doc(state.active.id), { ...state.active, endedAt: state.active.last });
                tx.set(ref, { active: { id: randomUUID(), subject: body.subject, startedAt: now, last: now, seconds: 0 }, lastSeen: now }, { merge: true });
            }
            if (body.action === 'tick' || body.action === 'stop') {
                if (!state.active || state.active.id !== body.sessionId)
                    throw new HttpError(409, 'This timer is no longer active. Refresh to continue.');
                const active = state.active;
                const seconds = creditedSeconds(active.last, now);
                const next = { ...active, last: now, seconds: active.seconds + seconds };
                const ended = body.action === 'stop' || now - active.last > 90000;
                for (const [day, amount] of Object.entries(dailyCredits(active.last, now))) {
                    tx.set(ref.collection('daily').doc(day), { day, seconds: FieldValue.increment(amount), subjects: { [active.subject]: FieldValue.increment(amount) } }, { merge: true });
                }
                tx.set(ref, { active: ended ? null : next, totalSeconds: (state.totalSeconds ?? 0) + seconds,
                    subjects: { ...state.subjects, [active.subject]: (state.subjects?.[active.subject] ?? 0) + seconds }, lastSeen: now }, { merge: true });
                tx.set(ref.collection('sessions').doc(active.id), { ...next, endedAt: ended ? now : null });
            }
        });
        return Response.json({ ok: true });
    }
    catch (err) {
        return errorResponse(err);
    }
}
