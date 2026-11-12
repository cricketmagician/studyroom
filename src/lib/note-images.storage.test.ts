import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';
import { IDBFactory, IDBObjectStore } from 'fake-indexeddb';
import { addNoteImages, deleteLocalNoteImages, listImageSummaries, listNoteImages, removeNoteImage } from './note-images';

// These tests exercise transactions and blobs; real browser image decoding is separate.
class DecodedImage {
  src = ''; naturalWidth = 1; naturalHeight = 1;
  async decode() {}
}
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1cAAAAASUVORK5CYII=','base64');
const photo = () => new File([png],'screenshot.png',{type:'image/png'});
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  globalThis.Image = DecodedImage as unknown as typeof Image;
});

test('original image blobs survive closing and reopening the note database', async () => {
  await addNoteImages('alice','revision',[photo()]);
  const first = await listNoteImages('alice','revision');
  const reopened = await listNoteImages('alice','revision');
  assert.equal(reopened.length,1);
  assert.equal(reopened[0].id,first[0].id);
  assert.deepEqual(Buffer.from(await reopened[0].blob.arrayBuffer()),png);
  assert.deepEqual((await listImageSummaries('alice')).revision,{count:1,bytes:png.length});
});

test('image reads, deletions and summaries stay scoped to the account and note', async () => {
  await addNoteImages('alice','revision',[photo(),photo()]);
  await addNoteImages('alice','other-note',[photo()]);
  await addNoteImages('bob','revision',[photo()]);
  const alice = await listNoteImages('alice','revision');
  await removeNoteImage('bob','revision',alice[0].id);
  assert.equal((await listNoteImages('alice','revision')).length,2);
  assert.equal((await listNoteImages('bob','revision')).length,1);
  await addNoteImages('alice','__proto__',[photo()]);
  assert.deepEqual((await listImageSummaries('alice'))['__proto__'],{count:1,bytes:png.length});
  assert.equal((await listNoteImages('unknown-user','revision')).length,0);
  await removeNoteImage('alice','revision',alice[0].id);
  assert.equal((await listNoteImages('alice','revision')).length,1);
  await deleteLocalNoteImages('alice','revision');
  assert.deepEqual(await listNoteImages('alice','revision'),[]);
  assert.equal((await listNoteImages('alice','other-note')).length,1);
  assert.equal((await listNoteImages('bob','revision')).length,1);
});

test('concurrent image batches cannot bypass the per-note limit', async () => {
  const results = await Promise.allSettled([
    addNoteImages('alice','revision',Array.from({length:11},photo)),
    addNoteImages('alice','revision',Array.from({length:11},photo)),
  ]);
  assert.equal(results.filter(result => result.status==='fulfilled').length,1);
  assert.equal((await listNoteImages('alice','revision')).length,11);
});

test('failed decode does not create an image record', async () => {
  globalThis.Image = class extends DecodedImage { async decode() {throw new Error('Invalid image');} } as unknown as typeof Image;
  await assert.rejects(addNoteImages('alice','revision',[photo()]),/could not be opened/);
  assert.deepEqual(await listNoteImages('alice','revision'),[]);
});

test('a quota failure rolls back the entire image batch', async t => {
  const add = IDBObjectStore.prototype.add;
  let writes = 0;
  t.mock.method(IDBObjectStore.prototype,'add',function(this:IDBObjectStore,...args:Parameters<IDBObjectStore['add']>) {
    if (++writes===2) throw new DOMException('Full','QuotaExceededError');
    return add.apply(this,args);
  });
  await assert.rejects(addNoteImages('alice','revision',[photo(),photo()]),{name:'QuotaExceededError'});
  assert.deepEqual(await listNoteImages('alice','revision'),[]);
});
