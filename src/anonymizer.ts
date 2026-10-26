import type { CompetitorId } from "./types";

export interface AnonymizationMapping {
  systemLabel: string; // e.g. "System Alpha"
  toolLabel: string;   // e.g. "tool-alpha"
  originalName: string;
}

export const ANONYMIZED_SYSTEMS: Record<CompetitorId, AnonymizationMapping> = {
  gira: {
    systemLabel: "System Alpha",
    toolLabel: "tool-alpha",
    originalName: "Gira-G",
  },
  "understand-anything": {
    systemLabel: "System Beta",
    toolLabel: "tool-beta",
    originalName: "Understand-Anything",
  },
  graphify: {
    systemLabel: "System Gamma",
    toolLabel: "tool-gamma",
    originalName: "Graphify",
  },
  "static-baseline": {
    systemLabel: "System Delta",
    toolLabel: "tool-delta",
    originalName: "Static Markdown",
  },
};

/**
 * Strips all proprietary brand names, author references, GitHub handles,
 * and repo URLs to produce completely neutral, double-blind text for LLM judges.
 */
export function anonymizeContent(content: string, competitorId: CompetitorId): string {
  const meta = ANONYMIZED_SYSTEMS[competitorId];
  let result = content;

  // 1. Remove URLs and git repositories
  result = result.replace(/https:\/\/github\.com\/[a-zA-Z0-9_\-\/]+/g, "https://github.com/org/repo");
  result = result.replace(/git@github\.com:[a-zA-Z0-9_\-\/]+\.git/g, "git@github.com:org/repo.git");

  // 2. Anonymize system brand names
  switch (competitorId) {
    case "gira":
      result = result.replace(/\bGira-G\b/g, meta.systemLabel);
      result = result.replace(/\bGira\b/g, meta.systemLabel);
      result = result.replace(/\bgira\b/g, meta.toolLabel);
      result = result.replace(/\bgira\.yaml\b/g, "system-manifest.yaml");
      break;

    case "understand-anything":
      result = result.replace(/\bUnderstand-Anything\b/gi, meta.systemLabel);
      result = result.replace(/\bUnderstandAnything\b/gi, meta.systemLabel);
      result = result.replace(/\bEgonex-AI\b/gi, "ResearchTeamBeta");
      break;

    case "graphify":
      result = result.replace(/\bGraphify\b/gi, meta.systemLabel);
      result = result.replace(/\bgraphify\b/gi, meta.toolLabel);
      break;

    case "static-baseline":
      result = result.replace(/\bDocusaurus\b/gi, meta.systemLabel);
      result = result.replace(/\bMkDocs\b/gi, meta.systemLabel);
      break;
  }

  // 3. Remove developer signatures and local paths
  result = result.replace(/\/home\/[a-zA-Z0-9_\-\.]+/g, "/workspace");
  result = result.replace(/\/Users\/[a-zA-Z0-9_\-\.]+/g, "/workspace");

  return result;
}
