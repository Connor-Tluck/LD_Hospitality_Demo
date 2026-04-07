import type { Org, User } from "@hospitality/shared";

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return `h${h.toString(16)}`;
}

const demoOrg: Org = {
  id: "org-demo-1",
  name: "Demo Hospitality Group",
  plan: "enterprise",
};

export const orgs = new Map<string, Org>([[demoOrg.id, demoOrg]]);

export const usersByEmail = new Map<string, User>();

export const sessions = new Map<string, string>();

export function createUser(
  email: string,
  password: string,
  name: string,
  orgId: string,
  role: string
): User {
  const id = `user-${crypto.randomUUID()}`;
  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    passwordHash: simpleHash(password),
    orgId,
    role,
  };
  usersByEmail.set(user.email, user);
  return user;
}

export function verifyPassword(user: User, password: string): boolean {
  return user.passwordHash === simpleHash(password);
}

export function issueToken(userId: string): string {
  const token = `sess-${crypto.randomUUID()}`;
  sessions.set(token, userId);
  return token;
}

export function getUserIdForToken(token: string | undefined): string | null {
  if (!token) return null;
  return sessions.get(token) ?? null;
}

/** Pre-seeded account for local dev (in-memory; gone after server restart). */
createUser("demo@hospitality.local", "demo12345", "Demo Guest", demoOrg.id, "member");
