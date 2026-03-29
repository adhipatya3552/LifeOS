const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const projectRoot = process.cwd();
const generatedApiPath = path.join(projectRoot, "convex", "_generated", "api.js");
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convexDeployment = process.env.CONVEX_DEPLOYMENT || "";
const hasRealConvexConfig =
  Boolean(convexDeployment || convexUrl) && !convexUrl.includes("your-project");

if (!hasRealConvexConfig) {
  if (existsSync(generatedApiPath)) {
    console.log("Skipping Convex codegen: using checked-in generated bindings.");
    process.exit(0);
  }

  console.warn(
    "Skipping Convex codegen: set NEXT_PUBLIC_CONVEX_URL or CONVEX_DEPLOYMENT to generate fresh bindings."
  );
  process.exit(0);
}

const isWindows = process.platform === "win32";
const command = isWindows ? "npx.cmd" : "npx";
const result = spawnSync(command, ["convex", "codegen"], {
  cwd: projectRoot,
  stdio: "inherit",
  shell: false,
  env: process.env,
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
