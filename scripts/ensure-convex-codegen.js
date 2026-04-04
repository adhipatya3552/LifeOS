#!/usr/bin/env node
/**
 * scripts/ensure-convex-codegen.js
 *
 * Checks that the Convex generated files exist before running a build or
 * typecheck. If they are missing it exits with a helpful error message
 * instead of letting TypeScript crash with a confusing "Cannot find module"
 * error.
 *
 * This script is intentionally kept as plain CommonJS so it runs without any
 * transpilation step and without requiring a specific Node.js version flag.
 */

const fs = require("fs");
const path = require("path");

const GENERATED_API = path.join(
  __dirname,
  "..",
  "convex",
  "_generated",
  "api.js"
);

if (!fs.existsSync(GENERATED_API)) {
  console.error(
    "\n[LifeOS] Convex generated files are missing.\n" +
      "Run `npx convex dev` or `npx convex codegen` first, then retry.\n"
  );
  process.exit(1);
}

// Generated files exist — nothing to do.
