import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';
import { checkFile, cleanDetails } from '@/lib/files';
import { SUBJECTS } from '@/lib/cma';
const directory = join(process.cwd(), '.local-uploads');
export async function POST(request: Request) {
    try {
        if (process.env.NEXT_PUBLIC_USE_EMULATOR !== 'true')
            throw new HttpError(404, 'Not found.');
        const user = await requireUser(request);
        if (user.role !== 'teacher')
            throw new HttpError(403, 'Admin access required.');
        if (Number(request.headers.get('content-length')) > 26 * 1024 * 1024)
            throw new HttpError(413, 'Local uploads are limited to 25 MB.');
        const form = await request.formData();
        const file = form.get('file');
        const title = String(form.get('title') ?? '').trim();
        const subject = SUBJECTS.find(s => s.id === form.get('subjectId'));
        if (!(file instanceof File) || !title || title.length > 200)
            throw new HttpError(400, 'Choose a file and title.');
        const checked = checkFile(file);
        if ('error' in checked)
            throw new HttpError(400, checked.error);
        if (file.size > 25 * 1024 * 1024)
            throw new HttpError(413, 'Local uploads are limited to 25 MB. Use a hosted video link for larger lectures.');
        const ref = adminDb.collection('materials').doc();
        await mkdir(directory, { recursive: true });
        await writeFile(join(directory, ref.id), Buffer.from(await file.arrayBuffer()));
        await ref.set({ title, type: checked.kind, contentType: checked.kind === 'pdf' ? 'application/pdf' : (['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type) ? file.type : 'video/mp4'), url: `/api/files/local?id=${ref.id}`, size: file.size, local: true,
            teacherId: user.uid, teacherName: user.name, createdAt: FieldValue.serverTimestamp(),
            ...cleanDetails({ chapter: form.get('chapter'), faculty: form.get('faculty'), duration: form.get('duration'), category: form.get('category') }),
            ...(subject ? { subject: subject.name, subjectId: subject.id, level: subject.level, paperCode: `Paper ${subject.id}` } : {}) });
        return Response.json({ id: ref.id });
    }
    catch (err) {
        return errorResponse(err);
    }
}
export async function GET(request: Request) {
    try {
        if (process.env.NEXT_PUBLIC_USE_EMULATOR !== 'true')
            throw new HttpError(404, 'Not found.');
        const id = new URL(request.url).searchParams.get('id') ?? '';
        if (!/^[a-zA-Z0-9]{20}$/.test(id))
            throw new HttpError(404, 'File not found.');
        const material = await adminDb.doc(`materials/${id}`).get();
        if (!material.exists || !material.get('local'))
            throw new HttpError(404, 'File not found.');
        // Local demo URLs, like the existing public Blob URLs, are accessible to anyone with the link.
        const bytes = await readFile(join(directory, id));
        return new Response(bytes, { headers: { 'Content-Type': material.get('contentType') ?? 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' } });
    }
    catch (err) {
        return errorResponse(err);
    }
}
