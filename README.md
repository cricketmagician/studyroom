# Studyroom

## CMA study workspace

Real services run with `npm run dev -- -p 3001` and the Firebase/Gemini values in `.env.local`. For local Firebase Admin access, point `GOOGLE_APPLICATION_CREDENTIALS` at the ignored `.secrets/firebase-admin.json`. Credentials and API keys stay out of Git. `npm run local` remains a separate disposable emulator mode.

Login and registration include Google sign-in. Enable Google in Firebase Authentication → Sign-in method, choose the public support email, and authorize the app domain (`localhost` for local development). A first Google login creates a student profile; existing profiles and admin roles are preserved.

The library follows subject collections → PDF/video resource lists, with saved-resource filtering and completion progress. The home screen prioritizes the study timer and an editable, account-saved daily goal. Footer navigation has four primary destinations and an accessible More dialog for the remaining tools. See `docs/ui-ux-audit.md` for the source audit and redesign decisions.

The home dashboard supports Foundation, Intermediate and Final papers from ICMAI Syllabus 2022 (including Final electives). It uses the supplied Apfel Grotezk and Absans fonts, supplied OutlineTone/Hipster illustrations, and a Tegaki-generated handwriting SVG.

- Students register with their CMA level and are checked in automatically once per India calendar day when they open the app. They can start/pause a subject timer, mark materials done, keep notes/tasks and invite friends through a link valid for seven days.
- Focus time is saved by date and subject, including sessions crossing India midnight. Progress shows today, the Monday–Sunday week, this month and all time. The recent daily breakdown covers 90 days; older daily records remain stored. Previously saved all-time totals are preserved.
- Every screen uses the footer navigation for Home, Library, Progress, Friends, Planner, Notes and Profile, plus Admin for teachers. The footer scrolls on narrow screens.
- `/admin` is restricted to the existing `teacher` role. It shows all registered students, email, level, check-in totals/dates, subject sessions and recently opened materials. The roster refreshes every 30 seconds. Activity is disclosed at signup and on the dashboard; friends only see names.
- Timer state is persisted on the server every 30 seconds across app pages. Keep the app open while studying; inactivity or connection loss can count at most 90 additional seconds. Time measures a running timer, not learning or attendance verification.
- Admins publish PDFs/videos by upload or HTTPS link. Local emulator mode stores uploads under ignored `.local-uploads/`, limited to 25 MB each. Production uploads use the existing Vercel Blob setup. File URLs are accessible to anyone holding the link. External video hosts open in a new tab.
- Publish the updated `firestore.rules` when deploying. Study activity and friendships are accessible only through authenticated server routes. Production needs Firebase Admin credentials and Blob storage; emulator accounts and activity disappear when its process stops.
- `npm test` checks core logic. With `npm run local` running, `node scripts/check-study.mjs` checks permissions, duplicate check-ins, timer persistence, friend invites and upload/delete APIs using disposable emulator accounts.
- Illustration sources: the user's downloaded OutlineTone People and Hipster packs. Confirm their distribution licence before public release.


Teachers upload PDFs and videos. Students log in and open them. That's it.

- `/login`, `/register`, `/forgot-password`: Firebase email/password login. Everyone who signs up is a **student**.
- `/teacher`: upload a file and see or delete your own uploads (teachers only).
- `/learn`: all files; `/learn/<id>` opens a PDF or plays a video.

## Try it on this computer (no Firebase account needed)

Needs Node 20+ and Java 21+.

```bash
npm install
npm run local
```

This starts a local Firebase (emulator) with two test accounts, then opens the app at http://localhost:3001.
The login emails are `teacher@studyroom.test` and `student@studyroom.test`; their passwords are in `scripts/seed-emulator.mjs`.
These accounts work only locally. Uploaded files are lost when you stop `npm run local`.

## One-time setup (real Firebase, for students to use)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
   File uploads need **Cloud Storage**, which on new projects requires the Blaze (pay-as-you-go) plan.
2. In the project, turn on:
   - **Authentication → Sign-in method → Email/Password**
   - **Firestore Database**
   - **Storage**
3. **Project settings → Your apps → Web app**: copy the config values into `.env.local`, using `.env.example` as the template.
4. Paste the security rules:
   - `firestore.rules` → **Firestore → Rules → Publish**
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## AI study help (optional)

