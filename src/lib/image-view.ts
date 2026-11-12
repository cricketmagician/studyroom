export type Point = {x:number;y:number};
export type ImageView = Point & {scale:number};
export type ImageBounds = {width:number;height:number;imageWidth:number;imageHeight:number};
export const FIT_VIEW: ImageView = {scale:1,x:0,y:0};
export function boundView(view:ImageView,bounds:ImageBounds):ImageView {
  const scale=Math.min(8,Math.max(1,view.scale));
  const x=Math.max(0,(bounds.imageWidth*scale-bounds.width)/2);
  const y=Math.max(0,(bounds.imageHeight*scale-bounds.height)/2);
  return {scale,x:Math.max(-x,Math.min(x,view.x)),y:Math.max(-y,Math.min(y,view.y))};
}
export function zoomView(view:ImageView,scale:number,anchor:Point,bounds:ImageBounds):ImageView {
  const next=Math.min(8,Math.max(1,scale)),ratio=next/view.scale;
  return boundView({scale:next,x:anchor.x-(anchor.x-view.x)*ratio,y:anchor.y-(anchor.y-view.y)*ratio},bounds);
}
export function pinchView(view:ImageView,before:Point[],after:Point[],bounds:ImageBounds):ImageView {
  const center=(p:Point[])=>({x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2});
  const distance=(p:Point[])=>Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  const old=center(before),next=center(after),scale=Math.min(8,Math.max(1,view.scale*distance(after)/Math.max(1,distance(before))));
  return boundView({scale,x:next.x-(old.x-view.x)*scale/view.scale,y:next.y-(old.y-view.y)*scale/view.scale},bounds);
}
