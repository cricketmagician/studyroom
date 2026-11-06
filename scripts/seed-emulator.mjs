// Creates test accounts in the local Firebase Emulator. Run by `npm run local`; safe to run again.
// These work ONLY on the local emulator, never on a real Firebase project.
export const TEST_USERS = [
  { name: "Test Teacher", email: "teacher@studyroom.test", password: "xLy51v4eSXqyyP", role: "teacher" },
  { name: "Test Student", email: "student@studyroom.test", password: "383INOPInE1xUH", role: "student" },
];

const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts";
const DOCS = "http://127.0.0.1:8080/v1/projects/demo-studyroom/databases/(default)/documents";

async function post(url, body) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json() };
}

for (const u of TEST_USERS) {
  const creds = { email: u.email, password: u.password, returnSecureToken: true };
  let res = await post(`${AUTH}:signUp?key=demo-key`, creds);
  if (!res.ok && res.data.error?.message === "EMAIL_EXISTS") res = await post(`${AUTH}:signInWithPassword?key=demo-key`, creds);
  if (!res.ok) throw new Error(`Could not create ${u.email}: ${JSON.stringify(res.data)}`);

  // "Bearer owner" lets the emulator skip security rules, so we can set the teacher role.
  const profile = await fetch(`${DOCS}/profiles/${res.data.localId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: "Bearer owner" },
    body: JSON.stringify({ fields: { name: { stringValue: u.name }, email: { stringValue: u.email }, role: { stringValue: u.role } } }),
  });
  if (!profile.ok) throw new Error(`Could not save profile for ${u.email}: ${await profile.text()}`);
}

console.log("\n  Test accounts ready (passwords are in scripts/seed-emulator.mjs):");
for (const u of TEST_USERS) console.log(`    ${u.role.padEnd(8)} ${u.email}`);
console.log("  Open http://localhost:3001\n");
