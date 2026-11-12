// Run only against the local demo stack: node scripts/check-study.mjs
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
const app = initializeApp({projectId:'demo-studyroom'}, 'study-check');
const db = getFirestore(app);
const auth = getAuth(app);
const created = [];
const materials = [], challengeIds = [];
const runId = randomUUID();
async function makeUser(role) {
  const email = `check-${created.length}-${runId}@studyroom.test`;
  const password = randomUUID();
  const r = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,returnSecureToken:true})});
  const user = await r.json();
  assert.ok(user.localId, JSON.stringify(user));
  created.push(user.localId);
  if (role === 'teacher') {
    await db.doc(`profiles/${user.localId}`).set({ name:'Integration check',email,role,level:'Foundation' });
  } else {
    const name = `projects/demo-studyroom/databases/(default)/documents/profiles/${user.localId}`;
    const fields = Object.fromEntries(Object.entries({ name:'Integration check',email,role,level:'Foundation' }).map(([key,value])=>[key,{stringValue:value}]));
    const created = await fetch('http://127.0.0.1:8080/v1/projects/demo-studyroom/databases/(default)/documents:commit',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${user.idToken}`},body:JSON.stringify({writes:[{update:{name,fields},updateTransforms:[{fieldPath:'createdAt',setToServerValue:'REQUEST_TIME'}]}]})});
    assert.equal(created.status,200,await created.text());
  }
  return {uid:user.localId,token:user.idToken};
}
async function api(user, body, status=200, path='/api/study') {
  const r = await fetch(`http://localhost:3001${path}`, {method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${user.token}`},body:JSON.stringify(body)});
  const data = await r.json();
  assert.equal(r.status,status,JSON.stringify(data)); return data;
}
try {
  const student = await makeUser('student'), friend = await makeUser('student'), teacher = await makeUser('teacher');
  await api(student,{action:'admin'},403);
  await api(student,{action:'detail',uid:friend.uid},403);
  await api(student,{action:'level',level:'Final'});
  await api(student,{action:'goal',minutes:0},400);
  await api(student,{action:'goal',minutes:120});
  let detail = await api(student,{action:'detail'});
  assert.equal(detail.state.checkinCount,1,'opening the app checks the student in automatically');
  assert.equal(detail.state.dailyGoalMinutes,120);
  await Promise.all([api(student,{action:'checkin'}),api(student,{action:'checkin'})]);
  detail = await api(student,{action:'detail'});
  assert.equal(detail.state.checkinCount,1);
  await api(student,{action:'start',subject:'invalid'},400);
  await api(student,{action:'start',subject:'20A'});
  await api(student,{action:'start',subject:'20A'},409);
  detail = await api(student,{action:'detail'});
  const id = detail.state.active.id;
  await api(student,{action:'tick',sessionId:'wrong'},409);
  await db.doc(`studyUsers/${student.uid}`).update({'active.last':Date.now()-30000});
  await api(student,{action:'stop',sessionId:id});
  await api(student,{action:'stop',sessionId:id},409);
  detail = await api(student,{action:'detail'});
  assert.ok(detail.state.totalSeconds >= 30 && detail.state.totalSeconds <= 90);
  assert.equal(detail.state.active,null);
  assert.equal(detail.sessions.length,1);
  assert.equal(detail.daily.reduce((sum,d)=>sum+d.seconds,0),detail.state.totalSeconds);
  assert.equal(detail.daily[0].subjects['20A'],detail.state.totalSeconds);
  const {token} = await api(student,{action:'invite'});
  await api(student,{action:'accept',token},400);
  await api(friend,{action:'accept',token});
  await api(friend,{action:'accept',token});
  const friends = await api(student,{action:'friends'});
  assert.equal(friends.friends.length,1);
  assert.equal(friends.friends[0].email,undefined);
  await api(student,{action:'chat_send',friendId:friend.uid,text:'hi'});
  assert.equal((await api(friend,{action:'chat_messages',friendId:student.uid})).messages.length,1);
  await api(teacher,{action:'chat_messages',friendId:student.uid},403);
  await api(teacher,{action:'chat_send',friendId:student.uid,text:'hi'},403);
  await api(student,{action:'chat_messages',friendId:`${friend.uid}/x`},400);
  const {code} = await api(teacher,{action:'invite'});
  assert.match(code,/^CMA-[A-Z0-9]{6}$/);
  await api(student,{action:'accept',code:'../profiles/x'},400);
  await api(student,{action:'challenge_create',title:'Bad',targetHours:-5,subject:'All Subjects'},400);
  await api(student,{action:'challenge_create',title:'Bad',targetHours:10,subject:'x'.repeat(500)},400);
  await api(student,{action:'challenge_join',challengeId:'missing-challenge'},404);
  await api(student,{action:'challenge_join',challengeId:'a/b'},400);
  // Challenges stay inside a friend circle and carry a leaderboard; unfriending removes chat access.
  const made = await api(student,{action:'challenge_create',title:'Week sprint',targetHours:5,subject:'All Subjects'});
  challengeIds.push(made.challenge.id);
  assert.ok(!(await api(teacher,{action:'challenge_list'})).challenges.some(c=>c.id===made.challenge.id));
  await api(teacher,{action:'challenge_join',challengeId:made.challenge.id},403);
  await api(friend,{action:'challenge_join',challengeId:made.challenge.id});
  const seen = (await api(friend,{action:'challenge_list'})).challenges.find(c=>c.id===made.challenge.id);
  assert.equal(seen.board.length,2);
  assert.ok(seen.board.find(b=>b.uid===student.uid).seconds >= 30);
  await api(friend,{action:'unfriend',friendId:student.uid});
  await api(student,{action:'chat_messages',friendId:friend.uid},403);
  assert.equal((await api(student,{action:'friends'})).friends.length,0);
  await api(student,{title:'Private test',subjectId:'1',url:'https://example.com/a.pdf',type:'pdf'},403,'/api/materials');
  await api(teacher,{title:'Private test',subjectId:'1',url:'javascript:alert(1)',type:'pdf'},400,'/api/materials');
  const m = await api(teacher,{title:'Integration test material',subjectId:'1',url:'https://example.com/a.pdf',type:'pdf'},200,'/api/materials');
  materials.push(m.id);
  await api(student,{action:'open',materialId:m.id});
  detail = await api(teacher,{action:'detail',uid:student.uid});
  assert.equal(detail.opened[0].title,'Integration test material');
  await api(student,{materialId:m.id},403,'/api/files/delete');
  await api(teacher,{materialId:m.id},200,'/api/files/delete');
  assert.equal((await db.doc(`materials/${m.id}`).get()).exists,false);
  const roster = await api(teacher,{action:'admin'});
  assert.ok(roster.students.some(s=>s.id===student.uid && s.checkinCount===1));
  const form = new FormData();
  form.set('file', new Blob(['%PDF-1.4\n% local upload test'], {type:'application/pdf'}), 'test.pdf');
  form.set('title', 'Integration upload'); form.set('subjectId', '1');
  const upload = await fetch('http://localhost:3001/api/files/local', {method:'POST',headers:{Authorization:`Bearer ${teacher.token}`},body:form});
  const uploaded = await upload.json();
  assert.equal(upload.status,200,JSON.stringify(uploaded));
  materials.push(uploaded.id);
  const download = await fetch(`http://localhost:3001/api/files/local?id=${uploaded.id}`);
  assert.equal(download.headers.get('content-type'),'application/pdf');
  assert.ok((await download.text()).startsWith('%PDF-1.4'));
  await api(teacher,{materialId:uploaded.id},200,'/api/files/delete');
  assert.equal((await fetch(`http://localhost:3001/api/files/local?id=${uploaded.id}`)).status,404);
  console.log('PASS: permissions, check-in deduplication, subject validation, timer concurrency, persisted time, friend invites, material sharing and deletion.');
} finally {
  for (const uid of created) {
    await db.recursiveDelete(db.doc(`studyUsers/${uid}`));
    await db.doc(`profiles/${uid}`).delete();
    const links = await db.collection('friendships').where('members','array-contains',uid).get();
    for (const d of links.docs) await db.recursiveDelete(d.ref);
    for (const name of ['invites','inviteCodes']) {
      const invites = await db.collection(name).where('uid','==',uid).get();
      for (const d of invites.docs) await d.ref.delete();
    }
    await auth.deleteUser(uid);
  }
  for(const id of materials) await db.doc(`materials/${id}`).delete();
  for(const id of challengeIds) await db.doc(`challenges/${id}`).delete();
}
