import React, { useMemo } from 'react';
import { Cpu } from 'lucide-react';
import {
  estimateTokensAndCost,
  formatUsdCost,
} from '../../lib/tokenEstimator';
import { TargetProfileId } from '../../types/promptforge';

interface TokenCounterBarProps {
  text: string;
  targetProfile: TargetProfileId;
  label?: string;
  comparisonBaseText?: string; // Optional base text (e.g. original prompt in Optimizer) to show token delta
}

export const TokenCounterBar: React.FC<TokenCounterBarProps> = ({
  text,
  targetProfile,
  label = 'Estimation Tokens & Contexte',
  comparisonBaseText,
}) => {
  const metrics = useMemo(
    () => estimateTokensAndCost(text, targetProfile),
    [text, targetProfile]
  );

  const baseMetrics = useMemo(
    () =>
      comparisonBaseText !== undefined
        ? estimateTokensAndCost(comparisonBaseText, targetProfile)
        : null,
    [comparisonBaseText, targetProfile]
  );

  const tokenDelta =
    baseMetrics && baseMetrics.tokens > 0 && metrics.tokens > 0
      ? metrics.tokens - baseMetrics.tokens
      : null;

  const tokenDeltaPercent =
    baseMetrics && baseMetrics.tokens > 0 && tokenDelta !== null
      ? Math.round((tokenDelta / baseMetrics.tokens) * 100)
      : null;

  return (
    <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-[var(--text-main)]">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>{label}</span>
          <span aria-hidden="true" className="text-[var(--text-secondary)]">
            ·
          </span>
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {metrics.modelName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--text-main)]">
            ~{metrics.tokens.toLocaleString('fr-FR')} tokens
          </span>
          {tokenDelta !== null && (
            <span
              className={
                tokenDelta <= 0
                  ? 'text-[var(--status-success)] font-semibold'
                  : 'text-[var(--accent-primary)] font-semibold'
              }
            >
              ({tokenDelta > 0 ? `+${tokenDelta}` : tokenDelta} tok /{' '}
              {tokenDeltaPercent && tokenDeltaPercent > 0
                ? `+${tokenDeltaPercent}%`
                : `${tokenDeltaPercent}%`}
              )
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>{metrics.words.toLocaleString('fr-FR')} mots</span>
          <span aria-hidden="true">·</span>
          <span>{metrics.characters.toLocaleString('fr-FR')} car.</span>
        </div>
      </div>

      {/* Barre de progression de la fenêtre contextuelle */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface)] overflow-hidden border border-[var(--border-subtle)]">
          <div
            className={`h-full transition-all duration-150 ${
              metrics.contextUsagePercent > 80
                ? 'bg-[var(--status-error)]'
                : metrics.contextUsagePercent > 50
                ? 'bg-[var(--status-warning)]'
                : 'bg-[var(--accent-primary)]'
            }`}
            style={{
              width: `${
                metrics.tokens === 0
                  ? 0
                  : Math.max(1.5, Math.min(100, metrics.contextUsagePercent))
              }%`,
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--text-secondary)]">
          <span>
            Limite contextuelle : {metrics.tokens.toLocaleString('fr-FR')} /{' '}
            {metrics.contextWindowTokens.toLocaleString('fr-FR')} tok (
            {metrics.contextUsagePercent < 0.01 && metrics.tokens > 0
              ? '< 0.01'
              : metrics.contextUsagePercent.toFixed(2)}
            % de {metrics.contextWindowLabel})
          </span>

          <span>
            Coût entrée estimé :{' '}
            <strong className="text-[var(--text-main)]">
              {formatUsdCost(metrics.inputCostUsd)}
            </strong>{' '}
            (${metrics.inputPricePerMillionUsd}/1M tok)
          </span>
        </div>
      </div>
    </div>
  );
};
