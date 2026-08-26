#!/usr/bin/env node
/**
 * Stop-hook safety net: if a project-kit project has uncommitted changes
 * outside .project-kit/ and no changelog entry was written today, block
 * stopping once (git-guarded, throttled) so the agent surfaces the "log-change"
 * action instead of silently ending the turn. Never writes a changelog entry
 * itself — the hybrid draft/confirm flow stays in actions/log-change.md.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const NAG_THROTTLE_MS = 15 * 60 * 1000;

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function findProjectKitRoot(startDir) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 40; i++) {
    if (fs.existsSync(path.join(dir, ".project-kit"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function main() {
  let payload = {};
  try {
    payload = JSON.parse(readStdin() || "{}");
  } catch {
    payload = {};
  }

  // Guard against re-blocking the continuation this hook itself triggers.
  if (payload.stop_hook_active) process.exit(0);

  const root = findProjectKitRoot(payload.cwd || process.cwd());
  if (!root) process.exit(0);

  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd: root, stdio: "ignore" });
  } catch {
    process.exit(0); // not a git repo — nothing to diff against
  }

  let statusOut;
  try {
    statusOut = execSync("git status --porcelain", { cwd: root, encoding: "utf8" });
  } catch {
    process.exit(0);
  }

  const changedOutsideProjectKit = statusOut
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .some((line) => !line.slice(3).trim().startsWith(".project-kit/"));

  if (!changedOutsideProjectKit) process.exit(0);

  const changelogDir = path.join(root, ".project-kit", "changelog");
  const today = new Date().toISOString().slice(0, 10);
  let loggedToday = false;
  try {
    loggedToday = fs.readdirSync(changelogDir).some((f) => f.startsWith(today));
  } catch {
    loggedToday = false;
  }
  if (loggedToday) process.exit(0);

  const nagStatePath = path.join(root, ".project-kit", ".nag-state.local.json");
  const now = Date.now();
  let lastNagAt = 0;
  try {
    lastNagAt = JSON.parse(fs.readFileSync(nagStatePath, "utf8")).lastNagAt || 0;
  } catch {
    lastNagAt = 0;
  }
  if (now - lastNagAt < NAG_THROTTLE_MS) process.exit(0);

  try {
    fs.writeFileSync(nagStatePath, JSON.stringify({ lastNagAt: now }));
  } catch {
    // best-effort only — a failed write here shouldn't stop the reminder below
  }

  process.stderr.write(
    "project-kit: this project has uncommitted changes and no changelog entry " +
      "under .project-kit/changelog/ for today. If what just happened is worth " +
      "remembering, run project-kit's log-change action before finishing up."
  );
  process.exit(2);
}

main();
