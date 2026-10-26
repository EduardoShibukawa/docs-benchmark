import type { CompetitorId } from "../types";

export interface ToolFeature {
  id: string;
  category: "Extração & Análise" | "Documentação" | "Interação Humana / IA" | "Governança & CI";
  name: string;
  description: string;
  competitors: Record<CompetitorId, {
    supported: "full" | "partial" | "none";
    details: string;
  }>;
  tradeOffAnalysis: string;
}

export const FEATURE_MATRIX: ToolFeature[] = [
  {
    id: "feat-deterministic-ast",
    category: "Extração & Análise",
    name: "Extração Determinística de Código (Zero-Token)",
    description: "Capacidade de extrair nós, chamadas, símbolos e fronteiras sem depender de LLMs estocásticas.",
    competitors: {
      gira: {
        supported: "full",
        details: "Go AST e analisadores estáticos nativos (<100ms, $0 tokens). Fatos matemáticos com locators byte-exatos.",
      },
      "understand-anything": {
        supported: "partial",
        details: "Apenas arestas de 'import' são determinísticas (via tree-sitter). Todas as outras relações e nós vêm de prompts de LLM.",
      },
      graphify: {
        supported: "partial",
        details: "Constrói grafo determinístico de imports/exports, mas depende de heurísticas para inferir nós de domínio.",
      },
      "static-baseline": {
        supported: "none",
        details: "Nenhuma extração automática; manutenção 100% manual.",
      },
    },
    tradeOffAnalysis: "O Gira-G garante 100% de reproducibilidade em CI com custo zero. O Understand-Anything troca o determinismo por riqueza semântica gerada por IA.",
  },
  {
    id: "feat-non-deterministic-context",
    category: "Extração & Análise",
    name: "Ingestão de Intenções Humanas (Specs, Tasks, ADRs)",
    description: "Leitura de artefatos não-determinísticos além do código para entender o 'Porquê' do sistema.",
    competitors: {
      gira: {
        supported: "partial",
        details: "Lê ADRs e manifestos de arquitetura. Em evolução para ingerir specs e tarefas (P-Ingá integration).",
      },
      "understand-anything": {
        supported: "full",
        details: "Lê READMEs, issues, comentários e documentação para gerar metáforas conceituais alinhadas ao negócio.",
      },
      graphify: {
        supported: "none",
        details: "Focado estritamente na topologia dos arquivos de código.",
      },
      "static-baseline": {
        supported: "partial",
        details: "Contém texto livre escrito por humanos, mas desincronizado do código.",
      },
    },
    tradeOffAnalysis: "O Understand-Anything é mestre em contextualizar o negócio a partir de texto livre. O Gira-G é forte em código, mas precisa ingerir mais o contexto de negócio.",
  },
  {
    id: "feat-code-intent-sync",
    category: "Extração & Análise",
    name: "Sincronização Código ↔ Intenção com Prova de Drift",
    description: "Mecanismo que detecta quando o código divergiu do que foi especificado nas decisões e contratos.",
    competitors: {
      gira: {
        supported: "full",
        details: "Merkle hashes, immutable ledger (P-Ingá) e verificação de contratos fail-closed em pull requests.",
      },
      "understand-anything": {
        supported: "partial",
        details: "Possui fingerprints estruturais e symbol-loss gate, mas não valida contratos de negócio nem impede drift em CI.",
      },
      graphify: {
        supported: "none",
        details: "Gera snapshot estático do momento; sem detecção ativa de drift.",
      },
      "static-baseline": {
        supported: "none",
        details: "A documentação envelhece silenciosamente (link rot e drift garantidos).",
      },
    },
    tradeOffAnalysis: "O Gira-G é a única ferramenta projetada para bloquear código divergente em CI. As outras são ferramentas consultivas de pós-fato.",
  },
  {
    id: "feat-triple-surface-docs",
    category: "Documentação",
    name: "Tripla Superfície de Docs (Web + Markdown + Agente)",
    description: "Separação arquitetural entre docs públicas para humanos, docs internas do repo e recortes para IAs.",
    competitors: {
      gira: {
        supported: "full",
        details: "Gera site estático responsivo, ARCHITECTURE.md versionado no repo, e envelopes bounded slice via CLI e MCP.",
      },
      "understand-anything": {
        supported: "partial",
        details: "Gera wiki markdown/HTML rica para humanos, mas não possui interface cirúrgica de tokens para agentes de código.",
      },
      graphify: {
        supported: "partial",
        details: "Gera visualizador gráfico interativo e export JSON.",
      },
      "static-baseline": {
        supported: "partial",
        details: "Apenas site HTML/Markdown estático manual.",
      },
    },
    tradeOffAnalysis: "A divisão em 3 superfícies do Gira-G impede que a complexidade de agentes polua a visão humana, e impede que a prosa humana estoure o contexto do agente.",
  },
  {
    id: "feat-natural-language-query",
    category: "Interação Humana / IA",
    name: "Consulta em Linguagem Natural (`ask` / `query`)",
    description: "Capacidade de perguntar em linguagem natural sobre o sistema e receber respostas e diagramas explicativos.",
    competitors: {
      "understand-anything": {
        supported: "full",
        details: "Comando interativo `/understand-query` conversa diretamente com o desenvolvedor, tirando dúvidas conceituais.",
      },
      gira: {
        supported: "partial",
        details: "Comandos estruturados (`explain`, `impact`, `tour`). Proposta do `gira ask` para consulta livre via LLM grounded no Macro Map.",
      },
      graphify: {
        supported: "partial",
        details: "Busca de texto e navegação visual de nós no grafo.",
      },
      "static-baseline": {
        supported: "none",
        details: "Apenas busca simples por substring (Algolia/Lunr).",
      },
    },
    tradeOffAnalysis: "O Understand-Anything brilha na conversa natural. O Gira-G pode incorporar o `gira ask` unindo sua precisão determinística à síntese de LLMs.",
  },
  {
    id: "feat-mental-models",
    category: "Interação Humana / IA",
    name: "Modelagem Mental Humana & Metáforas de Negócio",
    description: "Habilidade de traduzir arquitetura complexa em analogias compreensíveis para qualquer ser humano.",
    competitors: {
      "understand-anything": {
        supported: "full",
        details: "Cria metáforas de negócio poderosas ('Passport Control', 'Fulfillment Pipeline'). Didática nota 5/5.",
      },
      graphify: {
        supported: "partial",
        details: "Visualiza topologia matemática e clusters de comunidade, mas a linguagem permanece técnica.",
      },
      gira: {
        supported: "partial",
        details: "Estrutura blocos de camadas limpos, mas a linguagem ainda é pesada em termos de engenharia (invariants, Merkle).",
      },
      "static-baseline": {
        supported: "none",
        details: "Listas de arquivos e tabelas sem narrativa explicativa.",
      },
    },
    tradeOffAnalysis: "O Understand-Anything é o padrão-ouro de empatia humana. O Gira-G precisa adotar essa camada de metáforas no topo de suas docs públicas.",
  },
  {
    id: "feat-ci-governance-gates",
    category: "Governança & CI",
    name: "CI Governance Gates & Bloqueio de PR",
    description: "Execução automatizada em pipelines de integração contínua que falha caso contratos sejam quebrados.",
    competitors: {
      gira: {
        supported: "full",
        details: "`gira gate-lint --strict` roda em segundos no CI e barra commits com imports proibidos ou contratos quebrados.",
      },
      "understand-anything": {
        supported: "none",
        details: "Ferramenta consultiva de leitura. Não é desenhada para rodar em CI nem possui exit codes de bloqueio.",
      },
      graphify: {
        supported: "none",
        details: "Apenas visualização exploratória de grafo.",
      },
      "static-baseline": {
        supported: "none",
        details: "Sem verificação ativa.",
      },
    },
    tradeOffAnalysis: "O Gira-G protege o repositório contra erosão arquitetural. As outras são ferramentas puramente passivas.",
  },
  {
    id: "feat-local-first-airgapped",
    category: "Governança & CI",
    name: "Operação Local-First, Zero-Leak & Air-Gapped",
    description: "Capacidade de analisar e auditar a arquitetura inteira em ambiente 100% isolado (air-gapped), sem enviar código para APIs externas ou incorrer em custos por query.",
    competitors: {
      gira: {
        supported: "full",
        details: "Go AST nativo, execução 100% local, zero chamadas de rede externas, zero vazamento de IP corporativo.",
      },
      "understand-anything": {
        supported: "none",
        details: "Exige enviar o código para LLMs na nuvem, gerando dependência externa, vazamento de propriedade intelectual e custos por token.",
      },
      graphify: {
        supported: "full",
        details: "Gera grafo de arquivos estático localmente sem envio para nuvem.",
      },
      "static-baseline": {
        supported: "full",
        details: "Arquivos markdown estáticos locais sem chamadas remotas.",
      },
    },
    tradeOffAnalysis: "O Gira-G garante conformidade absoluta com ambientes corporativos restritos e bancos, sem vazar código ou estourar orçamentos de inferência. O Understand-Anything troca a privacidade e o custo zero por síntese textual externa.",
  },
];

