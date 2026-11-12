// Integration checks against demo emulators only; no real credentials or student data.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
const app = initializeApp({projectId:'demo-studyroom'}, 'routine-check');
const auth = getAuth(app), db = getFirestore(app), users = [];
const identity = 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key';
async function account() {
  const email = `routine-${randomUUID()}@example.test`;
  const response = await fetch(identity, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:randomUUID(),returnSecureToken:true}),signal:AbortSignal.timeout(15000)});
  const user = await response.json();
  assert.equal(response.status,200); users.push(user.localId);
  await db.doc(`profiles/${user.localId}`).set({name:'Routine test',email,role:'student'});
  return user;
}
async function call(user, body, expected=200) {
  const res = await fetch('http://localhost:3002/api/routines', {method:'POST',headers:{'Content-Type':'application/json',...(user ? {Authorization:`Bearer ${user.idToken}`} : {})},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
  const data = await res.json(); assert.equal(res.status,expected,JSON.stringify(data)); return data;
}
try {
  const owner = await account(), other = await account();
  await call(null,{action:'list'},401);
  const empty = await call(owner,{action:'list'}); assert.deepEqual(empty.items,[]);
  const routine = {title:'Revision',category:'Study',time:'18:00',minutes:60,repeat:'Daily',days:[],startDate:empty.day,reminder:10,note:'Chapter 4'};
  await call(owner,{action:'save',routine:{...routine,time:'25:00'}},400);
  await call(owner,{action:'save',routine:{...routine,repeat:'Custom',days:[]}},400);
  const saved = await call(owner,{action:'save',routine}); const id = saved.items[0].id;
  assert.equal((await call(owner,{action:'list'})).items[0].note,'Chapter 4');
  assert.deepEqual((await call(other,{action:'list',uid:owner.localId})).items,[]);
  await call(other,{action:'save',id,routine},404);
  await call(other,{action:'delete',id},404);
  await call(owner,{action:'complete',id,day:'2000-01-01',done:true},400);
  await call(owner,{action:'complete',id,day:empty.day,done:'yes'},400);
  assert.deepEqual((await call(owner,{action:'complete',id,day:empty.day,done:true})).done,[id]);
  assert.deepEqual((await call(owner,{action:'complete',id,day:empty.day,done:true})).done,[id]);
  assert.deepEqual((await call(owner,{action:'list'})).done,[id]);
  assert.deepEqual((await call(owner,{action:'complete',id,day:empty.day,done:false})).done,[]);
  const edited = await call(owner,{action:'save',id,routine:{...routine,title:'Revised title'}});
  assert.equal(edited.items.length,1); assert.equal(edited.items[0].title,'Revised title');
  await db.doc(`profiles/${owner.localId}/routineDays/2000-01-01`).set({done:[id]});
  await call(owner,{action:'complete',id,day:empty.day,done:true});
  assert.deepEqual((await db.doc(`profiles/${owner.localId}/routineDays/2000-01-01`).get()).get('done'),[id]);
  assert.equal((await db.doc(`studyUsers/${owner.localId}`).get()).exists,false);
  const denied = await fetch(`http://127.0.0.1:8080/v1/projects/demo-studyroom/databases/(default)/documents/profiles/${owner.localId}/private/routines`,{headers:{Authorization:`Bearer ${other.idToken}`},signal:AbortSignal.timeout(15000)});
  assert.equal(denied.status,403);
  assert.deepEqual((await call(owner,{action:'delete',id})).items,[]);
  await call(owner,{action:'complete',id,day:empty.day,done:true},404);
  console.log('PASS: routine CRUD, saved daily completion, history preservation, validation, cross-account isolation and no inflated study hours.');
} finally {
  for (const uid of users) { await db.recursiveDelete(db.doc(`profiles/${uid}`)); await auth.deleteUser(uid); }
}
