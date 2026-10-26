import type { CompetitorBenchmarkResult, CompetitorId } from "../types";
import { COMPETITORS, evaluateEngineOps, evaluateHumanDX } from "../competitors/adapters";
import { evaluateAgentProbe } from "../probes/agent_eval";
import { BENCHMARK_TASKS } from "../probes/tasks";

/**
 * Computes the full benchmark result for a given competitor across all 3 dimensions.
 */
export function runCompetitorBenchmark(id: CompetitorId): CompetitorBenchmarkResult {
  const meta = COMPETITORS[id];
  const humanDX = evaluateHumanDX(id);
  const agentDX = evaluateAgentProbe(id, BENCHMARK_TASKS);
  const engineOps = evaluateEngineOps(id);

  // Global score: 40% Human DX, 40% Agent DX, 20% Engine Ops
  const globalScore = Math.round(
    humanDX.score * 0.40 +
    agentDX.score * 0.40 +
    engineOps.score * 0.20
  );

  let summary = "";
  if (globalScore >= 90) {
    summary = "Líder de Categoria: Equilíbrio exemplar entre ergonomia humana, precisão para IA e zero-token overhead.";
  } else if (globalScore >= 80) {
    summary = "Excelente Desempenho: Forte em clareza ou ontologia de grafos, com trade-offs em custo ou gates determinísticos.";
  } else if (globalScore >= 70) {
    summary = "Bom: Útil para exploração pontual, mas vulnerável a drift arquitetural em CI ou alto consumo de contexto.";
  } else {
    summary = "Legado / Baseline: Alta fricção de manutenção, suscetível a link-rot e alucinações por IA.";
  }

  return {
    competitor: meta,
    humanDX,
    agentDX,
    engineOps,
    globalScore,
    summary,
  };
}

/**
 * Runs the benchmark across all registered competitors.
 */
export function runFullBenchmark(): CompetitorBenchmarkResult[] {
  const ids: CompetitorId[] = ["gira", "understand-anything", "graphify", "static-baseline"];
  return ids.map((id) => runCompetitorBenchmark(id));
}
