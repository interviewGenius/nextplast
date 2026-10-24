import { signOut } from "next-auth/react";

/**
 * Clears the session, then hard-navigates on the current origin.
 * Auth.js resolves its own redirect against AUTH_URL/NEXTAUTH_URL, which can
 * point at another deployment, so we navigate ourselves with a relative path.
 * The full reload also drops cached queries from the previous user.
 */
export async function logout(redirectTo = "/login"): Promise<void> {
  try {
    await signOut({ redirect: false });
  } finally {
    window.location.replace(redirectTo);
  }
}
