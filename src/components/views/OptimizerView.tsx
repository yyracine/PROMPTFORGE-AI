import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Copy,
  Save,
  ArrowRightLeft,
  ShieldCheck,
  Loader2,
  Check,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { OPTIMIZATION_OPERATIONS, TARGET_PROFILES } from '../../lib/constants';
import { TokenCounterBar } from '../common/TokenCounterBar';
import {
  OptimizationOperation,
  TargetProfileId,
  RewriteAnalysisResult,
  RewriteSuggestion,
} from '../../types/promptforge';

export const OptimizerView: React.FC = () => {
  const {
    optimizerInput,
    setOptimizerInput,
    optimizerOperations,
    setOptimizerOperations,
    optimizerTarget,
    setOptimizerTarget,
    optimizerResult,
    setOptimizerResult,
    openPromptInEvaluator,
    refreshAllData,
    addToast,
  } = useWorkspace();

  const [editableOptimized, setEditableOptimized] = useState<string>(
    optimizerResult?.optimizedPrompt || ''
  );
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Automated Iteration based on Performance Analysis state
  const [isAnalyzingRewrites, setIsAnalyzingRewrites] = useState<boolean>(false);
  const [rewriteData, setRewriteData] = useState<RewriteAnalysisResult | null>(null);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);

  const toggleOperation = (opId: OptimizationOperation) => {
    setOptimizerOperations((prev) =>
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  const handleGenerateRewriteSuggestions = async () => {
    if (!optimizerInput.trim()) {
      addToast('warning', 'Veuillez saisir ou coller un prompt dans le panneau de gauche avant de lancer l’itération.');
      return;
    }

    setIsAnalyzingRewrites(true);
    setSelectedSuggestionId(null);
    try {
      const res = await fetch('/api/ai/suggest-rewrites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: optimizerInput,
          targetProfile: optimizerTarget,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Échec de l’analyse de performance.');
        return;
      }

      const data: RewriteAnalysisResult = await res.json();
      setRewriteData(data);
      if (data.suggestions && data.suggestions.length > 0) {
        setSelectedSuggestionId(data.suggestions[0].id);
      }
      addToast('success', `${data.suggestions.length} suggestions de réécriture générées à partir de l’audit de performance.`);
    } catch (err: any) {
      addToast('error', `Erreur lors de l’itération automatique : ${err.message}`);
    } finally {
      setIsAnalyzingRewrites(false);
    }
  };

  const applyRewriteSuggestion = (suggestion: RewriteSuggestion) => {
    setEditableOptimized(suggestion.suggestedPrompt);
    setSelectedSuggestionId(suggestion.id);
    addToast('success', `Suggestion « ${suggestion.title} » appliquée dans le panneau droit.`);
  };

  const handleOptimize = async () => {
    if (!optimizerInput.trim()) {
      addToast('warning', 'Veuillez coller un prompt existant dans le panneau de gauche.');
      return;
    }
    if (optimizerOperations.length === 0) {
      addToast('warning', 'Sélectionnez au moins une opération d’optimisation.');
      return;
    }

    setIsOptimizing(true);
    try {
      const res = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: optimizerInput,
          operations: optimizerOperations,
          targetProfile: optimizerTarget,
          customInstructions,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Échec de l’optimisation.');
        return;
      }

      setOptimizerResult(data);
      setEditableOptimized(data.optimizedPrompt || '');
      await refreshAllData();
      addToast('success', `Prompt optimisé avec succès (${data.durationMs} ms).`);
    } catch (err: any) {
      addToast('error', `Erreur réseau : ${err.message}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveOptimized = async () => {
    const contentToSave = editableOptimized || optimizerResult?.optimizedPrompt || '';
    if (!contentToSave.trim()) return;

    const finalTitle =
      saveTitle.trim() || `Prompt Optimisé — ${new Date().toLocaleDateString('fr-FR')}`;

    setIsSaving(true);
    try {
      const profileObj =
        TARGET_PROFILES.find((p) => p.id === optimizerTarget) || TARGET_PROFILES[0];
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: `Optimisé (${optimizerOperations.join(', ')})`,
          original_input: optimizerInput,
          generated_content: contentToSave,
          domain: 'Développement logiciel',
          task_type: 'optimization',
          target_provider: profileObj.provider,
          target_model: optimizerTarget,
          output_format: profileObj.recommendedFormat,
          category_id: 'cat-dev',
          tags: ['optimise', optimizerTarget],
          mode_used: 'optimisation',
          change_summary:
            optimizerResult?.summary?.clarifiedElements?.[0] || 'Optimisation professionnelle',
        }),
      });

      if (res.ok) {
        await refreshAllData();
        addToast('success', `Version optimisée « ${finalTitle} » enregistrée en bibliothèque.`);
      } else {
        const err = await res.json();
        addToast('error', err.error || 'Impossible d’enregistrer le prompt.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const displayedOptimized = editableOptimized || optimizerResult?.optimizedPrompt || '';

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Optimiseur de prompts côte-à-côte
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Clarifiez, enrichissez et adaptez un prompt existant sans jamais altérer votre texte original.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <select
            value={optimizerTarget}
            onChange={(e) => setOptimizerTarget(e.target.value as TargetProfileId)}
            className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)]"
          >
            {TARGET_PROFILES.map((tp) => (
              <option key={tp.id} value={tp.id}>
                Cible : {tp.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateRewriteSuggestions}
            disabled={isAnalyzingRewrites || !optimizerInput.trim()}
            title="Analyser les performances du prompt original et générer 3 variantes de réécriture supérieures"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAnalyzingRewrites ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isAnalyzingRewrites ? 'Analyse & Itération...' : 'Itération Automatique'}</span>
          </button>

          <button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-medium transition-opacity disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isOptimizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <SlidersHorizontal className="w-3.5 h-3.5" />
            )}
            <span>{isOptimizing ? 'Optimisation...' : 'Lancer l’optimisation'}</span>
          </button>
        </div>
      </div>

      {/* Système d'Itération Automatique & Suggestions de Réécriture basées sur la Performance */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/20 via-indigo-950/20 to-[var(--bg-surface)] border border-indigo-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/35 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-sm font-display font-bold text-[var(--text-main)] flex items-center gap-2">
                <span>Système d’Itération Automatique & Analyse de Performance</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35">
                  Audit 8D & P-R-I-E-F-V
                </span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Évalue objectivement les points faibles du prompt original et génère 3 réécritures ciblées à fort impact.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateRewriteSuggestions}
            disabled={isAnalyzingRewrites || !optimizerInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
          >
            {isAnalyzingRewrites ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isAnalyzingRewrites ? 'Analyse en cours...' : 'Lancer l’itération automatique'}</span>
          </button>
        </div>

        {/* Résultats d'analyse et propositions de réécriture */}
        {rewriteData && (
          <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)] animate-in fade-in duration-200">
            {/* Diagnostic rapide */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-main)]">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Score actuel estimé :</span>
                  <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {rewriteData.baselineScore}/100
                  </span>
                </div>

                {rewriteData.performanceAnalysis.diagnosedFlaws && rewriteData.performanceAnalysis.diagnosedFlaws.length > 0 && (
                  <div className="hidden md:flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{rewriteData.performanceAnalysis.diagnosedFlaws.length} axe(s) d’amélioration détecté(s)</span>
                  </div>
                )}
              </div>

              <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                {rewriteData.source === 'ai_audit' ? 'Audit IA Gemini 3.8 Flash' : 'Audit Heuristique Local'}
              </span>
            </div>

            {/* Grille des 3 suggestions de réécriture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {rewriteData.suggestions.map((sug) => {
                const isSelected = selectedSuggestionId === sug.id;
                const scoreDiff = sug.impactScoreEstimated - rewriteData.baselineScore;
                return (
                  <div
                    key={sug.id}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500/50 shadow-md'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300">
                          {sug.category}
                        </span>
                        <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <span>{sug.impactScoreEstimated}/100</span>
                          {scoreDiff > 0 && (
                            <span className="text-[10px] font-normal text-emerald-300">
                              (+{scoreDiff})
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-[var(--text-main)] leading-snug">
                        {sug.title}
                      </h3>

                      <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                        {sug.rationale}
                      </p>

                      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1">
                        <span className="text-[10px] font-semibold text-[var(--text-main)] uppercase tracking-wider">
                          Modifications appliquées :
                        </span>
                        <ul className="text-[10px] text-[var(--text-secondary)] space-y-0.5 list-disc list-inside">
                          {sug.changesApplied.slice(0, 3).map((change, i) => (
                            <li key={i} className="truncate" title={change}>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => applyRewriteSuggestion(sug)}
                        className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-[var(--bg-surface-secondary)] hover:bg-indigo-600 hover:text-white text-[var(--text-main)] border border-[var(--border-subtle)]'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>{isSelected ? 'Appliquée dans l’éditeur' : 'Appliquer cette itération'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sélecteur des 13 opérations d'optimisation */}
      <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-main)]">
            Opérations d’optimisation chirurgicale manuelle ({optimizerOperations.length} sélectionnées)
          </span>
          <button
            onClick={() => setOptimizerOperations(['optimisation_pro'])}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            Réinitialiser la sélection
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {OPTIMIZATION_OPERATIONS.map((op) => {
            const active = optimizerOperations.includes(op.id);
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => toggleOperation(op.id)}
                className={`p-3 rounded-lg border text-left transition-colors flex items-start gap-2.5 ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-secondary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)]'
                }`}
              >
                <div
                  className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                    active
                      ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white'
                      : 'border-[var(--border-subtle)]'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-main)] leading-snug break-words">
                    {op.label}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-0.5 break-words">
                    {op.shortDesc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <input
            type="text"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Consigne spécifique facultative (ex: Conserver les noms de variables en anglais, imposer SQLite)..."
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
          />
        </div>
      </div>

      {/* Panneaux Côte-à-Côte sur grands écrans, empilés sur écrans étroits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Panneau Gauche : Prompt Original (jamais modifié sans accord explicite) */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-display font-semibold text-[var(--text-main)]">
              Prompt original (préservé intact)
            </span>
            <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
              {optimizerInput.trim() ? optimizerInput.trim().split(/\s+/).length : 0} mots
            </span>
          </div>

          <textarea
            rows={16}
            value={optimizerInput}
            onChange={(e) => setOptimizerInput(e.target.value)}
            placeholder="Collez ici le prompt existant que vous souhaitez clarifier, restructurer ou adapter..."
            className="w-full flex-1 p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-sm leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <TokenCounterBar
            text={optimizerInput}
            targetProfile={optimizerTarget}
            label="Tokens du prompt original"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
            <span>Le texte original n’est jamais écrasé automatiquement.</span>
            <button
              onClick={() => {
                if (!optimizerInput.trim()) return;
                navigator.clipboard.writeText(optimizerInput);
                addToast('success', 'Prompt original copié.');
              }}
              className="hover:text-[var(--text-main)] font-medium whitespace-nowrap shrink-0"
            >
              Copier l’original
            </button>
          </div>
        </div>

        {/* Panneau Droit : Prompt Optimisé */}
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-display font-semibold text-[var(--text-main)]">
              Prompt optimisé (modifiable)
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  if (!displayedOptimized.trim()) return;
                  setOptimizerInput(displayedOptimized);
                  addToast('success', 'La version optimisée a été basculée comme nouvelle base de travail.');
                }}
                disabled={!displayedOptimized.trim()}
                title="Remplacer l'original par cette version optimisée avec votre accord"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
              >
                <ArrowRightLeft className="w-3 h-3" />
                <span>Utiliser comme base</span>
              </button>

              <button
                onClick={() => openPromptInEvaluator(displayedOptimized)}
                disabled={!displayedOptimized.trim()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
              >
                <ShieldCheck className="w-3 h-3 text-[var(--accent-primary)]" />
                <span>Évaluer</span>
              </button>

              <button
                onClick={() => {
                  if (!displayedOptimized.trim()) return;
                  navigator.clipboard.writeText(displayedOptimized);
                  addToast('success', 'Version optimisée copiée dans le presse-papiers.');
                }}
                disabled={!displayedOptimized.trim()}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)] disabled:opacity-40"
              >
                <Copy className="w-3 h-3" />
                <span>Copier</span>
              </button>
            </div>
          </div>

          <textarea
            rows={16}
            value={displayedOptimized}
            onChange={(e) => setEditableOptimized(e.target.value)}
            placeholder="La version optimisée s'affichera côte-à-côte ici après analyse..."
            className="w-full flex-1 p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-sm leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <TokenCounterBar
            text={displayedOptimized}
            targetProfile={optimizerTarget}
            label="Tokens du prompt optimisé"
            comparisonBaseText={optimizerInput}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Titre pour enregistrer cette version optimisée..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
            <button
              onClick={handleSaveOptimized}
              disabled={!displayedOptimized.trim() || isSaving}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium disabled:opacity-40 whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Résumé détaillé des changements */}
      {optimizerResult?.summary && (
        <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
          <h2 className="text-base font-display font-semibold text-[var(--text-main)]">
            Résumé structuré des changements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                1. Éléments clarifiés
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                {(optimizerResult.summary.clarifiedElements || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                2. Informations et structure ajoutées
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                {(optimizerResult.summary.addedInformation || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                3. Contradictions corrigées
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                {(optimizerResult.summary.correctedContradictions?.length
                  ? optimizerResult.summary.correctedContradictions
                  : ['Aucune contradiction directe détectée dans le prompt source.']
                ).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                4. Contraintes et critères améliorés
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                {(optimizerResult.summary.improvedConstraints || []).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2 md:col-span-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                5. Hypothèses éventuelles introduites
              </div>
              <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                {(optimizerResult.summary.assumptionsMade?.length
                  ? optimizerResult.summary.assumptionsMade
                  : ['Aucune hypothèse arbitraire ajoutée hors du périmètre initial.']
                ).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
