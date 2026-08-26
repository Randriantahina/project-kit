#!/usr/bin/env node
/**
 * SessionStart hook: if a project-kit project's .state.json shows the repo
 * has moved (commits ahead) or a tracked manifest changed since the last
 * init/refresh, print one line so it lands in context automatically —
 * exit 0 stdout on SessionStart is added to the conversation. Silent when
 * nothing is stale, so a healthy project pays zero extra tokens for this.
 *
 * This exists because relying on SKILL.md's prose ("check staleness before
 * trusting memory") only works when the skill actually gets invoked, which
 * real testing showed doesn't happen for a plain coding task. A hook runs
 * unconditionally at session start, independent of skill invocation.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

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

function sha256(filePath) {
  try {
    return "sha256:" + crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  } catch {
    return null;
  }
}

function main() {
  let payload = {};
  try {
    payload = JSON.parse(readStdin() || "{}");
  } catch {
    payload = {};
  }

  const root = findProjectKitRoot(payload.cwd || process.cwd());
  if (!root) process.exit(0);

  const statePath = path.join(root, ".project-kit", ".state.json");
  let state;
  try {
    state = JSON.parse(fs.readFileSync(statePath, "utf8"));
  } catch {
    process.exit(0); // no baseline yet (predates this feature, or init never finished) — stay silent, not alarmist
  }

  const notes = [];

  if (state.gitCommit) {
    let head = null;
    try {
      head = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
    } catch {
      head = null;
    }
    if (head && head !== state.gitCommit) {
      let countNote = "history diverged";
      try {
        const count = execSync(`git rev-list --count ${state.gitCommit}..${head}`, {
          cwd: root,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
        if (count && /^\d+$/.test(count)) countNote = `${count} commit(s) ahead`;
      } catch {
        // stored commit may no longer exist (rewritten history) — keep the generic note
      }
      notes.push(countNote);
    }
  }

  const manifestHashes = state.manifestHashes || {};
  const changedManifests = Object.keys(manifestHashes).filter(
    (relPath) => sha256(path.join(root, relPath)) !== manifestHashes[relPath]
  );
  if (changedManifests.length > 0) {
    notes.push(`dependencies changed (${changedManifests.join(", ")})`);
  }

  if (notes.length === 0) process.exit(0);

  process.stdout.write(
    `project-kit: memory in .project-kit/ may be stale — ${notes.join("; ")} since the last sync` +
      (state.syncedAt ? ` (${state.syncedAt})` : "") +
      ". Consider running project-kit's refresh action if this is relevant to the current task.\n"
  );
  process.exit(0);
}

main();
