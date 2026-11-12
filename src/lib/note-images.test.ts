import test from 'node:test';
import assert from 'node:assert/strict';
import { imageStorageError, listNoteImages, MAX_IMAGE_BYTES, validateImageFiles } from './note-images';

const empty = {count:0,bytes:0};
const photo = {name:'screenshot.png',type:'image/png',size:12000};
test('note photos accept raster images and reject unsupported, empty and oversized files', () => {
  assert.doesNotThrow(() => validateImageFiles([photo],empty));
  for (const patch of [{type:'image/svg+xml'}, {type:'text/html'}, {type:'image/heic'}, {size:0}, {size:MAX_IMAGE_BYTES+1}]) {
    assert.throws(() => validateImageFiles([{...photo,...patch}],empty));
  }
  assert.throws(() => validateImageFiles([],empty));
});
test('per-note limits include already saved images and the entire incoming batch', () => {
  assert.doesNotThrow(() => validateImageFiles([photo],{count:19,bytes:0}));
  assert.throws(() => validateImageFiles([photo,photo],{count:19,bytes:0}));
  assert.throws(() => validateImageFiles([photo],{count:1,bytes:100*1024*1024}));
});
test('unavailable storage and quota failures are explicit rather than reported as saved', async () => {
  await assert.rejects(listNoteImages('user-a','note-a'),/storage is unavailable/);
  assert.match(imageStorageError({name:'QuotaExceededError'}),/not saved/);
  assert.equal(imageStorageError(new Error('Permission denied')),'Permission denied');
});
