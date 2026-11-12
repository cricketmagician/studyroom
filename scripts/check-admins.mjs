// Requires the demo Firebase emulators and the emulator app on port 3002. Never uses real credentials.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST='127.0.0.1:8080';
const app=initializeApp({projectId:'demo-studyroom'},'admin-tests');
const auth=getAuth(app), db=getFirestore(app), created=[];
const identity='http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts';
async function account(role, verified=true) {
  const email=`admin-check-${randomUUID()}@example.test`, password=randomUUID();
  const response=await fetch(identity+':signUp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
  const data=await response.json();assert.ok(data.localId);
  created.push(data.localId);
  await auth.updateUser(data.localId,{emailVerified:verified});
  await db.doc('profiles/'+data.localId).set({name:'Access test',email,role,level:'Final'});
  return {uid:data.localId,email,token:data.idToken};
}
async function call(user, body, expected=200) {
  const r=await fetch('http://localhost:3002/api/admins',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+user.token},body:JSON.stringify(body)});
  const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));return data;
}
try {
  const admin=await account('teacher'), student=await account('student'), unverified=await account('student',false);
  await call(student,{action:'list'},403);
  await call(student,{action:'grant',email:student.email},403);
  assert.equal((await db.doc('profiles/'+student.uid).get()).get('role'),'student');
  await call(admin,{action:'grant',email:{value:student.email}},400);
  await call(admin,{action:'grant',email:'not-an-email'},400);
  await call(admin,{action:'grant',email:'missing-'+randomUUID()+'@example.test'},404);
  await call(admin,{action:'grant',email:unverified.email},400);
  await db.doc(`profiles/${student.uid}/notes/keep`).set({body:'Preserve existing notes'});
  const granted=await call(admin,{action:'grant',email:student.email.toUpperCase()});assert.equal(granted.changed,true);
  const profile=(await db.doc('profiles/'+student.uid).get()).data();
  assert.equal(profile.role,'teacher');assert.equal(profile.level,'Final');assert.equal(profile.roleGrantedBy,admin.uid);
  assert.equal((await db.doc(`profiles/${student.uid}/notes/keep`).get()).get('body'),'Preserve existing notes');
  assert.equal((await call(admin,{action:'grant',email:student.email})).changed,false);
  assert.ok((await call(student,{action:'list'})).admins.some(a=>a.id===student.uid));
  await auth.updateUser(unverified.uid,{emailVerified:true,disabled:true});
  await call(admin,{action:'grant',email:unverified.email},400);
  // Reserving an email without a password must keep its UID when its owner first uses Google.
  const reserved=await auth.createUser({email:`reserved-${randomUUID()}@gmail.com`});created.push(reserved.uid);
  const jwt=Buffer.from(JSON.stringify({alg:'none',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:randomUUID(),email:reserved.email,email_verified:true,name:'Google Owner',iss:'https://accounts.google.com'})).toString('base64url')+'.';
  const signIn=await fetch(identity+':signInWithIdp?key=demo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({postBody:'providerId=google.com&id_token='+encodeURIComponent(jwt),requestUri:'http://localhost:3002',returnSecureToken:true})});
  const signedIn=await signIn.json();assert.equal(signIn.status,200,JSON.stringify(signedIn));assert.equal(signedIn.localId,reserved.uid);
  console.log('PASS: admin-only access, validation, verified recipients, promotion persistence, preserved data, duplicate grants and Google account linking.');
} finally {
  for(const uid of created) {await db.recursiveDelete(db.doc('profiles/'+uid));await auth.deleteUser(uid);}
}
