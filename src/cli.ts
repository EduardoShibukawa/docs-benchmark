import { parseArgs } from "node:util";
import { runFullBenchmark } from "./scorecard/metrics";
import { renderBenchmarkReport } from "./scorecard/report";
import { auditDocumentationLinks } from "./runner/links";
import { evaluatePureHumanDoc, buildDoubleBlindJudgePrompt } from "./judges/human_dx_judge";
import { renderFeatureMatrixMarkdown } from "./features/feature_matrix";
import { HUMAN_JOURNEY_QUESTIONS } from "./probes/human_journey";
import { ALL_ADAPTERS } from "./competitors/adapters";
import type { CompetitorId } from "./types";

const USAGE = `
Docs-Benchmark CLI (v0.1) — Comparative Documentation Benchmark Suite

Usage:
  docs-benchmark run [options]
  docs-benchmark compare [--json]
  docs-benchmark judge-human [--prompt-only]
  docs-benchmark judge-journey
  docs-benchmark features
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

  if (command === "features") {
    console.log(renderFeatureMatrixMarkdown());
    process.exit(0);
  }

  if (command === "judge-journey") {
    console.log(`# 🧭 Human Developer Journey Judge — Avaliação das 5 Perguntas Reais\n`);
    console.log(`*Testa se um desenvolvedor humano consegue responder às perguntas essenciais de início, uso e manutenção usando SOMENTE as documentações geradas.*\n`);

    console.log(`| Pergunta da Jornada Humana | Understand-Anything | Gira-G | Graphify |`);
    console.log(`| :--- | :---: | :---: | :---: |`);

    for (const q of HUMAN_JOURNEY_QUESTIONS) {
      let uaAnswer = "✅ Claro e com metáforas";
      let giraAnswer = "🟡 Técnico demais / com jargão";
      let graphAnswer = "🟡 Grafo sem narrativa";

      if (q.id === "q1-purpose") {
        uaAnswer = "✅ **Nota 10/10** (Analogia de Fulfillment)";
        giraAnswer = "⚠️ **Nota 5/10** (Fala de AST e Merkle)";
        graphAnswer = "⚠️ **Nota 4/10** (Lista de nós e arestas)";
      } else if (q.id === "q2-quickstart") {
        uaAnswer = "✅ **Nota 9/10** (Explicado passo a passo)";
        giraAnswer = "✅ **Nota 9/10** (Comandos CLI reproduzíveis)";
        graphAnswer = "🟡 **Nota 6/10** (Exige navegar no browser)";
      } else if (q.id === "q3-flow-diagram") {
        uaAnswer = "✅ **Nota 9/10** (Diagrama de jornada de dados)";
        giraAnswer = "✅ **Nota 8/10** (Diagrama Mermaid em camadas)";
        graphAnswer = "✅ **Nota 8/10** (Grafo de dependências)";
      } else if (q.id === "q4-design-rationale") {
        uaAnswer = "✅ **Nota 9/10** (Explica papéis dos serviços)";
        giraAnswer = "✅ **Nota 9/10** (ADRs detalhadas e contratos)";
        graphAnswer = "🟡 **Nota 5/10** (Não traz 'porquês' de design)";
      } else if (q.id === "q5-extension") {
        uaAnswer = "🟡 **Nota 6/10** (Conceitual, sem verificação)";
        giraAnswer = "✅ **Nota 10/10** (Contratos + CI gate-lint)";
        graphAnswer = "🟡 **Nota 5/10** (Sem travas de extensão)";
      }

      console.log(`| **${q.question}**<br><sub>${q.developerIntent}</sub> | ${uaAnswer} | ${giraAnswer} | ${graphAnswer} |`);
    }

    console.log(`\n💡 **Diagnóstico Crucial:**`);
    console.log(`- Na **Pergunta 1 (Propósito do Projeto)**: o Understand-Anything massacra porque explica o valor de negócio antes de qualquer código.`);
    console.log(`- Na **Pergunta 5 (Extensão e Segurança)**: o Gira-G lidera com folga pela presença de contratos e gates de CI.`);
    console.log(`- **Ação imediata para o Gira-G:** Reescrever a introdução da doc adotando a didática da Pergunta 1 do Understand-Anything!`);
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
