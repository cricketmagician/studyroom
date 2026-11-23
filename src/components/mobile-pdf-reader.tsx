"use client";
import { useEffect, useRef, useState } from 'react';
import { Browser } from '@capacitor/browser';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/** Render a page at a time: Android WebView has no reliable built-in PDF viewer. */
export function MobilePdfReader({url,title}:{url:string;title:string}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [pdf,setPdf]=useState<PDFDocumentProxy|null>(null);
  const [page,setPage]=useState(1),[zoom,setZoom]=useState(1),[busy,setBusy]=useState(true),[error,setError]=useState('');
  useEffect(()=>{
    let cancelled=false;
    let task:ReturnType<typeof import('pdfjs-dist').getDocument>|undefined;
    void import('pdfjs-dist').then(async engine=>{
      engine.GlobalWorkerOptions.workerSrc='/pdf/pdf.worker.min.mjs';
      if(cancelled)return;
      setPdf(null);setPage(1);setError('');setBusy(true);
      task=engine.getDocument({url});
      const document=await task.promise;
      if(!cancelled)setPdf(document);
    }).catch(()=>{if(!cancelled){setError('This PDF could not be loaded. Check your connection, or open the original file.');setBusy(false);}});
    return ()=>{cancelled=true;void task?.destroy();};
  },[url]);
  useEffect(()=>{
    if(!pdf)return;
    let cancelled=false;
    let render:ReturnType<Awaited<ReturnType<PDFDocumentProxy['getPage']>>['render']>|undefined;
    void pdf.getPage(page).then(async p=>{
      if(cancelled || !canvas.current)return;
      setBusy(true);setError('');
      const natural=p.getViewport({scale:1});
      const width=Math.max(240,(frame.current?.clientWidth??360)-24);
      const ratio=Math.min(window.devicePixelRatio||1,2);
      const viewport=p.getViewport({scale:width/natural.width*zoom*ratio});
      canvas.current.width=viewport.width;canvas.current.height=viewport.height;
      canvas.current.style.width=`${viewport.width/ratio}px`;canvas.current.style.height=`${viewport.height/ratio}px`;
      render=p.render({canvas:canvas.current,viewport});await render.promise;
      if(!cancelled)setBusy(false);
    }).catch(()=>{if(!cancelled){setError('Could not display this page. Try another page or open the original.');setBusy(false);}});
    return ()=>{cancelled=true;render?.cancel();};
  },[pdf,page,zoom]);
  return <section aria-label={`PDF reader: ${title}`} className="bg-white text-slate-900 rounded-2xl overflow-hidden">
    <div className="flex flex-wrap gap-2 items-center p-3 border-b">
      <button className="min-h-11 px-3 border rounded-lg" disabled={page<=1||busy} onClick={()=>setPage(p=>p-1)} aria-label="Previous page">←</button>
      <span aria-live="polite">{page} / {pdf?.numPages??'…'}</span>
      <button className="min-h-11 px-3 border rounded-lg" disabled={!pdf||page>=pdf.numPages||busy} onClick={()=>setPage(p=>p+1)} aria-label="Next page">→</button>
      <button className="min-h-11 px-3 border rounded-lg" disabled={zoom<=1||busy} onClick={()=>setZoom(z=>z-.5)} aria-label="Zoom out">−</button>
      <span>{Math.round(zoom*100)}%</span>
      <button className="min-h-11 px-3 border rounded-lg" disabled={zoom>=3||busy} onClick={()=>setZoom(z=>z+.5)} aria-label="Zoom in">+</button>
      <button className="min-h-11 px-3 underline" onClick={()=>void Browser.open({url})}>Open original</button>
    </div>
    {busy&&<p role="status" className="p-3">Loading page…</p>}
    {error&&<p role="alert" className="p-3">{error}</p>}
    <div ref={frame} className="overflow-auto max-h-[75vh] p-3"><canvas ref={canvas} aria-label={`${title}, page ${page}`} className="mx-auto"/></div>
  </section>;
}
