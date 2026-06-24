import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = join(__dirname, "..");
const src = join(mobileRoot, "web-demo", "demo.html");
const dest = join(mobileRoot, "web-build", "demo.html");

if (!existsSync(join(mobileRoot, "web-build", "index.html"))) {
  console.error("web-build/index.html not found. Run `expo export -p web --output-dir web-build` first.");
  process.exit(1);
}

copyFileSync(src, dest);
console.log("demo.html → web-build/demo.html (open via a static server, e.g. npm run preview:web-demo)");
