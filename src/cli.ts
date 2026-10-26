import { parseArgs } from "node:util";
import { runFullBenchmark } from "./scorecard/metrics";
import { renderBenchmarkReport } from "./scorecard/report";
import { auditDocumentationLinks } from "./runner/links";

const USAGE = `
Docs-Benchmark CLI (v0.1) — Comparative Documentation Benchmark Suite

Usage:
  docs-benchmark run [options]
  docs-benchmark compare [--json]
  docs-benchmark audit <doc-dir>

Options:
  --json          Output results in raw JSON format
  --fixture <dir> Specify target codebase fixture (default: testdata/microservice)
  --dry-run       Run benchmark simulations without calling external network APIs
  --help          Show this message
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  if (command === "compare" || command === "run") {
    const isJson = args.includes("--json");
    const results = runFullBenchmark();

    if (isJson) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log(renderBenchmarkReport(results));
    }
    process.exit(0);
  }

  if (command === "audit") {
    const docDir = args[1];
    if (!docDir) {
      console.error("Error: doc-dir path required. Example: docs-benchmark audit ../gira-g/build");
      process.exit(2);
    }
    const auditRes = auditDocumentationLinks(docDir);
    console.log(`Audited ${auditRes.totalLinks} links in ${docDir}:`);
    console.log(` - Valid: ${auditRes.validLinks}`);
    console.log(` - Broken: ${auditRes.brokenLinks.length}`);
    console.log(` - Broken Locator Rate: ${auditRes.brokenLocatorRate}%`);
    if (auditRes.brokenLinks.length > 0) {
      console.log("\nBroken Links Found:");
      for (const b of auditRes.brokenLinks.slice(0, 10)) {
        console.log(`   [${b.source}] -> ${b.target} (${b.reason})`);
      }
    }
    process.exit(auditRes.brokenLinks.length > 0 ? 1 : 0);
  }

  console.error(`Unknown command: ${command}\n${USAGE}`);
  process.exit(2);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
