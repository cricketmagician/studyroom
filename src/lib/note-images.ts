export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_NOTE_IMAGES = 20;
const MAX_NOTE_IMAGE_BYTES = 100 * 1024 * 1024;
export type NoteImage = { uid: string; noteId: string; id: string; name: string; blob: Blob; createdAt: number };
export type ImageSummary = { count: number; bytes: number };

export function validateImageFiles(files: Pick<File, 'name' | 'size' | 'type'>[], existing: ImageSummary) {
  if (!files.length) throw new Error('Choose a photo or screenshot.');
  if (existing.count + files.length > MAX_NOTE_IMAGES) throw new Error('A note can hold up to 20 images.');
  for (const file of files) {
    if (!IMAGE_TYPES.includes(file.type)) throw new Error('Use JPG, PNG, WebP or GIF images. Convert HEIC photos to JPG first.');
    if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name || 'Each image'} must be between 1 byte and 10 MB.`);
  }
  if (existing.bytes + files.reduce((sum,f) => sum + f.size,0) > MAX_NOTE_IMAGE_BYTES) throw new Error('Keep images in one note under 100 MB.');
}

export function imageStorageError(error: unknown) {
  if ((error as {name?:string})?.name === 'QuotaExceededError') return 'Your browser storage is full. Download a backup, then remove images you no longer need. These new images were not saved.';
  return error instanceof Error ? error.message : 'Could not access device storage. Try again in a regular browser window.';
}

function openImages(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('Device storage is unavailable in this browser.'));
  return new Promise((resolve,reject) => {
    const request = indexedDB.open('studyroom-note-images',1);
    let blocked = false;
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore('images',{keyPath:['uid','noteId','id']});
      store.createIndex('note',['uid','noteId']);
      store.createIndex('user','uid');
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => { blocked = true; reject(new Error('Close other Abhyas tabs and try device storage again.')); };
    request.onsuccess = () => {
      if (blocked) { request.result.close(); return; }
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}

async function imagesTransaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, result: (value:T) => void, fail: (error:Error) => void) => void): Promise<T> {
  const db = await openImages();
  return new Promise((resolve,reject) => {
    const tx = db.transaction('images',mode);
    let result: T, failure: Error | null = null;
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onabort = () => { db.close(); reject(failure ?? tx.error ?? new Error('Images could not be saved. Please try again.')); };
    const fail = (error:Error) => { failure=error; tx.abort(); };
    try { run(tx.objectStore('images'), value => { result=value; }, fail); }
    catch (error) { fail(error as Error); }
  });
}

export function listNoteImages(uid: string, noteId: string) {
  return imagesTransaction<NoteImage[]>('readonly',(store,result) => {
    const request = store.index('note').getAll([uid,noteId]);
    request.onsuccess = () => result((request.result as NoteImage[]).sort((a,b) => a.createdAt-b.createdAt || a.id.localeCompare(b.id)));
  });
}

export function listImageSummaries(uid: string) {
  return imagesTransaction<Record<string, ImageSummary>>('readonly',(store,result) => {
    const summaries: Record<string, ImageSummary> = Object.create(null);
    const cursor = store.index('user').openCursor(IDBKeyRange.only(uid));
    cursor.onsuccess = () => {
      if (!cursor.result) { result(summaries); return; }
      const image = cursor.result.value as NoteImage;
      const summary = summaries[image.noteId] ??= {count:0,bytes:0};
      summary.count++; summary.bytes += image.blob.size;
      cursor.result.continue();
    };
  });
}

export async function addNoteImages(uid: string, noteId: string, files: File[]) {
  validateImageFiles(files,{count:0,bytes:0});
  // Decode before saving so renamed or corrupt files never look like saved photos.
  for (const file of files) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image(); image.src = url;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 40000000) throw new Error('Use images smaller than 40 megapixels.');
    } catch (error) {
      throw new Error(error instanceof Error && error.message.includes('megapixels') ? error.message : `${file.name || 'This image'} could not be opened. Choose a valid image.`);
    } finally { URL.revokeObjectURL(url); }
  }
  await imagesTransaction<void>('readwrite',(store,result,fail) => {
    const request = store.index('note').getAll([uid,noteId]);
    request.onsuccess = () => {
      const existing = request.result as NoteImage[];
      try {
        validateImageFiles(files,{count:existing.length,bytes:existing.reduce((sum,image) => sum+image.blob.size,0)});
        files.forEach((file,index) => store.add({uid,noteId,id:crypto.randomUUID(),name:file.name.slice(0,200) || 'Screenshot',blob:file,createdAt:Date.now()+index} satisfies NoteImage));
        result();
      } catch (error) { fail(error as Error); }
    };
  });
}

export function removeNoteImage(uid: string, noteId: string, id: string) {
  return imagesTransaction<void>('readwrite',(store,result) => { store.delete([uid,noteId,id]); result(); });
}

export function deleteLocalNoteImages(uid: string, noteId: string) {
  return imagesTransaction<void>('readwrite',(store,result) => {
    const cursor = store.index('note').openKeyCursor(IDBKeyRange.only([uid,noteId]));
    cursor.onsuccess = () => {
      if (!cursor.result) { result(); return; }
      store.delete(cursor.result.primaryKey); cursor.result.continue();
    };
  });
}
