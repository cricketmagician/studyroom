import { createHash } from 'node:crypto';
import { getAppCheck } from 'firebase-admin/app-check';
import { adminDb } from './firebase-admin';
import { HttpError } from './ai';
import { SUBJECTS } from '../cma';
export { contentId } from '../content-fingerprint';
export function safeId(value:unknown):string {if(typeof value!=='string'|| !/^[a-zA-Z0-9_-]{1,128}$/.test(value))throw new HttpError(400,'Invalid content ID.');return value;}
export async function checkContentApp(request:Request) {
  if(process.env.NEXT_PUBLIC_USE_EMULATOR==='true' || process.env.ENFORCE_APP_CHECK!=='true')return;
  const token=request.headers.get('X-Firebase-AppCheck');
  if(!token)throw new HttpError(401,'App verification is required. Refresh and try again.');
  try{await getAppCheck().verifyToken(token);}catch{throw new HttpError(401,'App verification failed. Refresh and try again.');}
}
export function chapterDetails(subjectId:unknown,chapter:unknown) {
  const subject=SUBJECTS.find(s=>s.id===subjectId);
  if(!subject || typeof chapter!=='string' || !chapter.trim() || chapter.length>160)throw new HttpError(400,'Choose a CMA subject and chapter name.');
  return {subjectId:subject.id,chapter:chapter.trim(),level:subject.level,chapterId:createHash('sha256').update(subject.id+':'+chapter.toLowerCase().replace(/\s+/g,' ').trim()).digest('hex').slice(0,24)};
}
export function addCatalog(batch:FirebaseFirestore.WriteBatch|FirebaseFirestore.Transaction,chapter:ReturnType<typeof chapterDetails>) {
  const subject=SUBJECTS.find(s=>s.id===chapter.subjectId)!;
  if ('commit' in batch) {
    batch.set(adminDb.doc(`courses/cma-${subject.level.toLowerCase()}`),{name:'CMA '+subject.level,level:subject.level},{merge:true});
    batch.set(adminDb.doc(`subjects/${subject.id}`),{name:subject.name,level:subject.level,courseId:'cma-'+subject.level.toLowerCase()},{merge:true});
    batch.set(adminDb.doc(`chapters/${chapter.chapterId}`),chapter,{merge:true});
  } else {
    batch.set(adminDb.doc(`courses/cma-${subject.level.toLowerCase()}`),{name:'CMA '+subject.level,level:subject.level},{merge:true});
    batch.set(adminDb.doc(`subjects/${subject.id}`),{name:subject.name,level:subject.level,courseId:'cma-'+subject.level.toLowerCase()},{merge:true});
    batch.set(adminDb.doc(`chapters/${chapter.chapterId}`),chapter,{merge:true});
  }
}