/**
 * Renders the Feature Comparison Matrix into GitHub-Flavored Markdown.
 */
export function renderFeatureMatrixMarkdown(): string {
  let md = `# 🧩 Matriz Comparativa de Features e Trade-offs Arquiteturais

**Comparativo:** Gira-G vs Understand-Anything (Egonex-AI) vs Graphify vs Static Baseline  

---

| Feature | Gira-G | Understand-Anything | Graphify | Static Baseline |
| :--- | :---: | :---: | :---: | :---: |
`;

  const badge = (s: "full" | "partial" | "none") =>
    s === "full" ? "✅ Total" : s === "partial" ? "🟡 Parcial" : "❌ Não possui";

  for (const f of FEATURE_MATRIX) {
    const g = badge(f.competitors.gira.supported);
    const ua = badge(f.competitors["understand-anything"].supported);
    const gr = badge(f.competitors.graphify.supported);
    const st = badge(f.competitors["static-baseline"].supported);
    md += `| **${f.name}**<br><sub>${f.category}</sub> | ${g} | ${ua} | ${gr} | ${st} |\n`;
  }

  md += `
---

## ⚖️ Análise Aprofundada dos Trade-offs

`;

  for (const f of FEATURE_MATRIX) {
    md += `### ${f.name} (${f.category})\n`;
    md += `> **Trade-off Fundamental:** ${f.tradeOffAnalysis}\n\n`;
    md += `- **Gira-G:** ${f.competitors.gira.details}\n`;
    md += `- **Understand-Anything:** ${f.competitors["understand-anything"].details}\n`;
    md += `- **Graphify:** ${f.competitors.graphify.details}\n`;
    md += `- **Static Baseline:** ${f.competitors["static-baseline"].details}\n\n`;
  }

  return md;
}
