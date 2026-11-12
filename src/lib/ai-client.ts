import { auth } from "@/lib/firebase/config";
import { appCheckHeaders } from './firebase/app-check';

/** Calls one of our API routes as the signed-in user. Throws an Error with a friendly message on failure. */
export async function postAi<T>(path: "/api/ai/ask" | "/api/ai/study-pack" | "/api/ai/plan" | "/api/files/delete" | "/api/study" | "/api/materials" | "/api/admins" | "/api/routines" | "/api/content", body: unknown): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please log in again.");
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...await appCheckHeaders() },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No internet connection. Check your network and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
