import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(serverRoot, "..");

/**
 * Load order (each step can override the previous): lets you keep `LAUNCHDARKLY_SDK_KEY` / `OPENAI_API_KEY` in
 * `mobile/.env.local` for local dev, while `server/.env.local` still wins when you need server-only overrides.
 */
config({ path: resolve(serverRoot, ".env"), override: true });
config({ path: resolve(repoRoot, "mobile/.env"), override: true });
config({ path: resolve(repoRoot, "mobile/.env.local"), override: true });
config({ path: resolve(serverRoot, ".env.local"), override: true });
