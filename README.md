# 🏆 Docs-Benchmark

**Docs-Benchmark** is an open, reproducible comparative benchmark suite for technical documentation engines.
It measures documentation quality across the two critical personas of modern software engineering:
1. **Human Developers** (Onboarding, cognitive load, macro-to-micro gradient, executability)
2. **AI Coding Agents** (Context window budget, factual accuracy, AST byte locators, zero hallucinations, MCP parity)
3. **Engine Operations** (Build latency, token cost, CI drift gate enforcement)

---

## 📊 The Tri-Axial Evaluation Matrix

```
                      ┌────────────────────────────────────────┐
                      │             docs-benchmark             │
                      └───────────────────┬────────────────────┘
                                          │
         ┌────────────────────────────────┼────────────────────────────────┐
         ▼                                ▼                                ▼
  [ 🧑 Human DX ]                  [ 🤖 Agent DX ]                 [ ⚙️ Engine Ops ]
  • Executable Quickstart Rate     • Token Budget Efficiency       • Build Time (ms)
  • Broken Link / Locator Rate     • Factual Precision Rate (%)    • Generation Cost ($)
  • Time to Hello World (ms)       • Context Tokens Used           • CI Drift Gate
  • Cognitive Density (1-5)        • Hallucinations Count          • Merkle Determinism
  • Macro Gradient (1-5)           • Dual-Surface MCP Parity       • Runtime Overhead
```

---

## 🚀 Quickstart & Usage

```bash
# Run full comparative benchmark suite
bun run src/cli.ts compare

# Output results in machine-readable JSON
bun run src/cli.ts compare --json

# Audit an existing documentation directory for broken locators and anchors
bun run src/cli.ts audit ../gira-g/build
```

---

## 🔬 Benchmark Competitors Evaluated

- **Gira-G:** Deterministic AST Living Architecture, Bounded Context Slices, zero-token fast pass, fail-closed CI gates.
- **Understand-Anything (Egonex-AI):** LLM-prompted conceptual wikis, rich human metaphors, high pedagogical value.
- **Graphify:** Codebase knowledge graph extraction, community clustering, dependency visualization.
- **Static Baseline:** Standard manual documentation (Docusaurus/MkDocs) without living synchronization.

## License

Apache-2.0, see [LICENSE](LICENSE).
