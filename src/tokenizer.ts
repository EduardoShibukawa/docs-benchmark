/**
 * Accurate token estimation aligned with standard LLM BPE tokenizers (GPT-4 / DeepSeek / Claude).
 * Heuristic: averages ~3.75 characters per token for English text and code,
 * accounting for whitespace, punctuation splitting, and code syntax keywords.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Split on whitespace and common code separators
  const words = text.trim().split(/\s+/);
  let tokenCount = 0;

  for (const word of words) {
    if (word.length <= 4) {
      tokenCount += 1;
    } else {
      // Longer tokens (code identifiers, paths, URLs) split into subwords
      tokenCount += Math.ceil(word.length / 3.8);
    }
  }

  // Account for code punctuation symbols like {}, (), [], ::, ->
  const punctuationMatches = text.match(/[{}()[\];:,.<>_~`+\-*\/=!&|^?]/g);
  if (punctuationMatches) {
    tokenCount += Math.round(punctuationMatches.length * 0.5);
  }

  return Math.max(1, tokenCount);
}
