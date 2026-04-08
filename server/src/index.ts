import "./loadEnv.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AuthResponse, LoginBody, MeResponse, RegisterBody } from "@hospitality/shared";
import {
  getChatSupportWelcome,
  runChatSupportTurn,
  type ChatSupportBody,
  type ChatSupportWelcomeBody,
} from "./chatSupport.js";
import {
  createUser,
  getUserIdForToken,
  issueToken,
  orgs,
  usersByEmail,
  verifyPassword,
} from "./store.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.get("/health", (c) => c.json({ ok: true }));

function authHeader(c: { req: { header: (n: string) => string | undefined } }): string | undefined {
  const raw = c.req.header("Authorization");
  if (!raw?.startsWith("Bearer ")) return undefined;
  return raw.slice("Bearer ".length);
}

app.post("/auth/register", async (c) => {
  const body = (await c.req.json()) as RegisterBody;
  if (!body?.email || !body?.password || !body?.name) {
    return c.json({ error: "email, password, and name are required" }, 400);
  }
  if (usersByEmail.has(body.email.toLowerCase())) {
    return c.json({ error: "Email already registered" }, 409);
  }
  const org = [...orgs.values()][0];
  if (!org) return c.json({ error: "No organization configured" }, 500);

  const user = createUser(body.email, body.password, body.name, org.id, "member");
  const token = issueToken(user.id);

  const payload: AuthResponse = {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    },
    org,
  };
  return c.json(payload);
});

app.post("/auth/login", async (c) => {
  const body = (await c.req.json()) as LoginBody;
  if (!body?.email || !body?.password) {
    return c.json({ error: "email and password are required" }, 400);
  }
  const user = usersByEmail.get(body.email.toLowerCase());
  if (!user || !verifyPassword(user, body.password)) {
    return c.json({ error: "Invalid email or password" }, 401);
  }
  const org = orgs.get(user.orgId);
  if (!org) return c.json({ error: "Organization missing" }, 500);

  const token = issueToken(user.id);
  const payload: AuthResponse = {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    },
    org,
  };
  return c.json(payload);
});

app.get("/me", (c) => {
  const userId = getUserIdForToken(authHeader(c));
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const user = [...usersByEmail.values()].find((u) => u.id === userId);
  if (!user) return c.json({ error: "User not found" }, 404);

  const org = orgs.get(user.orgId);
  if (!org) return c.json({ error: "Organization missing" }, 500);

  const payload: MeResponse = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      orgId: user.orgId,
    },
    org,
  };
  return c.json(payload);
});

app.post("/ai/chat-support", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const result = await runChatSupportTurn(authHeader(c), body as ChatSupportBody);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.json(result);
});

app.post("/ai/chat-support/welcome", async (c) => {
  let body: ChatSupportWelcomeBody = {};
  try {
    const raw = await c.req.json();
    if (raw && typeof raw === "object") body = raw as ChatSupportWelcomeBody;
  } catch {
    body = {};
  }
  const result = await getChatSupportWelcome(authHeader(c), body);
  if ("error" in result) {
    return new Response(JSON.stringify({ error: result.error }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return c.json(result);
});

const port = Number(process.env.PORT) || 8787;

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (info) => {
  console.log(`Hospitality mock API listening on http://0.0.0.0:${info.port}`);
});
