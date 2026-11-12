const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Email or password is wrong.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account with this email.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many tries. Please wait a few minutes and try again.",
  "auth/network-request-failed": "No internet connection. Check your network and try again.",
  "auth/popup-closed-by-user": "Google sign-in was closed. Try again when you're ready.",
  "auth/popup-blocked": "Allow pop-ups for this app, then try Google sign-in again.",
  "auth/cancelled-popup-request": "Finish the Google sign-in window already open.",
  "auth/operation-not-allowed": "Google sign-in is not enabled yet. Ask the admin to enable Google in Firebase Authentication.",
  "auth/unauthorized-domain": "This app address is not authorized for Google sign-in yet.",
  "auth/account-exists-with-different-credential": "This email uses another sign-in method. Log in with that method first.",
  "permission-denied": "You don't have permission to do this.",
};

export function friendlyError(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  return MESSAGES[code] ?? "Something went wrong. Please try again.";
}
