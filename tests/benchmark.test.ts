import { describe, expect, it } from "bun:test";
import { runFullBenchmark, runCompetitorBenchmark } from "../src/scorecard/metrics";
import { renderBenchmarkReport } from "../src/scorecard/report";
import { executeQuickstartSandbox } from "../src/runner/sandbox";
import { auditDocumentationLinks } from "../src/runner/links";
import { BENCHMARK_TASKS } from "../src/probes/tasks";
import { estimateTokens } from "../src/tokenizer";
import { anonymizeContent } from "../src/anonymizer";
import { FEATURE_MATRIX } from "../src/features/feature_matrix";
import { HUMAN_JOURNEY_QUESTIONS } from "../src/probes/human_journey";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("Docs-Benchmark Suite (v0.1)", () => {
  it("1. executeQuickstartSandbox executes commands in isolated environment", () => {
    const res = executeQuickstartSandbox({
      id: "test-snippet",
      commands: [
        "echo 'hello world'",
        "true",
      ],
    });
    expect(res.totalCommands).toBe(2);
    expect(res.passedCommands).toBe(2);
    expect(res.failedCommands).toBe(0);
    expect(res.exitCode).toBe(0);
  });

  it("2. auditDocumentationLinks detects valid and broken relative links and anchors", () => {
    const dir = mkdtempSync(join(tmpdir(), "docs-bench-audit-"));
    try {
      writeFileSync(join(dir, "index.html"), `
        <html><body>
          <a href="about.html">About</a>
          <a href="about.html#team">Team</a>
          <a href="broken.html">Broken</a>
        </body></html>
      `);
      writeFileSync(join(dir, "about.html"), `
        <html><body>
          <h1 id="team">Team</h1>
        </body></html>
      `);

      const audit = auditDocumentationLinks(dir);
      expect(audit.totalLinks).toBe(3);
      expect(audit.validLinks).toBe(2);
      expect(audit.brokenLinks.length).toBe(1);
      expect(audit.brokenLinks[0].target).toBe("broken.html");
      expect(audit.brokenLocatorRate).toBe(33.3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("3. runCompetitorBenchmark evaluates all 3 dimensions (Human DX, Agent DX, Engine Ops)", () => {
    const giraRes = runCompetitorBenchmark("gira");
    expect(giraRes.competitor.name).toBe("Gira-G");
    expect(giraRes.humanDX.score).toBeGreaterThanOrEqual(85);
    expect(giraRes.agentDX.score).toBeGreaterThanOrEqual(85);
    expect(giraRes.engineOps.score).toBeGreaterThanOrEqual(90);
    expect(giraRes.globalScore).toBeGreaterThanOrEqual(85);

    const uaRes = runCompetitorBenchmark("understand-anything");
    expect(uaRes.humanDX.score).toBeGreaterThanOrEqual(80);
    expect(uaRes.engineOps.buildTimeMs).toBeGreaterThan(10000);
  });

  it("4. runFullBenchmark ranks competitors and renders report", () => {
    const results = runFullBenchmark();
    expect(results.length).toBe(4);

    const report = renderBenchmarkReport(results);
    expect(report).toContain("Docs-Benchmark (v0.1)");
    expect(report).toContain("Gira-G");
    expect(report).toContain("Understand-Anything");
    expect(report).toContain("Graphify");
    expect(report).toContain("Static Markdown");
    expect(report).toContain("Scorecard Geral de Classificação");
  });

  it("5. BENCHMARK_TASKS covers realistic architecture comprehension scenarios", () => {
    expect(BENCHMARK_TASKS.length).toBeGreaterThanOrEqual(5);
    for (const t of BENCHMARK_TASKS) {
      expect(t.groundTruth.targetFile).toBeDefined();
      expect(t.groundTruth.targetSymbol).toBeDefined();
    }
  });

  it("6. estimateTokens calculates accurate token counts on code and text", () => {
    const text = "func CreateOrder(w http.ResponseWriter, r *http.Request) { fmt.Fprintf(w, 'ok') }";
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(10);
    expect(tokens).toBeLessThan(40);
  });

  it("7. anonymizeContent eliminates brand names and proprietary URLs for double-blind audit", () => {
    const rawGira = "Gira-G provides gira init and links to https://github.com/EduardoShibukawa/gira-g";
    const anonGira = anonymizeContent(rawGira, "gira");
    expect(anonGira).not.toContain("Gira-G");
    expect(anonGira).not.toContain("EduardoShibukawa");
    expect(anonGira).toContain("System Alpha");

    const rawUA = "Understand-Anything by Egonex-AI creates conceptual maps";
    const anonUA = anonymizeContent(rawUA, "understand-anything");
    expect(anonUA).not.toContain("Understand-Anything");
    expect(anonUA).not.toContain("Egonex-AI");
    expect(anonUA).toContain("System Beta");
  });

  it("8. FEATURE_MATRIX contains 8 features including feat-local-first-airgapped", () => {
    expect(FEATURE_MATRIX.length).toBe(8);
    const airgapped = FEATURE_MATRIX.find((f) => f.id === "feat-local-first-airgapped");
    expect(airgapped).toBeDefined();
    expect(airgapped?.competitors.gira.supported).toBe("full");
    expect(airgapped?.competitors["understand-anything"].supported).toBe("none");
  });

  it("9. HUMAN_JOURNEY_QUESTIONS covers the 5 developer journey questions", () => {
    expect(HUMAN_JOURNEY_QUESTIONS.length).toBe(5);
    const q1 = HUMAN_JOURNEY_QUESTIONS.find((q) => q.id === "q1-purpose");
    expect(q1).toBeDefined();
    expect(q1?.question).toContain("objetivo principal");
  });
});
