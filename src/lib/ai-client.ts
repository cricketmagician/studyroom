import { auth } from "@/lib/firebase/config";

/** Calls one of our API routes as the signed-in user. Throws an Error with a friendly message on failure. */
export async function postAi<T>(path: "/api/ai/ask" | "/api/ai/study-pack" | "/api/files/delete", body: unknown): Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Please log in again.");
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("No internet connection. Check your network and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
  return data as T;
}
