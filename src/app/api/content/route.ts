import { FieldPath } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/server/firebase-admin';
import { errorResponse, HttpError, requireUser } from '@/lib/server/ai';
import { addCatalog, chapterDetails, checkContentApp, contentId, safeId } from '@/lib/server/content';
import { contentSearchText, ContentItem, ContentKind, Formula, nextProgress, Progress, searchTerms, validateContent } from '@/lib/content';

const pageSize=24;
const collectionFor=(kind:ContentKind)=>kind==='formula'?'formulas':'flashcards';
export async function POST(request:Request) {
  try {
    await checkContentApp(request);
    const actor=await requireUser(request),isAdmin=actor.role==='teacher';
    const b=await request.json().catch(()=>{throw new HttpError(400,'Invalid request.');});
    if(!b || typeof b.action!=='string')throw new HttpError(400,'Choose an action.');
    if(b.action==='config')return Response.json({pdfEnabled:process.env.CONTENT_PDF_PIPELINE_ENABLED==='true'||process.env.NEXT_PUBLIC_USE_EMULATOR==='true',appCheck:process.env.ENFORCE_APP_CHECK==='true'});
    if(b.action==='chapters') {
      let q=adminDb.collection('chapters').where('subjectId','==',safeId(b.subjectId)).orderBy(FieldPath.documentId()).limit(101);
      if(b.cursor)q=q.startAfter(safeId(b.cursor));
      const rows=await q.get();return Response.json({items:rows.docs.slice(0,100).map(d=>({id:d.id,...d.data()})),cursor:rows.size>100?rows.docs[99].id:null});
    }
    if(['jobs','job','createJob','retryJob','uploadFailed','save','approve','publish','reject'].includes(b.action) && !isAdmin)throw new HttpError(403,'Admin access required.');
    if(b.action==='jobs') {
      let q=adminDb.collection('pdfJobs').orderBy('createdAt','desc').orderBy(FieldPath.documentId()).limit(pageSize+1);
      if(b.cursor){const last=await adminDb.doc(`pdfJobs/${safeId(b.cursor)}`).get();if(last.exists)q=q.startAfter(last);}
      const rows=await q.get();return Response.json({items:rows.docs.slice(0,pageSize).map(d=>({id:d.id,...d.data()})),cursor:rows.size>pageSize?rows.docs[pageSize-1].id:null});
    }
    if(b.action==='job') {
      const job=await adminDb.doc(`pdfJobs/${safeId(b.id)}`).get();if(!job.exists)throw new HttpError(404,'PDF job not found.');
      return Response.json({id:job.id,...job.data()});
    }
    if(b.action==='createJob') {
      if(process.env.CONTENT_PDF_PIPELINE_ENABLED!=='true' && process.env.NEXT_PUBLIC_USE_EMULATOR!=='true')throw new HttpError(503,'PDF processing needs Firebase Storage and Cloud Functions setup on the Blaze plan. You can create content manually now.');
      const chapter=chapterDetails(b.subjectId,b.chapter);
      if(typeof b.title!=='string'||!b.title.trim()||b.title.length>200||!Number.isInteger(b.size)||b.size<1||b.size>12*1024*1024)throw new HttpError(400,'Choose a chapter PDF up to 12 MB.');
      const ref=adminDb.collection('pdfJobs').doc(),storagePath=`chapter-pdfs/${actor.uid}/${ref.id}.pdf`;
      const batch=adminDb.batch();addCatalog(batch,chapter);
      batch.set(ref,{...chapter,owner:actor.uid,title:b.title.trim(),size:b.size,storagePath,status:'uploading',attempts:0,createdAt:Date.now()});await batch.commit();
      return Response.json({id:ref.id,storagePath});
    }
    if(b.action==='retryJob'||b.action==='uploadFailed') {
      const ref=adminDb.doc(`pdfJobs/${safeId(b.id)}`);
      await adminDb.runTransaction(async tx=>{const job=await tx.get(ref);if(!job.exists)throw new HttpError(404,'Job not found.');
        if(b.action==='uploadFailed') {if(job.get('status')==='uploading')tx.update(ref,{status:'upload-error',error:'Upload did not finish. Select the PDF again to start a new upload.'});}
        else {if(job.get('status')!=='error')throw new HttpError(409,'Only a failed processing job can be retried.');tx.update(ref,{status:'queued',attempts:0,error:null,retryable:true,updatedAt:Date.now()});}});
      return Response.json({ok:true});
    }
    if(!['formula','flashcard'].includes(b.kind))throw new HttpError(400,'Choose formulas or flashcards.');
    const kind=b.kind as ContentKind,collection=adminDb.collection(collectionFor(kind));
    if(b.action==='list') {
      if(b.admin && !isAdmin)throw new HttpError(403,'Admin access required.');
      const adminView=b.admin===true && isAdmin;
      const status=adminView && ['draft','approved','published','rejected'].includes(b.status)?b.status:'published';
      const filterText=typeof b.search==='string'?b.search.toLowerCase().replace(/[^\p{L}\p{N} ]/gu,' ').replace(/\s+/g,' ').trim().slice(0,40):'';
      if(!adminView && (b.saved || b.due)) {
        const path=b.saved?'formulaBookmarks':'flashcardProgress';
        if((b.saved&&kind!=='formula')||(b.due&&kind!=='flashcard'))throw new HttpError(400,'Invalid revision view.');
        let q:FirebaseFirestore.Query=adminDb.collection(`users/${actor.uid}/${path}`);
        if(b.due)q=q.where('dueAt','<=',Date.now()).orderBy('dueAt');
        q=q.orderBy(FieldPath.documentId()).limit(pageSize+1);
        if(b.cursor){const last=await adminDb.doc(`users/${actor.uid}/${path}/${safeId(b.cursor)}`).get();if(last.exists)q=q.startAfter(last);}
        const progress=await q.get(),selected=progress.docs.slice(0,pageSize);
        const docs=selected.length?await adminDb.getAll(...selected.map(d=>collection.doc(d.id))):[];
        const items=docs.filter(d=>d.exists&&d.get('status')==='published'&&(!b.subjectId||d.get('subjectId')===b.subjectId)&&(!b.chapterId||d.get('chapterId')===b.chapterId)&&(!filterText||(d.get('searchTerms')??[]).includes(filterText))).map(d=>({id:d.id,...d.data()}));
        return Response.json({items,progress:Object.fromEntries(selected.map(d=>[d.id,d.data()])),cursor:progress.size>pageSize?selected.at(-1)?.id:null});
      }
      let q:FirebaseFirestore.Query=collection.where('status','==',status);
      if(b.jobId && adminView)q=q.where('sourceJobId','==',safeId(b.jobId));
      else if(b.chapterId)q=q.where('chapterId','==',safeId(b.chapterId));
      else if(b.subjectId)q=q.where('subjectId','==',safeId(b.subjectId));
      if(filterText)q=q.where('searchTerms','array-contains',filterText);
      q=q.orderBy(FieldPath.documentId()).limit(pageSize+1);if(b.cursor)q=q.startAfter(safeId(b.cursor));
      const rows=await q.get(),selected=rows.docs.slice(0,pageSize);
      const personal=selected.length?await adminDb.getAll(...selected.map(d=>adminDb.doc(`users/${actor.uid}/${kind==='formula'?'formulaBookmarks':'flashcardProgress'}/${d.id}`))):[];
      return Response.json({items:selected.map(d=>({id:d.id,...d.data()})),progress:Object.fromEntries(personal.filter(d=>d.exists).map(d=>[d.id,d.data()])),cursor:rows.size>pageSize?selected.at(-1)?.id:null});
    }
    if(b.action==='bookmark'||b.action==='grade') {
      const id=safeId(b.id),ref=collection.doc(id),personal=adminDb.doc(`users/${actor.uid}/${kind==='formula'?'formulaBookmarks':'flashcardProgress'}/${id}`);
      const result=await adminDb.runTransaction(async tx=>{
        const [item,prior]=await Promise.all([tx.get(ref),tx.get(personal)]);if(item.get('status')!=='published')throw new HttpError(404,'This item is no longer published.');
        if(b.action==='bookmark') {if(kind!=='formula'||typeof b.saved!=='boolean')throw new HttpError(400,'Invalid bookmark.');if(b.saved)tx.set(personal,{saved:true,updatedAt:Date.now()});else tx.delete(personal);return {saved:b.saved};}
        if(kind!=='flashcard'||!['known','revision'].includes(b.grade))throw new HttpError(400,'Choose Known or Needs Revision.');
        const requestId=safeId(b.requestId);if(prior.get('requestId')===requestId)return prior.data();
        const progress=nextProgress(prior.data() as Progress|undefined,b.grade,Date.now(),requestId);tx.set(personal,progress);return progress;
      });return Response.json(result);
    }
    if(!isAdmin)throw new HttpError(403,'Admin access required.');
    if(!['save','approve','publish','reject'].includes(b.action))throw new HttpError(400,'Unknown action.');
    const previous=b.id?await collection.doc(safeId(b.id)).get():null;
    if(b.id&&!previous?.exists)throw new HttpError(404,'Content not found.');
    const old=previous?.data() as ContentItem|undefined;
    const chapter=b.action==='save'?chapterDetails(b.subjectId,b.chapter):chapterDetails(old?.subjectId,old?.chapter);
    const jobId=old?.sourceJobId??null;
    const job=jobId?await adminDb.doc(`pdfJobs/${safeId(jobId)}`).get():null;
    let validated;
    try{validated=validateContent(kind,b.action==='save'?b.item:old,job?.get('pageCount'));}catch(e){throw new HttpError(400,(e as Error).message);}
    const fingerprint=contentId(chapter.chapterId,kind,validated),ref=previous?.ref??collection.doc(fingerprint);
    const duplicate=await collection.where('fingerprint','==',fingerprint).limit(2).get();
    if(duplicate.docs.some(d=>d.id!==ref.id))throw new HttpError(409,'This chapter already has matching content. Edit the existing item.');
    await adminDb.runTransaction(async tx=>{
      const latest=await tx.get(ref),current=latest.data();
      if(!b.id&&latest.exists)throw new HttpError(409,'This content already exists.');
      if(b.id&&current?.revision!==b.revision)throw new HttpError(409,'Another admin updated this item. Refresh before editing.');
      let status='draft',sourceVerified=false;
      if(b.action==='approve'){if(current?.status!=='draft'||b.sourceVerified!==true)throw new HttpError(400,'Check the content against its source, then approve the draft.');status='approved';sourceVerified=true;}
      if(b.action==='publish'){if(current?.status!=='approved'||!current.sourceVerified)throw new HttpError(400,'Approve this item before publishing.');status='published';sourceVerified=true;}
      if(b.action==='reject')status='rejected';
      const updatedAt=Date.now(),revision=(current?.revision??0)+1;
      tx.set(ref,{...validated,...chapter,kind,status,sourceJobId:jobId,sourceVerified,revision,updatedAt,updatedBy:actor.uid,reviewedBy:sourceVerified?actor.uid:null,fingerprint,searchTerms:searchTerms(contentSearchText(validated))});
      addCatalog(tx,chapter);
      if(kind==='formula')for(let i=0;i<3;i++){const example=(validated as Formula).examples[i],exampleRef=adminDb.doc(`examples/${ref.id}-${i}`);if(example)tx.set(exampleRef,{...example,formulaId:ref.id,status,...chapter});else tx.delete(exampleRef);}
    });
    return Response.json({ok:true,id:ref.id});
  }catch(e){return errorResponse(e);}
}
