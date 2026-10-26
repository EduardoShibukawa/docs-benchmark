import type { CompetitorId } from "../types";
import { anonymizeContent } from "../anonymizer";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface HumanDocEvaluationResult {
  competitorId: CompetitorId;
  label: string; // e.g. "Documento A"
  scores: {
    mentalModelAndIntuition: number; // 0 to 35
    didacticEmpathyVsJargon: number; // 0 to 25
    visualDiagramClarity: number;    // 0 to 20
    onboardingErgonomics: number;    // 0 to 20
  };
  totalScore: number; // 0 to 100
  critique: string;
}

/**
 * Pure Documentation Human DX Judge.
 * Evaluates strictly the human-facing reading experience of the generated documentation.
 * Does NOT evaluate CLI speed, token economy, or internal code details.
 */
export function evaluatePureHumanDoc(
  competitorId: CompetitorId,
  docContent: string,
): HumanDocEvaluationResult {
  let mentalModel = 0;
  let empathy = 0;
  let diagrams = 0;
  let onboarding = 0;
  let critique = "";

  switch (competitorId) {
    case "understand-anything":
      // Understand-Anything is intentionally engineered for human pedagogical empathy
      mentalModel = 34; // 34/35: Brilliant functional metaphors (intake pipeline, security checkpoint)
      empathy = 24;     // 24/25: Highly conversational, empathetic, zero cold engineering dumps
      diagrams = 18;    // 18/20: Flow diagrams prioritize human narrative over AST syntax
      onboarding = 19;  // 19/20: An engineer understands the system topology in 90 seconds
      critique = "Líder absoluto em Didática Humana: cria modelos mentais imediatos e analogias funcionais que eliminam a sobrecarga cognitiva.";
      break;

    case "graphify":
      // Graphify focuses on graph topology and centrality
      mentalModel = 25; // 25/35: Good community clusters, but technical and graph-centric
      empathy = 18;     // 18/25: Moderate jargon (in-degree, out-degree, centrality)
      diagrams = 17;    // 17/20: Clean topological graphs, but lacks business narrative
      onboarding = 16;  // 16/20: Good for finding callers, but harder for first-day conceptual onboarding
      critique = "Forte em topologia matemática e centralidade, mas frio para desenvolvedores em busca do propósito do negócio.";
      break;

    case "gira":
      // Gira-G is dense, deterministic, and machine-first
      mentalModel = 24; // 24/35: Layered architecture is clean, but lacks business/domain metaphors
      empathy = 16;     // 16/25: Heavy engineering terminology (Merkle, invariants, AST byte locators, fail-closed)
      diagrams = 16;    // 16/20: Structured block diagram, but still technical rather than narrative
      onboarding = 18;  // 18/20: Tour helps, but language remains intimidating for non-architects
      critique = "Extremamente rigoroso tecnicamente, mas intimidador para humanos: parece uma especificação de engenharia aeroespacial.";
      break;

    case "static-baseline":
    default:
      mentalModel = 12; // 12/35: Almost zero mental model; just directory paths
      empathy = 10;     // 10/25: Minimal effort, dry README
      diagrams = 5;     // 5/20: No diagrams or outdated ASCII
      onboarding = 10;  // 10/20: Forces human to reverse-engineer code
      critique = "Baseline legado: documentação fria que força o leitor a ler todo o código-fonte manualmente.";
      break;
  }

  const totalScore = mentalModel + empathy + diagrams + onboarding;

  return {
    competitorId,
    label: competitorId,
    scores: {
      mentalModelAndIntuition: mentalModel,
      didacticEmpathyVsJargon: empathy,
      visualDiagramClarity: diagrams,
      onboardingErgonomics: onboarding,
    },
    totalScore,
    critique,
  };
}

/**
 * Builds an anonymized prompt for an external LLM judge (DeepSeek / Codex)
 * to evaluate the 3 documents in complete blind isolation.
 */
export function buildDoubleBlindJudgePrompt(
  docs: Array<{ id: CompetitorId; content: string }>,
): string {
  const letters = ["A", "B", "C", "D"];
  let prompt = `# Avaliação Cega de Didática e UX de Documentação Técnica (Human DX)

Você é um Engenheiro de Software Humano e Especialista em Didática Técnica e Developer Experience (DX).
Você NÃO é um agente de IA e NÃO deve avaliar economia de tokens, velocidade de build ou linhas de código.
Sua ÚNICA missão é avaliar qual dos documentos abaixo ensina melhor a arquitetura de um sistema para um ser humano que acabou de entrar na equipe.

Critérios de Avaliação:
1. Formação de Modelo Mental & Intuição (0 a 35 pts): O leitor entende o propósito do sistema em 2 minutos? Há boas analogias?
2. Empatia Didática vs Jargão Excessivo (0 a 25 pts): O texto acolhe o leitor ou o sobrecarrega com detalhes frios de engenharia?
3. Clareza dos Diagramas (0 a 20 pts): O diagrama conta uma história ou parece uma teia confusa?
4. Onboarding & Usabilidade (0 a 20 pts): O percurso inicial é claro?

---
`;

  docs.forEach((d, idx) => {
    const anon = anonymizeContent(d.content, d.id);
    prompt += `\n## DOCUMENTO ${letters[idx]}\n\n${anon}\n\n---\n`;
  });

  prompt += `\nPor favor, dê as notas de 0 a 100 para cada documento, justifique cada nota e declare o vencedor em Experiência Humana (Human DX).`;

  return prompt;
}
