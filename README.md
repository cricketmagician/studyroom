# Studyroom

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
   - `storage.rules` → **Storage → Rules → Publish**
5. Install and run:
   ```bash
   npm install
   npm run dev
   ```

## AI study help (optional)

PDFs get an AI **study pack** (summary, key points, terms, exam questions, a 10-question quiz and flashcards) and an **Ask AI** doubt chat that answers only from the file, with page links.

- It starts by itself when a teacher uploads a PDF. The teacher checks it on the file's page and presses **Publish to students**.
- Each student can ask 30 questions a day (`DAILY_QUESTIONS` in `src/lib/server/ai.ts`). Set a monthly spend limit in the Claude Console too.
- Model: Claude Opus 5.5 (`MODEL` in `src/lib/server/ai.ts`). PDFs up to 20 MB.

To turn it on, add your key to `.env.local` (server-side only, never `NEXT_PUBLIC_`):

```bash
ANTHROPIC_API_KEY=...
```

On a real Firebase project, the server also needs Firebase Admin credentials: automatic on Firebase App Hosting, otherwise point `GOOGLE_APPLICATION_CREDENTIALS` at a service-account key. AI routes need a server, so deploy to Firebase App Hosting or Vercel (not static hosting).

## Making someone a teacher

1. They sign up normally at `/register`.
2. In **Firestore → profiles → (their document)**, change `role` from `student` to `teacher`.

Their page switches to the teacher view right away. Users can never change their own role.

## Checks

```bash
npm test && npm run lint && npm run build
```
