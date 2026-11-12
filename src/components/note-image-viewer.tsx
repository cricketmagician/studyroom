"use client";
/* eslint-disable @next/next/no-img-element -- Original local image stays in a blob URL. */
import { useEffect, useRef, useState } from 'react';
import { Download, Maximize, Minus, Plus, X } from 'lucide-react';
import { boundView, FIT_VIEW, ImageBounds, ImageView, pinchView, Point, zoomView } from '@/lib/image-view';
import './note-image-viewer.css';

export function NoteImageViewer({image,onClose}:{image:{name:string;url:string};onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null),stage=useRef<HTMLDivElement>(null),photo=useRef<HTMLImageElement>(null);
  const current=useRef<ImageView>(FIT_VIEW),bounds=useRef<ImageBounds>({width:0,height:0,imageWidth:0,imageHeight:0});
  const pointers=useRef(new Map<number,Point>()),frame=useRef(0),animated=useRef(false);
  const tap=useRef<{at:number;point:Point}|null>(null),start=useRef<Point|null>(null),moved=useRef(false),pointerType=useRef('mouse');
  const [view,setView]=useState(FIT_VIEW),[size,setSize]=useState({width:0,height:0}),[smooth,setSmooth]=useState(false),[error,setError]=useState(false);
  function apply(next:ImageView,animate=false) {
    current.current=boundView(next,bounds.current);animated.current=animate;
    if(!frame.current)frame.current=requestAnimationFrame(()=>{frame.current=0;setView(current.current);setSmooth(animated.current);});
  }
  function measure() {
    const element=stage.current,img=photo.current;
    if(!element || !img?.naturalWidth)return;
    const width=element.clientWidth,height=element.clientHeight,fit=Math.min(width/img.naturalWidth,height/img.naturalHeight,1);
    bounds.current={width,height,imageWidth:img.naturalWidth*fit,imageHeight:img.naturalHeight*fit};
    setSize({width:bounds.current.imageWidth,height:bounds.current.imageHeight});
    apply(current.current);
  }
  function point(clientX:number,clientY:number):Point {
    const rect=stage.current!.getBoundingClientRect();return {x:clientX-rect.left-rect.width/2,y:clientY-rect.top-rect.height/2};
  }
  function zoom(scale:number,anchor:Point={x:0,y:0},animate=true) {apply(zoomView(current.current,scale,anchor,bounds.current),animate);}
  function toggle(anchor:Point) {zoom(current.current.scale>1 ? 1 : 3,anchor);}
  useEffect(()=>{
    dialog.current?.showModal();
    const element=stage.current!;
    const observer=new ResizeObserver(measure);observer.observe(element);
    const wheel=(event:WheelEvent)=>{
      event.preventDefault();
      const delta=event.deltaY*(event.deltaMode===1 ? 16 : event.deltaMode===2 ? element.clientHeight : 1);
      zoom(current.current.scale*Math.exp(-Math.max(-100,Math.min(100,delta))*.005),point(event.clientX,event.clientY),false);
    };
    element.addEventListener('wheel',wheel,{passive:false});
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return ()=>{observer.disconnect();element.removeEventListener('wheel',wheel);cancelAnimationFrame(frame.current);frame.current=0;document.body.style.overflow=overflow;};
    // The viewport handlers read current geometry and transforms from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  function endPointer(event:React.PointerEvent<HTMLDivElement>) {
    if(!pointers.current.has(event.pointerId))return;
    const p=point(event.clientX,event.clientY);
    if(event.type==='pointerup' && event.pointerType!=='mouse' && pointers.current.size===1 && !moved.current) {
      const last=tap.current,now=performance.now();
      if(last && now-last.at<300 && Math.hypot(p.x-last.point.x,p.y-last.point.y)<24){toggle(p);tap.current=null;}
      else tap.current={at:now,point:p};
    }
    pointers.current.delete(event.pointerId);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <dialog ref={dialog} onClose={onClose} aria-label={`Photo viewer: ${image.name}`} className="note-image-viewer" onKeyDown={event=>{
    if(event.ctrlKey || event.metaKey || event.altKey)return;
    if(['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))event.preventDefault();
    if(event.key==='+' || event.key==='=')zoom(current.current.scale*1.25);
    if(event.key==='-')zoom(current.current.scale/1.25);
    if(event.key==='0')apply(FIT_VIEW,true);
    const offset={ArrowLeft:[50,0],ArrowRight:[-50,0],ArrowUp:[0,50],ArrowDown:[0,-50]}[event.key];
    if(offset)apply({...current.current,x:current.current.x+offset[0],y:current.current.y+offset[1]},true);
  }}>
    <header><div><span>YOUR NOTE · ORIGINAL IMAGE</span><strong>{image.name}</strong></div><a href={image.url} download={image.name} aria-label="Download original image"><Download size={21}/></a><button autoFocus onClick={()=>dialog.current?.close()} aria-label="Close photo viewer"><X size={23}/></button></header>
    <div ref={stage} className="note-image-stage" tabIndex={0} aria-label="Zoomable image. Use plus or minus to zoom, arrow keys to pan, and zero to fit." data-zoomed={view.scale>1}
      onDoubleClick={e=>{if(pointerType.current==='mouse')toggle(point(e.clientX,e.clientY));}}
      onPointerDown={e=>{
        if(e.button!==0 || pointers.current.size>=2)return;
        pointerType.current=e.pointerType;const p=point(e.clientX,e.clientY);
        if(!pointers.current.size){start.current=p;moved.current=false;}
        else {moved.current=true;tap.current=null;}
        pointers.current.set(e.pointerId,p);e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e=>{
        const previous=pointers.current.get(e.pointerId);if(!previous)return;
        const before=[...pointers.current.values()],p=point(e.clientX,e.clientY);
        pointers.current.set(e.pointerId,p);
        if(start.current && Math.hypot(p.x-start.current.x,p.y-start.current.y)>8)moved.current=true;
        if(pointers.current.size===2)apply(pinchView(current.current,before,[...pointers.current.values()],bounds.current));
        else apply({...current.current,x:current.current.x+p.x-previous.x,y:current.current.y+p.y-previous.y});
      }} onPointerUp={endPointer} onPointerCancel={endPointer} onLostPointerCapture={endPointer}>
      {error ? <p role="alert">This image could not be opened. Close the viewer and try again.</p> : <img ref={photo} src={image.url} alt={image.name} draggable={false} onLoad={measure} onError={()=>setError(true)} data-smooth={smooth} style={{width:size.width || undefined,height:size.height || undefined,opacity:size.width ? 1 : 0,transform:`translate3d(${view.x}px,${view.y}px,0) scale(${view.scale})`}}/>}
    </div>
    <footer><div role="group" aria-label="Image zoom controls"><button disabled={view.scale<=1 || !size.width} aria-label="Zoom out" onClick={()=>zoom(current.current.scale/1.25)}><Minus size={20}/></button><output aria-label="Zoom relative to fit">{view.scale.toFixed(1)}×</output><button disabled={view.scale>=8 || !size.width} aria-label="Zoom in" onClick={()=>zoom(current.current.scale*1.25)}><Plus size={20}/></button><button className="note-image-fit" aria-label="Fit image to screen" onClick={()=>apply(FIT_VIEW,true)}><Maximize size={17}/>Fit</button></div><p>Pinch or scroll to zoom · Drag to move · Double-tap to zoom · Esc to close</p></footer>
  </dialog>;
}
