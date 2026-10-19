import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Info,
  GitCompare,
  Copy,
  Play,
  Scale,
  Gauge,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { evaluatePromptHeuristically } from '../../lib/heuristicEvaluator';
import { computeAutomaticComparisonScoring } from '../../lib/comparisonScorer';
import {
  exportEvaluation8DToCsv,
  exportEvaluation8DToPdf,
  exportModelComparisonToCsv,
  exportModelComparisonToPdf,
} from '../../lib/reportExporter';
import { TARGET_PROFILES } from '../../lib/constants';
import {
  ModelComparisonResult,
  PromptEvaluationResult,
  TargetProfileId,
} from '../../types/promptforge';

export const EvaluatorView: React.FC = () => {
  const {
    evaluatorInput,
    setEvaluatorInput,
    evaluationResults,
    setEvaluationResults,
    prompts,
    openPromptInOptimizer,
    refreshAllData,
    addToast,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'heuristic' | 'ai' | 'comparison'>('heuristic');
  const [isAuditingAI, setIsAuditingAI] = useState(false);

  // State for Side-by-Side Model Comparison (Claude vs GPT-4o, etc.)
  const [modelA, setModelA] = useState<TargetProfileId>('claude-3-7-sonnet');
  const [modelB, setModelB] = useState<TargetProfileId>('gpt-4o');
  const [manualResponseA, setManualResponseA] = useState<string>('');
  const [manualResponseB, setManualResponseB] = useState<string>('');
  const [comparisonResult, setComparisonResult] = useState<ModelComparisonResult | null>(null);
  const [isComparingModels, setIsComparingModels] = useState<boolean>(false);
  const [scoringMode, setScoringMode] = useState<'auto_local' | 'ai_judge'>('auto_local');

  // Instant local structural evaluation whenever input changes
  useEffect(() => {
    if (evaluatorInput.trim()) {
      const localHeuristic = evaluatePromptHeuristically(evaluatorInput);
      setEvaluationResults((prev) => ({ ...prev, heuristic: localHeuristic }));
    } else {
      setEvaluationResults({ heuristic: null, aiAudit: null });
    }
  }, [evaluatorInput, setEvaluationResults]);

  // Real-time automatic 0-10 scoring whenever prompt or either response changes
  const autoScoring = useMemo(() => {
    return computeAutomaticComparisonScoring(evaluatorInput, manualResponseA, manualResponseB);
  }, [evaluatorInput, manualResponseA, manualResponseB]);

  const handleRunAIAudit = async () => {
    if (!evaluatorInput.trim()) {
      addToast('warning', 'Veuillez saisir ou sélectionner un prompt à évaluer.');
      return;
    }

    setIsAuditingAI(true);
    try {
      const res = await fetch('/api/ai/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: evaluatorInput, mode: 'both' }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Échec de l’audit IA.');
        return;
      }

      setEvaluationResults({
        heuristic: data.heuristic,
        aiAudit: data.aiAudit,
      });

      if (data.aiAudit) {
        setActiveTab('ai');
        addToast('success', 'Audit approfondi par modèle d’IA terminé sur les 8 dimensions.');
      } else if (data.warning) {
        addToast('warning', data.warning);
      }
    } catch (err: any) {
      addToast('error', `Erreur réseau : ${err.message}`);
    } finally {
      setIsAuditingAI(false);
    }
  };

  const handleRunModelComparison = async (mode: 'auto' | 'judge_only') => {
    if (!evaluatorInput.trim()) {
      addToast('warning', 'Veuillez saisir ou charger un prompt à tester.');
      return;
    }
    if (modelA === modelB) {
      addToast(
        'warning',
        'Sélectionnez deux modèles distincts pour les comparer (ex: Claude 3.7 Sonnet vs GPT-4o).'
      );
      return;
    }
    if (mode === 'judge_only' && (!manualResponseA.trim() || !manualResponseB.trim())) {
      addToast(
        'warning',
        'Veuillez coller les deux réponses dans les panneaux A et B ou cliquez sur « Générer et comparer les 2 réponses ».'
      );
      return;
    }

    setIsComparingModels(true);
    setActiveTab('comparison');
    try {
      const res = await fetch('/api/ai/compare-models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptText: evaluatorInput,
          modelA,
          modelB,
          manualResponseA,
          manualResponseB,
          executionMode: mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Échec du test comparatif des modèles.');
        return;
      }

      setComparisonResult(data);
      setManualResponseA(data.responseA || '');
      setManualResponseB(data.responseB || '');
      setScoringMode('ai_judge');
      await refreshAllData();
      addToast(
        'success',
        `Comparaison côte-à-côte et scoring (0-10) terminés : ${data.modelAName} vs ${data.modelBName}.`
      );
    } catch (err: any) {
      addToast('error', `Erreur réseau : ${err.message}`);
    } finally {
      setIsComparingModels(false);
    }
  };

  const currentResult: PromptEvaluationResult | null =
    activeTab === 'ai' && evaluationResults.aiAudit
      ? evaluationResults.aiAudit
      : evaluationResults.heuristic;

  const getStatusLabel = (status: string) => {
    if (status === 'excellent') return 'Excellent';
    if (status === 'bon') return 'Bon';
    if (status === 'moyen') return 'À préciser';
    return 'Insuffisant';
  };

  const profileAObj = TARGET_PROFILES.find((p) => p.id === modelA) || TARGET_PROFILES[3];
  const profileBObj = TARGET_PROFILES.find((p) => p.id === modelB) || TARGET_PROFILES[4];

  // Determine displayed 0-10 scores and metric rows (either AI Judge if selected & available, or instant Automatic Scorer)
  const activeMetrics =
    scoringMode === 'ai_judge' && comparisonResult?.comparisonAnalysis?.dimensionComparison?.length
      ? comparisonResult.comparisonAnalysis.dimensionComparison
      : autoScoring.metrics;

  const activeScoreA =
    scoringMode === 'ai_judge' && comparisonResult?.comparisonAnalysis?.overallScoreA !== undefined
      ? Number(comparisonResult.comparisonAnalysis.overallScoreA)
      : autoScoring.overallScoreA;

  const activeScoreB =
    scoringMode === 'ai_judge' && comparisonResult?.comparisonAnalysis?.overallScoreB !== undefined
      ? Number(comparisonResult.comparisonAnalysis.overallScoreB)
      : autoScoring.overallScoreB;

  const hasAnyResponse = Boolean(manualResponseA.trim() || manualResponseB.trim());

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Module d’évaluation et de comparaison (8 dimensions & Modèles)
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Évaluez la qualité structurelle, lancez un audit IA sur 8 dimensions ou comparez côte-à-côte les réponses de deux modèles avec scoring 0–10.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <select
            onChange={(e) => {
              const found = prompts.find((p) => p.id === e.target.value);
              if (found) setEvaluatorInput(found.generated_content);
            }}
            defaultValue=""
            className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] max-w-xs"
          >
            <option value="" disabled>
              Charger depuis la bibliothèque...
            </option>
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => handleRunModelComparison('auto')}
            disabled={isComparingModels || !evaluatorInput.trim()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            {isComparingModels ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-primary)]" />
            ) : (
              <GitCompare className="w-4 h-4 text-[var(--accent-primary)]" />
            )}
            <span>Comparer 2 modèles</span>
          </button>

          <button
            onClick={handleRunAIAudit}
            disabled={isAuditingAI || !evaluatorInput.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-medium disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            {isAuditingAI ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isAuditingAI ? 'Audit IA en cours...' : 'Audit IA 8 dimensions'}</span>
          </button>
        </div>
      </div>

      {/* Barre de navigation interne des 3 modes d'évaluation */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div
          className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
          role="group"
          aria-label="Mode d'évaluation"
        >
          <button
            onClick={() => setActiveTab('heuristic')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'heuristic'
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            1. Analyse structurelle (Locale)
          </button>

          <button
            onClick={() => {
              if (evaluationResults.aiAudit) {
                setActiveTab('ai');
              } else {
                handleRunAIAudit();
              }
            }}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'ai'
                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            2. Évaluation par modèle d’IA {evaluationResults.aiAudit ? '(Prête)' : ''}
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'comparison'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>3. Comparaison de modèles (Claude vs GPT-4o)</span>
          </button>
        </div>

        {activeTab !== 'comparison' && currentResult && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[var(--text-secondary)]">
                Indice global ({activeTab === 'ai' ? 'Audit IA' : 'Structurel'}) :
              </span>
              <span className="text-xl font-display font-bold font-mono tabular-nums text-[var(--accent-primary)]">
                {currentResult.overallScore}/100
              </span>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  exportEvaluation8DToCsv(evaluatorInput, currentResult);
                  addToast('success', 'Rapport d’évaluation 8D exporté au format CSV.');
                }}
                title="Exporter ce rapport d'évaluation 8D au format CSV (compatible Excel)"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Exporter CSV</span>
              </button>

              <button
                onClick={() => {
                  exportEvaluation8DToPdf(evaluatorInput, currentResult);
                  addToast('success', 'Rapport d’évaluation 8D exporté au format PDF.');
                }}
                title="Exporter ce rapport d'évaluation 8D au format PDF professionnel"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Exporter PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VUE 3 : COMPARAISON CÔTE À CÔTE DES RÉPONSES DE MODÈLES + SCORING 0-10 */}
      {activeTab === 'comparison' ? (
        <div className="space-y-6">
          {/* Barre de configuration du duel de modèles + Prompt testé */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]">
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-display font-semibold text-[var(--text-main)]">
                  Prompt soumis simultanément aux deux modèles
                </label>
                <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                  {evaluatorInput.trim() ? evaluatorInput.trim().split(/\s+/).length : 0} mots
                </span>
              </div>
              <textarea
                rows={5}
                value={evaluatorInput}
                onChange={(e) => setEvaluatorInput(e.target.value)}
                placeholder="Saisissez ou collez le prompt que vous souhaitez tester côte-à-côte sur deux profils de modèles..."
                className="w-full p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)]">
                    Modèle A (Panneau Gauche)
                  </label>
                  <select
                    value={modelA}
                    onChange={(e) => setModelA(e.target.value as TargetProfileId)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  >
                    {TARGET_PROFILES.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[var(--text-main)]">
                    Modèle B (Panneau Droit)
                  </label>
                  <select
                    value={modelB}
                    onChange={(e) => setModelB(e.target.value as TargetProfileId)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  >
                    {TARGET_PROFILES.map((tp) => (
                      <option key={tp.id} value={tp.id}>
                        {tp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Le <strong>scoring automatique (0–10)</strong> évalue en temps réel la pertinence, la concision et le respect des contraintes dès que deux réponses sont générées ou collées.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleRunModelComparison('auto')}
                  disabled={isComparingModels || !evaluatorInput.trim()}
                  className="flex-1 min-w-[220px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-medium disabled:opacity-40 text-center"
                >
                  {isComparingModels ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : (
                    <Play className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {isComparingModels
                      ? 'Exécution comparative...'
                      : 'Générer et comparer les 2 réponses'}
                  </span>
                </button>

                <button
                  onClick={() => handleRunModelComparison('judge_only')}
                  disabled={
                    isComparingModels ||
                    !evaluatorInput.trim() ||
                    !manualResponseA.trim() ||
                    !manualResponseB.trim()
                  }
                  title="Arbitrer par IA les réponses déjà présentes dans les panneaux A et B"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <Scale className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                  <span>Arbitrer par IA</span>
                </button>
              </div>
            </div>
          </div>

          {/* Panneaux Côte-à-Côte des réponses Modèle A vs Modèle B avec score 0-10 en en-tête */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Panneau Modèle A */}
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <div className="text-sm font-display font-bold text-[var(--text-main)]">
                    Modèle A : {profileAObj.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                    <span>{profileAObj.provider}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {manualResponseA.trim() ? manualResponseA.trim().split(/\s+/).length : 0} mots
                    </span>
                    {comparisonResult?.durationMsA ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {comparisonResult.durationMsA} ms
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {manualResponseA.trim() && (
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--text-secondary)] block">
                        Score global
                      </span>
                      <span className="text-base font-display font-bold font-mono tabular-nums text-[var(--accent-primary)]">
                        {activeScoreA.toFixed(1)}/10
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!manualResponseA.trim()) return;
                      navigator.clipboard.writeText(manualResponseA);
                      addToast('success', `Réponse de ${profileAObj.name} copiée.`);
                    }}
                    disabled={!manualResponseA.trim()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={15}
                value={manualResponseA}
                onChange={(e) => setManualResponseA(e.target.value)}
                placeholder={`La réponse générée pour ${profileAObj.name} s'affichera ici (ou collez une sortie existante pour calculer son score sur 10)...`}
                className="w-full flex-1 p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            {/* Panneau Modèle B */}
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <div className="text-sm font-display font-bold text-[var(--text-main)]">
                    Modèle B : {profileBObj.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-0.5">
                    <span>{profileBObj.provider}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {manualResponseB.trim() ? manualResponseB.trim().split(/\s+/).length : 0} mots
                    </span>
                    {comparisonResult?.durationMsB ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {comparisonResult.durationMsB} ms
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {manualResponseB.trim() && (
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--text-secondary)] block">
                        Score global
                      </span>
                      <span className="text-base font-display font-bold font-mono tabular-nums text-[var(--accent-primary)]">
                        {activeScoreB.toFixed(1)}/10
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!manualResponseB.trim()) return;
                      navigator.clipboard.writeText(manualResponseB);
                      addToast('success', `Réponse de ${profileBObj.name} copiée.`);
                    }}
                    disabled={!manualResponseB.trim()}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </button>
                </div>
              </div>

              <textarea
                rows={15}
                value={manualResponseB}
                onChange={(e) => setManualResponseB(e.target.value)}
                placeholder={`La réponse générée pour ${profileBObj.name} s'affichera ici (ou collez une sortie existante pour calculer son score sur 10)...`}
                className="w-full flex-1 p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* TABLEAU DE SCORING AUTOMATIQUE (0-10) SUR MÉTRIQUES PRÉDÉFINIES */}
          {hasAnyResponse && (
            <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-primary)]">
                    <Gauge className="w-4 h-4" />
                    <span>
                      Système de scoring automatique (Échelle 0–10)
                    </span>
                  </div>
                  <h2 className="text-base font-display font-bold text-[var(--text-main)]">
                    {activeScoreA > activeScoreB + 0.2
                      ? `Avantage Modèle A : ${profileAObj.name} (${activeScoreA.toFixed(1)}/10 vs ${activeScoreB.toFixed(1)}/10)`
                      : activeScoreB > activeScoreA + 0.2
                      ? `Avantage Modèle B : ${profileBObj.name} (${activeScoreB.toFixed(1)}/10 vs ${activeScoreA.toFixed(1)}/10)`
                      : `Équilibre entre ${profileAObj.name} (${activeScoreA.toFixed(1)}/10) et ${profileBObj.name} (${activeScoreB.toFixed(1)}/10)`}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {scoringMode === 'ai_judge' && comparisonResult?.comparisonAnalysis?.verdictSummary
                      ? comparisonResult.comparisonAnalysis.verdictSummary
                      : autoScoring.methodologyNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Commutateur entre Scoring Automatique Déterministe et Arbitre IA */}
                  <div
                    className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
                    role="group"
                  >
                    <button
                      onClick={() => setScoringMode('auto_local')}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        scoringMode === 'auto_local'
                          ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      Métriques Auto (0–10)
                    </button>
                    {comparisonResult?.comparisonAnalysis && (
                      <button
                        onClick={() => setScoringMode('ai_judge')}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          scoringMode === 'ai_judge'
                            ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        Arbitrage IA (0–10)
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      exportModelComparisonToCsv({
                        promptText: evaluatorInput,
                        modelAName: profileAObj.name,
                        modelBName: profileBObj.name,
                        scoreA: activeScoreA,
                        scoreB: activeScoreB,
                        metrics: activeMetrics,
                        responseA: manualResponseA,
                        responseB: manualResponseB,
                        comparisonResult,
                      });
                      addToast('success', 'Comparaison de modèles exportée au format CSV.');
                    }}
                    title="Exporter la grille de scoring 0-10 et les réponses au format CSV"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                    <span>Exporter CSV</span>
                  </button>

                  <button
                    onClick={() => {
                      exportModelComparisonToPdf({
                        promptText: evaluatorInput,
                        modelAName: profileAObj.name,
                        modelBName: profileBObj.name,
                        scoreA: activeScoreA,
                        scoreB: activeScoreB,
                        metrics: activeMetrics,
                        responseA: manualResponseA,
                        responseB: manualResponseB,
                        comparisonResult,
                      });
                      addToast('success', 'Rapport comparatif des modèles exporté au format PDF.');
                    }}
                    title="Exporter le rapport comparatif complet au format PDF professionnel"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
                  >
                    <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                    <span>Exporter PDF</span>
                  </button>

                  <button
                    onClick={() => openPromptInOptimizer(evaluatorInput)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] hover:bg-[var(--bg-main)] whitespace-nowrap shrink-0"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Optimiser le prompt</span>
                  </button>
                </div>
              </div>

              {/* Grille des 5 métriques prédéfinies sur 10 avec barres comparatives */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
                      <th className="py-2.5 pr-4 font-semibold">Métrique prédéfinie</th>
                      <th className="py-2.5 px-4 font-semibold text-right font-mono">
                        {profileAObj.name} (0–10)
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-right font-mono">
                        {profileBObj.name} (0–10)
                      </th>
                      <th className="py-2.5 px-4 font-semibold text-right font-mono">
                        Écart
                      </th>
                      <th className="py-2.5 pl-4 font-semibold">Diagnostic comparatif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-xs">
                    {activeMetrics.map((row, idx) => {
                      const sA = Number(row.scoreA || 0);
                      const sB = Number(row.scoreB || 0);
                      const delta = Math.round((sA - sB) * 10) / 10;
                      return (
                        <tr key={idx} className="hover:bg-[var(--bg-surface-secondary)]/50">
                          <td className="py-3.5 pr-4 font-medium text-[var(--text-main)] whitespace-nowrap">
                            {row.dimension}
                          </td>

                          {/* Score Modèle A + barre 0-10 */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-[var(--accent-primary)]"
                                  style={{ width: `${Math.min(100, Math.max(0, sA * 10))}%` }}
                                />
                              </div>
                              <span className="font-mono tabular-nums font-bold text-[var(--text-main)]">
                                {sA.toFixed(1)}/10
                              </span>
                            </div>
                          </td>

                          {/* Score Modèle B + barre 0-10 */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-[var(--accent-secondary)]"
                                  style={{ width: `${Math.min(100, Math.max(0, sB * 10))}%` }}
                                />
                              </div>
                              <span className="font-mono tabular-nums font-bold text-[var(--text-main)]">
                                {sB.toFixed(1)}/10
                              </span>
                            </div>
                          </td>

                          {/* Delta */}
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[var(--text-secondary)] whitespace-nowrap">
                            {delta > 0
                              ? `A +${delta.toFixed(1)}`
                              : delta < 0
                              ? `B +${Math.abs(delta).toFixed(1)}`
                              : '0.0'}
                          </td>

                          <td className="py-3.5 pl-4 text-[var(--text-secondary)]">
                            {row.comment}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Forces & Recommandation (si un arbitrage IA a également été exécuté) */}
              {comparisonResult?.comparisonAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      Forces de {comparisonResult.modelAName}
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      {(comparisonResult.comparisonAnalysis.modelAStrengths || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      Forces de {comparisonResult.modelBName}
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      {(comparisonResult.comparisonAnalysis.modelBStrengths || []).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-main)]">
                      Recommandation d’amélioration du prompt
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {comparisonResult.comparisonAnalysis.promptImprovementTip}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* VUES 1 & 2 : GRILLE 2 COLONNES (PROMPT À GAUCHE & 8 DIMENSIONS À DROITE) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Zone de saisie du prompt à évaluer */}
          <div className="lg:col-span-5 space-y-4 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-display font-semibold text-[var(--text-main)]">
                Prompt soumis à l’analyse
              </span>
              <span className="text-xs font-mono tabular-nums text-[var(--text-secondary)]">
                {evaluatorInput.trim() ? evaluatorInput.trim().split(/\s+/).length : 0} mots
              </span>
            </div>

            <textarea
              rows={16}
              value={evaluatorInput}
              onChange={(e) => setEvaluatorInput(e.target.value)}
              placeholder="Collez ou rédigez un prompt ici. L'analyse structurelle locale se calcule instantanément ; cliquez sur « Audit IA 8 dimensions » ou « Comparer 2 modèles »."
              className="w-full p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
            />

            <div className="p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--text-secondary)]">
              <div className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Distinction méthodologique (Section 15)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1. <strong>Analyse structurelle</strong> : vérifie de manière déterministe la présence de sections, balises, contraintes et critères de validation.
                <br />
                2. <strong>Évaluation par modèle d’IA</strong> : examine la cohérence logique et la précision sémantique.
                <br />
                3. <strong>Comparaison & Scoring (0–10)</strong> : confronte les réponses de deux modèles sur la pertinence, la concision et le respect des contraintes.
              </p>
            </div>

            <button
              onClick={() => openPromptInOptimizer(evaluatorInput)}
              disabled={!evaluatorInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 text-center"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
              <span>Envoyer dans l’Optimiseur pour appliquer les recommandations</span>
            </button>
          </div>

          {/* Résultats sur les 8 dimensions */}
          <div className="lg:col-span-7 space-y-5">
            {!currentResult ? (
              <div className="p-16 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-sm text-[var(--text-secondary)]">
                Saisissez ou chargez un prompt à gauche pour afficher le diagnostic détaillé sur les 8 dimensions.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong>Méthode de calcul :</strong> {currentResult.methodologyNote}
                  </p>
                </div>

                {/* Les 8 dimensions détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentResult.dimensions.map((dim) => (
                    <div
                      key={dim.key}
                      className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-display font-semibold text-[var(--text-main)]">
                          {dim.label}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                          <span className="text-[var(--text-secondary)]">
                            {getStatusLabel(dim.status)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-bold text-[var(--text-main)]">
                            {dim.score}/100
                          </span>
                        </div>
                      </div>

                      {/* Barre de progression sobre */}
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--accent-primary)] transition-all duration-150"
                          style={{ width: `${Math.min(100, Math.max(5, dim.score))}%` }}
                        />
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        <strong>Constat :</strong> {dim.explanation}
                      </p>
                      <p className="text-xs text-[var(--text-main)] leading-relaxed">
                        <strong>Recommandation :</strong> {dim.recommendation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Synthèse Points forts & Points à renforcer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[var(--status-success)]" />
                      <span>Points forts relevés</span>
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      {currentResult.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[var(--status-warning)]" />
                      <span>Priorités d’amélioration</span>
                    </div>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 list-disc list-inside">
                      {currentResult.criticalGaps.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
