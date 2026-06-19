export const AUTH_COOKIE_NAME = "stash-auth";

export function getAppPin(): string | undefined {
  return process.env.APP_PIN;
}

export function verifyPin(pin: string): boolean {
  const expected = getAppPin();
  if (!expected) return false;
  return pin === expected;
}

export function isAuthenticated(cookieValue: string | undefined): boolean {
  return cookieValue === "1";
}

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
