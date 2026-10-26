import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { QuickstartSnippet } from "../types";

export interface SandboxExecutionResult {
  snippetId: string;
  totalCommands: number;
  passedCommands: number;
  failedCommands: number;
  durationMs: number;
  outputLog: string;
  exitCode: number;
}

/**
 * Runs quickstart commands in a clean, isolated scratch environment.
 */
export function executeQuickstartSandbox(
  snippet: QuickstartSnippet,
  workdir?: string,
): SandboxExecutionResult {
  const isIsolated = !workdir;
  const targetDir = workdir || mkdtempSync(join(tmpdir(), "docs-bench-sandbox-"));

  const start = performance.now();
  let passed = 0;
  let failed = 0;
  let log = "";
  let lastExit = 0;

  try {
    for (const cmd of snippet.commands) {
      const trimmed = cmd.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const cmdStart = performance.now();
      try {
        const out = execSync(trimmed, {
          cwd: targetDir,
          env: {
            ...process.env,
            ...snippet.env,
          },
          stdio: "pipe",
          timeout: 15000,
        });
        passed++;
        log += `[OK ${Math.round(performance.now() - cmdStart)}ms] $ ${trimmed}\n${out.toString()}\n`;
      } catch (err: any) {
        failed++;
        lastExit = err.status ?? 1;
        const errStderr = err.stderr ? err.stderr.toString() : err.message;
        log += `[FAIL] $ ${trimmed} (exit ${lastExit})\n${errStderr}\n`;
        break; // Stop on first fatal failure
      }
    }
  } finally {
    if (isIsolated) {
      try {
        rmSync(targetDir, { recursive: true, force: true });
      } catch {}
    }
  }

  const durationMs = Math.round(performance.now() - start);

  return {
    snippetId: snippet.id,
    totalCommands: snippet.commands.filter((c) => c.trim() && !c.trim().startsWith("#")).length,
    passedCommands: passed,
    failedCommands: failed,
    durationMs,
    outputLog: log,
    exitCode: lastExit,
  };
}
