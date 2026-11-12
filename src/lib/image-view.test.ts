import test from 'node:test';
import assert from 'node:assert/strict';
import { boundView, FIT_VIEW, pinchView, zoomView } from './image-view';
const bounds={width:400,height:300,imageWidth:400,imageHeight:300};
test('zoom stays anchored to the pointer and respects zoom limits',()=>{
  assert.deepEqual(zoomView(FIT_VIEW,2,{x:100,y:50},bounds),{scale:2,x:-100,y:-50});
  assert.equal(zoomView(FIT_VIEW,99,{x:0,y:0},bounds).scale,8);
  assert.deepEqual(zoomView({scale:3,x:150,y:100},0,{x:0,y:0},bounds),FIT_VIEW);
});
test('panning never loses the photo outside the viewport, including narrow screenshots',()=>{
  assert.deepEqual(boundView({scale:2,x:999,y:-999},bounds),{scale:2,x:200,y:-150});
  assert.deepEqual(boundView({scale:2,x:100,y:100},{...bounds,imageWidth:100}),{scale:2,x:0,y:100});
});
test('pinch combines two-finger zoom and translation without jumps',()=>{
  assert.deepEqual(pinchView(FIT_VIEW,[{x:-50,y:0},{x:50,y:0}],[{x:-80,y:20},{x:120,y:20}],bounds),{scale:2,x:20,y:20});
  const view=pinchView(FIT_VIEW,[{x:0,y:0},{x:0,y:0}],[{x:0,y:0},{x:0,y:0}],bounds);
  assert.deepEqual(view,FIT_VIEW);
});
