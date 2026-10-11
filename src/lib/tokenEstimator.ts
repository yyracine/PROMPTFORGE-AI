import { TargetProfileId } from '../types/promptforge';

export interface ModelTokenPricingProfile {
  id: TargetProfileId;
  name: string;
  provider: string;
  contextWindowTokens: number;
  contextWindowLabel: string;
  inputPricePerMillionUsd: number;
  outputPricePerMillionUsd: number;
}

export const MODEL_TOKEN_PROFILES: Record<TargetProfileId, ModelTokenPricingProfile> = {
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code (Sonnet 3.7 Agent)',
    provider: 'Anthropic',
    contextWindowTokens: 200_000,
    contextWindowLabel: '200K',
    inputPricePerMillionUsd: 3.0,
    outputPricePerMillionUsd: 15.0,
  },
  'cursor-agent': {
    id: 'cursor-agent',
    name: 'Cursor Agent (Composer)',
    provider: 'Cursor / Multi-LLM',
    contextWindowTokens: 128_000,
    contextWindowLabel: '128K',
    inputPricePerMillionUsd: 2.5,
    outputPricePerMillionUsd: 10.0,
  },
  opencode: {
    id: 'opencode',
    name: 'OpenCode CLI Agent',
    provider: 'OpenCode',
    contextWindowTokens: 128_000,
    contextWindowLabel: '128K',
    inputPricePerMillionUsd: 2.0,
    outputPricePerMillionUsd: 8.0,
  },
  'claude-3-7-sonnet': {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    contextWindowTokens: 200_000,
    contextWindowLabel: '200K',
    inputPricePerMillionUsd: 3.0,
    outputPricePerMillionUsd: 15.0,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindowTokens: 128_000,
    contextWindowLabel: '128K',
    inputPricePerMillionUsd: 2.5,
    outputPricePerMillionUsd: 10.0,
  },
  'gemini-3-8-flash': {
    id: 'gemini-3-8-flash',
    name: 'Gemini 3.8 Flash',
    provider: 'Google',
    contextWindowTokens: 1_000_000,
    contextWindowLabel: '1M',
    inputPricePerMillionUsd: 0.15,
    outputPricePerMillionUsd: 0.6,
  },
};

export interface TokenEstimationMetrics {
  tokens: number;
  words: number;
  characters: number;
  contextWindowTokens: number;
  contextWindowLabel: string;
  contextUsagePercent: number;
  remainingTokens: number;
  inputCostUsd: number;
  estimatedCycleCostUsd: number; // Input + typical 800-token response
  modelName: string;
  inputPricePerMillionUsd: number;
}

/**
 * Calcule de manière déterministe le nombre estimé de tokens BPE (CL100K / SentencePiece)
 * pour un texte en français ou mixte code/markdown :
 * - Mots standards, sous-mots français accentués, ponctuation et symboles de code/balises XML/Markdown.
 */
export function countTokensApproximate(text: string): number {
  const clean = text;
  if (!clean || !clean.trim()) return 0;

  // Separate words, numbers, punctuation/operators, and whitespace newlines
  const words = clean.trim().split(/\s+/).filter(Boolean);
  let tokenCount = 0;

  for (const w of words) {
    const len = w.length;
    if (len <= 3) {
      tokenCount += 1;
    } else if (len <= 7) {
      tokenCount += 1.3;
    } else if (len <= 12) {
      tokenCount += 1.85;
    } else {
      tokenCount += Math.ceil(len / 4.2);
    }

    // Count code symbols, XML/Markdown brackets, and punctuation attached to words
    const specialChars = (w.match(/[{}()[\]<>#:;,.="/\\|`~*+-]/g) || []).length;
    tokenCount += specialChars * 0.45;
  }

  // Account for line breaks
  const newlines = (clean.match(/\n/g) || []).length;
  tokenCount += newlines * 0.5;

  return Math.max(1, Math.round(tokenCount));
}

export function estimateTokensAndCost(
  text: string,
  targetModel: TargetProfileId = 'claude-code'
): TokenEstimationMetrics {
  const profile =
    MODEL_TOKEN_PROFILES[targetModel] || MODEL_TOKEN_PROFILES['claude-code'];

  const characters = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tokens = countTokensApproximate(text);

  const contextUsagePercent = Math.min(
    100,
    (tokens / profile.contextWindowTokens) * 100
  );
  const remainingTokens = Math.max(0, profile.contextWindowTokens - tokens);

  const inputCostUsd = (tokens / 1_000_000) * profile.inputPricePerMillionUsd;
  const typicalOutputTokens = tokens > 0 ? 800 : 0;
  const outputCostUsd =
    (typicalOutputTokens / 1_000_000) * profile.outputPricePerMillionUsd;

  return {
    tokens,
    words,
    characters,
    contextWindowTokens: profile.contextWindowTokens,
    contextWindowLabel: profile.contextWindowLabel,
    contextUsagePercent,
    remainingTokens,
    inputCostUsd,
    estimatedCycleCostUsd: inputCostUsd + outputCostUsd,
    modelName: profile.name,
    inputPricePerMillionUsd: profile.inputPricePerMillionUsd,
  };
}

export function formatUsdCost(usd: number): string {
  if (usd === 0) return '$0.0000';
  if (usd < 0.0001) return '< $0.0001';
  return `$${usd.toFixed(4)}`;
}