When a teacher uploads a PDF, AI reads it **once** and makes a study pack: summary, key points, terms, exam questions, a mind map, a 10-question quiz and flashcards. The teacher checks it on the file's page and presses **Publish to students**. Students only read what was published, so they cost no AI tokens.

- Teachers also get an **Ask AI** chat on each PDF (answers only from the file, with page links). Students don't get the chat.
- Each teacher can ask 30 questions a day (`DAILY_QUESTIONS` in `src/lib/server/ai.ts`). Set a budget alert in Google AI Studio / Cloud billing too.
- Model: Gemini 3.1 Flash-Lite (`MODEL` in `src/lib/server/ai.ts`). PDFs up to 14 MB.

To turn it on, add your key to `.env.local` (server-side only, never `NEXT_PUBLIC_`):

```bash
GEMINI_API_KEY=...
```

On a real Firebase project, the server also needs Firebase Admin credentials: automatic on Firebase App Hosting, otherwise point `GOOGLE_APPLICATION_CREDENTIALS` at a service-account key. AI routes need a server, so deploy to Firebase App Hosting or Vercel (not static hosting).

## Going live on Vercel

1. Do the one-time Firebase setup above (Blaze plan, Email/Password, Firestore, Storage, a Web app) and publish both rules files.
2. Firebase console → Project settings → **Service accounts** → **Generate new private key**. Keep this JSON file secret.
3. In Vercel → your project → Settings → **Environment Variables**, add:
   - the six `NEXT_PUBLIC_FIREBASE_*` values from your Web app config
   - `GEMINI_API_KEY`
   - `FIREBASE_SERVICE_ACCOUNT`: the whole JSON file's contents
4. Deploy (`npx vercel --prod`), then add the Vercel domain under Firebase → Authentication → Settings → **Authorized domains**.

## Giving someone admin access

1. Ask them to sign in to this app using Google so their email is verified and their profile exists.
2. Open **More → Admin → Admin access**.
3. Enter their registered email and confirm **Make admin**.

Admins can view student activity, publish resources and appoint other admins. The existing stored role is named `teacher`; the app displays it as Admin. Role changes run on the server, record who granted access and preserve existing progress. Students cannot update roles directly. Removing admins is not exposed by this flow.

The initial `kumarnihal829@gmail.com` admin account is reserved in real Firebase; its owner can use Google sign-in without setting a password here.

To check access changes against disposable local accounts, run the Firebase emulators and emulator app on port 3002, then `node scripts/check-admins.mjs`. The script never uses real Firebase credentials.

## Routines

Open **More → Routines**, or use the routine preview on Home. Templates and custom routines support categories, IST start times, durations, one-time/daily/weekday/custom schedules, notes, editing and deletion. Tick today's occurrence to save its completion; each day's history is kept separately. Routine completion never adds focus hours.

The authenticated `/api/routines` endpoint stores schedules at `profiles/{uid}/private/routines` and daily completion at `profiles/{uid}/routineDays/{YYYY-MM-DD}`. The server derives the UID from the verified token; direct browser access is denied by existing Firestore rules. Each account can keep 50 routines. No new rule deployment is required.

Reminders appear inside the app while it is open, checked every minute. There is no closed-app push or SMS delivery. Home and the Routines page refresh on returning to the app and every visible minute.

With the demo emulators and emulator app on port 3002, run `node scripts/check-routines.mjs` to check persistence, editing, completion history and account isolation with disposable users.

## Photos in personal notes

Notes support image attachments through the file picker, drag/drop, or pasting into the photo area. Originals are stored as IndexedDB blobs in `studyroom-note-images`, scoped by Firebase UID and note ID. Images never go to Firebase or an upload endpoint; existing text notes continue to sync to Firebase. Image-only and unfinished notes remain in the notebook.

Supported formats: JPEG, PNG, WebP and GIF, up to 10 MB / 40 megapixels each, 20 images and 100 MB per note. Batch writes are atomic and quota failures are shown explicitly. Students can preview, download or remove originals, and request persistent browser storage. Persistence depends on browser support and permission, and does not protect against clearing site data. Images are tied to the browser profile and site origin; they do not move between devices or from localhost to a deployed domain. Download important originals before changing browsers or clearing storage. Deleting a note clears its images on the current browser only.

## Checks

```bash
npm test && npm run lint && npm run build
```
