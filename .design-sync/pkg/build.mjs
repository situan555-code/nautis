// design-sync wrapper build (cfg.buildCmd). Run from the repo root:
//   node .design-sync/pkg/build.mjs
// Concatenates the site's stylesheets, in the order its layers expect, into
// sunder.css (cfg.cssEntry): design-system.css (global, every page), then
// home.css and pages.css (page-level section classes).
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repo = process.cwd();
const out = join(resolve(repo, ".design-sync/pkg"), "sunder.css");
const parts = ["design-system.css", "home.css", "pages.css"].map((f) =>
  `/* ---- src/css/${f} ---- */\n` + readFileSync(join(repo, "src/css", f), "utf8"));
writeFileSync(out, parts.join("\n\n"));
console.error(`css: sunder.css ${(parts.join("").length / 1024).toFixed(0)} KB`);
