import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';
import { SUBJECTS } from '@/lib/cma';
import { cleanDetails } from '@/lib/files';
export async function POST(request: Request) {
    try {
        const user = await requireUser(request);
        if (user.role !== 'teacher')
            throw new HttpError(403, 'Admin access required.');
        const { title, url, type, subjectId, chapter, faculty, duration, category } = await request.json();
        const subject = SUBJECTS.find(s => s.id === subjectId);
        if (typeof title !== 'string' || !title.trim() || title.length > 200 || !subject || !['pdf', 'video'].includes(type))
            throw new HttpError(400, 'Choose a subject, title and file type.');
        let link: URL;
        try {
            link = new URL(url);
        }
        catch {
            throw new HttpError(400, 'Enter a valid HTTPS link.');
        }
        if (link.protocol !== 'https:' || link.username || link.password || link.href.length > 2000)
            throw new HttpError(400, 'Use a public HTTPS link without credentials.');
        const doc = await adminDb.collection('materials').add({
            title: title.trim(),
            url: link.href,
            type,
            subject: subject.name,
            subjectId,
            level: subject.level,
            paperCode: `Paper ${subjectId}`,
            ...cleanDetails({ chapter, faculty, duration, category }),
            ...(typeof faculty === 'string' && faculty.trim() ? {} : { faculty: (user.name || 'CMA Faculty').slice(0, 80) }),
            ...(typeof category === 'string' && category.trim() ? {} : { category: type === 'video' ? 'Concept Lecture' : 'Chapter Notes' }),
            size: 0,
            teacherId: user.uid,
            teacherName: user.name,
            createdAt: FieldValue.serverTimestamp()
        });
        return Response.json({ id: doc.id });
    }
    catch (err) {
        return errorResponse(err);
    }
}
