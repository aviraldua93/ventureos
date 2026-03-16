#!/usr/bin/env node
// Workaround: Bun's package manager may not extract .d.ts files from
// the bun-types package on some platforms (e.g. Windows + OneDrive).
// This script copies missing .d.ts files from the Bun global cache.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const bunDir = path.join(root, "node_modules", ".bun");

if (!fs.existsSync(bunDir)) process.exit(0);

// Find the bun-types version directory inside node_modules/.bun
const bunTypesEntry = fs
  .readdirSync(bunDir)
  .find((d) => d.startsWith("bun-types@"));
if (!bunTypesEntry) process.exit(0);

const targetDir = path.join(bunDir, bunTypesEntry, "node_modules", "bun-types");
const indexDts = path.join(targetDir, "index.d.ts");

if (fs.existsSync(indexDts)) {
  // Types already present — nothing to do
  process.exit(0);
}

console.log("[fix-bun-types] .d.ts files missing from bun-types, copying from Bun cache...");

try {
  const cachePath = execSync("bun pm cache", { encoding: "utf8" }).trim();
  const cacheEntries = fs
    .readdirSync(cachePath)
    .filter((d) => d.startsWith("bun-types@"))
    .sort();

  if (cacheEntries.length === 0) {
    console.warn("[fix-bun-types] No bun-types found in Bun cache, skipping.");
    process.exit(0);
  }

  const cacheDir = path.join(cachePath, cacheEntries[cacheEntries.length - 1]);

  let copied = 0;
  for (const file of fs.readdirSync(cacheDir)) {
    if (file.endsWith(".d.ts")) {
      fs.copyFileSync(path.join(cacheDir, file), path.join(targetDir, file));
      copied++;
    }
  }

  console.log(`[fix-bun-types] Copied ${copied} .d.ts files.`);
} catch (err) {
  console.warn("[fix-bun-types] Could not copy types from cache:", err.message);
  process.exit(0); // Non-fatal — don't break install
}
