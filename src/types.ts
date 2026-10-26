export type CompetitorId = "gira" | "understand-anything" | "graphify" | "static-baseline";

export interface CompetitorMeta {
  id: CompetitorId;
  name: string;
  paradigm: string;
  sourceType: "ast-deterministic" | "llm-synthetic" | "knowledge-graph" | "manual-static";
}

export interface HumanDXScore {
  executableQuickstartRate: number; // 0 to 100%
  brokenLocatorRate: number;        // 0 to 100% (lower is better)
  timeToHelloWorldMs: number;
  cognitiveDensityScore: number;    // 1 to 5
  macroGradientScore: number;       // 1 to 5
  score: number;                    // 0 to 100 weighted
}

export interface AgentDXScore {
  tokenBudgetEfficiency: number;    // 1 to 5
  factualPrecisionRate: number;     // 0 to 100%
  contextTokensUsed: number;
  hallucinationsCount: number;
  dualSurfaceParity: boolean;       // CLI + MCP
  score: number;                    // 0 to 100 weighted
}

export interface EngineOpsScore {
  buildTimeMs: number;
  generationCostUsd: number;
  driftDetectionGate: boolean;
  deterministicSha: boolean;
  score: number;                    // 0 to 100 weighted
}

export interface CompetitorBenchmarkResult {
  competitor: CompetitorMeta;
  humanDX: HumanDXScore;
  agentDX: AgentDXScore;
  engineOps: EngineOpsScore;
  globalScore: number;              // 0 to 100
  summary: string;
}

export interface BenchmarkProbeTask {
  id: string;
  title: string;
  prompt: string;
  groundTruth: {
    targetFile: string;
    targetSymbol: string;
    expectedConsumers: string[];
  };
}

export interface QuickstartSnippet {
  id: string;
  commands: string[];
  env?: Record<string, string>;
  expectedOutputSubstrings?: string[];
}
