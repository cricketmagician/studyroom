# Studyroom

Teachers upload PDFs and videos. Students log in and open them. That's it.

- `/login`, `/register`, `/forgot-password`: Firebase email/password login. Everyone who signs up is a **student**.
- `/teacher`: upload a file and see or delete your own uploads (teachers only).
- `/learn`: all files; `/learn/<id>` opens a PDF or plays a video.

## One-time setup

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

## Making someone a teacher

1. They sign up normally at `/register`.
2. In **Firestore → profiles → (their document)**, change `role` from `student` to `teacher`.

Their page switches to the teacher view right away. Users can never change their own role.

## Checks

```bash
npm test && npm run lint && npm run build
```
