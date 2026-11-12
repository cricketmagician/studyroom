import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret } from 'firebase-functions/params';
import { onObjectFinalized } from 'firebase-functions/v2/storage';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { processPdfJob } from './process';
initializeApp();
const geminiKey=defineSecret('GEMINI_API_KEY');
const options={region:'asia-south1',memory:'1GiB' as const,timeoutSeconds:540,secrets:[geminiKey],maxInstances:2,concurrency:1,retry:true};
export const processChapterPdf=onObjectFinalized(options,async event=>{
  const match=event.data.name?.match(/^chapter-pdfs\/[^/]+\/([a-zA-Z0-9]{20})\.pdf$/);
  if(match)await processPdfJob(getFirestore(),match[1],geminiKey.value());
});
export const retryChapterPdf=onDocumentUpdated({...options,document:'pdfJobs/{jobId}'},async event=>{
  if(event.data?.after.get('status')==='queued'&&event.data.before.get('status')!=='queued')await processPdfJob(getFirestore(),event.params.jobId,geminiKey.value());
});
