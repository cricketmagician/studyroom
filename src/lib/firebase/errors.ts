const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is wrong.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account with this email.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many tries. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Check your network and try again.",
  "permission-denied": "You don't have permission to do this.",
  "storage/unauthorized": "You don't have permission to upload this file.",
  "storage/quota-exceeded": "Storage is full. Contact the admin.",
  "storage/retry-limit-exceeded": "Upload stopped because the connection dropped. Please try again.",
};

export function friendlyError(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  return MESSAGES[code] ?? "Something went wrong. Please try again.";
}
