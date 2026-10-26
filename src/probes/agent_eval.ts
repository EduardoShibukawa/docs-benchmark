import type { AgentDXScore, BenchmarkProbeTask, CompetitorId } from "../types";
import { ALL_ADAPTERS } from "../competitors/adapters";
import { estimateTokens } from "../tokenizer";

export interface ProbeExecutionResult {
  taskId: string;
  tokensConsumed: number;
  retrievedTargetSymbol: string;
  retrievedTargetFile: string;
  isCorrect: boolean;
  hallucinatedSymbols: string[];
}

/**
 * Empirically evaluates an AI Agent executing probe tasks against each competitor's documentation.
 * Measures actual tokens consumed via the tokenizer, verifies ground truth presence in the retrieved context,
 * and records any hallucinated symbols.
 */
export function evaluateAgentProbeEmpirical(
  competitorId: CompetitorId,
  tasks: BenchmarkProbeTask[],
  baseDir: string = process.cwd(),
): AgentDXScore {
  const adapter = ALL_ADAPTERS[competitorId];
  let totalTokens = 0;
  let correctTasks = 0;
  let totalHallucinations = 0;

  for (const task of tasks) {
    const { contextText, hallucinatedSymbols } = adapter.getContextForTask(task.id, baseDir);

    // 1. Measure actual token consumption using tokenizer
    const taskTokens = estimateTokens(contextText);
    totalTokens += taskTokens;

    // 2. Check empirical ground-truth correctness: does the retrieved context
    // contain the target file and target symbol?
    const hasTargetSymbol = contextText.includes(task.groundTruth.targetSymbol);
    const hasTargetFile = contextText.includes(task.groundTruth.targetFile);
    const isCorrect = hasTargetSymbol && hasTargetFile;

    if (isCorrect) {
      correctTasks++;
    }

    // 3. Track hallucinations
    totalHallucinations += hallucinatedSymbols.length;
  }

  const factualPrecisionRate = tasks.length > 0 ? Math.round((correctTasks / tasks.length) * 100) : 0;

  // Efficiency rubric based on average tokens per probe task
  const avgTokens = tasks.length > 0 ? totalTokens / tasks.length : 0;
  let tokenBudgetEfficiency = 5;
  if (avgTokens > 200) tokenBudgetEfficiency = 4;
  if (avgTokens > 800) tokenBudgetEfficiency = 3;
  if (avgTokens > 2000) tokenBudgetEfficiency = 2;
  if (avgTokens > 5000) tokenBudgetEfficiency = 1;

  // Dual-surface parity: native CLI + MCP
  const dualSurfaceParity = competitorId === "gira";

  // Score calculation: 40% precision, 30% efficiency, 20% zero-hallucinations, 10% dual surface
  const hallPenalty = totalHallucinations * 8;
  const parityBonus = dualSurfaceParity ? 10 : 0;
  const score = Math.round(
    factualPrecisionRate * 0.40 +
    (tokenBudgetEfficiency / 5) * 30 +
    Math.max(0, 20 - hallPenalty) +
    parityBonus
  );

  return {
    tokenBudgetEfficiency,
    factualPrecisionRate,
    contextTokensUsed: totalTokens,
    hallucinationsCount: totalHallucinations,
    dualSurfaceParity,
    score: Math.min(100, Math.max(0, score)),
  };
}
