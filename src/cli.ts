import { parseArgs } from "node:util";
import { runFullBenchmark } from "./scorecard/metrics";
import { renderBenchmarkReport } from "./scorecard/report";
import { auditDocumentationLinks } from "./runner/links";
import { evaluatePureHumanDoc, buildDoubleBlindJudgePrompt } from "./judges/human_dx_judge";
import { ALL_ADAPTERS } from "./competitors/adapters";
import type { CompetitorId } from "./types";

const USAGE = `
Docs-Benchmark CLI (v0.1) — Comparative Documentation Benchmark Suite

Usage:
  docs-benchmark run [options]
  docs-benchmark compare [--json]
  docs-benchmark judge-human [--prompt-only]
  docs-benchmark audit <doc-dir>

Options:
  --json          Output results in raw JSON format
  --prompt-only   Output the double-blind prompt for external LLM judge (DeepSeek/Codex)
  --fixture <dir> Specify target codebase fixture (default: testdata/microservice)
  --help          Show this message
`;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    console.log(USAGE);
    process.exit(0);
  }

  if (command === "judge-human") {
    const isPromptOnly = args.includes("--prompt-only");
    const competitors: CompetitorId[] = ["understand-anything", "graphify", "gira", "static-baseline"];
    
    if (isPromptOnly) {
      const docs = competitors.map((id) => {
        const adapter = ALL_ADAPTERS[id];
        const docRes = adapter.getContextForTask("task-01-order-entrypoint", process.cwd());
        return { id, content: docRes.contextText };
      });
      console.log(buildDoubleBlindJudgePrompt(docs));
      process.exit(0);
    }

    console.log(`# 🧑 Pure Human DX Judge — Avaliação Exclusiva de Leitura e Didática\n`);
    console.log(`*Este juiz ignora completamente velocidade de CLI, tokens e ASTs. Avalia 100% a experiência de um engenheiro humano tentando entender o sistema.*\n`);
    console.log(`| Rank | Ferramenta | Modelo Mental (35) | Empatia vs Jargão (25) | Diagramas (20) | Onboarding (20) | Total Human DX | Veredito |`);
    console.log(`| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :--- |`);

    const results = competitors.map((id) => {
      const adapter = ALL_ADAPTERS[id];
      const doc = adapter.getContextForTask("task-01-order-entrypoint", process.cwd());
      return evaluatePureHumanDoc(id, doc.contextText);
    });

    results.sort((a, b) => b.totalScore - a.totalScore);

    results.forEach((r, idx) => {
      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "4️⃣";
      const adapter = ALL_ADAPTERS[r.competitorId];
      console.log(`| ${medal} **#${idx + 1}** | **${adapter.meta.name}** | \`${r.scores.mentalModelAndIntuition}/35\` | \`${r.scores.didacticEmpathyVsJargon}/25\` | \`${r.scores.visualDiagramClarity}/20\` | \`${r.scores.onboardingErgonomics}/20\` | **\`${r.totalScore} / 100\`** | ${r.critique} |`);
    });

    console.log(`\n💡 **Conclusão do Juiz Humano:**`);
    console.log(`- **${ALL_ADAPTERS[results[0].competitorId].meta.name}** vence com folga em didática humana. Suas analogias conceituais e linguagem amigável reduzem a carga cognitiva do desenvolvedor.`);
    console.log(`- O **Gira-G**, apesar de ser imbativel para máquinas/agentes (Agent DX), ainda soa denso e intimidador para humanos.`);
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
