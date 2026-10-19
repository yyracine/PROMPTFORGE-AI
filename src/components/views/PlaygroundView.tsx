import React, { useState } from 'react';
import {
  PlaySquare,
  Play,
  Plus,
  Trash2,
  Copy,
  Sliders,
  Layers,
  Sparkles,
  Loader2,
  Check,
  RotateCcw,
  Clock,
  FileText,
  Save,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TARGET_PROFILES } from '../../lib/constants';
import {
  PlaygroundVariant,
  PlaygroundExecutionBatchResult,
  TargetProfileId,
} from '../../types/promptforge';

const VARIANT_PALETTE = [
  { border: 'border-indigo-500/50', badge: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
  { border: 'border-purple-500/50', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { border: 'border-emerald-500/50', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { border: 'border-amber-500/50', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
];

export const PlaygroundView: React.FC = () => {
  const { prompts, openPromptInOptimizer, refreshAllData, addToast } = useWorkspace();

  const [targetModel, setTargetModel] = useState<TargetProfileId>('claude-3-7-sonnet');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(1000);
  const [commonContext, setCommonContext] = useState<string>('');

  // Variants list (starts with 2 pre-filled sample variants for instant testing)
  const [variants, setVariants] = useState<PlaygroundVariant[]>([
    {
      id: 'var-1',
      name: 'Variante A · Format Contrat P-R-I-E-F-V',
      systemInstruction: 'Adopte une structure contractuelle avec Persona, But, Instructions, Exemples et Auto-vérification.',
      promptText: `[P · PERSONA]\nTu es un Architecte Logiciel Senior.\n\n[R · BUT]\nCréer une fonction TypeScript propre pour valider un panier d'achats avec calcul des remises et TVA.\n\n[I · INSTRUCTIONS]\n- TypeScript strict avec types complets\n- Zéro dépendance externe\n- Gestion robuste des erreurs\n\n[F · FORMAT]\nCode TypeScript commenté avec exemples d'utilisation.`,
    },
    {
      id: 'var-2',
      name: 'Variante B · Raisonnement Pas à Pas (Chain-of-Thought)',
      systemInstruction: 'Pense étape par étape. Expose d abord ton raisonnement d architecture avant de fournir l implémentation finale.',
      promptText: `Tu es un ingénieur expert.\n\n<task>\nImplémente un module de calcul de panier d'achat e-commerce (TVA, remises promotionnelles, total TTC).\n</task>\n\n<instructions>\n1. Réfléchis étape par étape : structure de données, cas limites (quantités négatives, remises cumulées), et formule de calcul.\n2. Écris le code TypeScript robuste avec gestion des erreurs.\n</instructions>`,
    },
  ]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<PlaygroundExecutionBatchResult | null>(null);

  const handleAddVariant = () => {
    if (variants.length >= 4) {
      addToast('warning', 'Le Playground supporte jusqu à 4 variantes en parallèle pour un affichage optimal.');
      return;
    }
    const newIdx = variants.length + 1;
    const letter = String.fromCharCode(65 + variants.length);
    setVariants((prev) => [
      ...prev,
      {
        id: `var-${Date.now()}-${newIdx}`,
        name: `Variante ${letter} · Personnalisée`,
        systemInstruction: '',
        promptText: '',
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      addToast('warning', 'Au moins une variante est requise dans le Playground.');
      return;
    }
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, updates: Partial<PlaygroundVariant>) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
  };

  const handleLoadPromptIntoVariant = (variantId: string, promptId: string) => {
    const found = prompts.find((p) => p.id === promptId);
    if (!found) return;
    handleUpdateVariant(variantId, {
      name: found.title,
      promptText: found.generated_content,
    });
    addToast('success', `Prompt « ${found.title} » chargé dans la variante.`);
  };

  const handleRunAllVariants = async () => {
    const emptyVar = variants.find((v) => !v.promptText.trim());
    if (emptyVar) {
      addToast('warning', `Veuillez renseigner le prompt de la « ${emptyVar.name} » avant de lancer l exécution.`);
      return;
    }

    setIsRunning(true);
    setBatchResult(null);

    try {
      const res = await fetch('/api/ai/playground-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variants,
          targetModel,
          temperature,
          maxOutputTokens,
          commonContext,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Échec de l exécution dans le Playground.');
        return;
      }

      const data: PlaygroundExecutionBatchResult = await res.json();
      setBatchResult(data);
      addToast('success', `${data.results.length} variantes exécutées simultanément avec succès (${data.totalDurationMs} ms).`);
    } catch (err: any) {
      addToast('error', `Erreur Playground : ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', `${label} copié dans le presse-papiers.`);
  };

  const handleSaveVariantAsPrompt = async (vResult: { name: string; output: string; promptText: string }) => {
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Playground : ${vResult.name}`,
          description: `Généré via le Playground multi-variantes (modèle : ${targetModel})`,
          original_input: vResult.promptText,
          generated_content: vResult.output,
          domain: 'Développement logiciel',
          task_type: 'generation',
          target_provider: 'Google Gemini',
          target_model: targetModel,
          output_format: 'markdown',
          category_id: 'cat-dev',
          tags: ['playground', targetModel],
          mode_used: 'playground',
          change_summary: 'Sortie retenue du Playground multi-variantes',
        }),
      });

      if (res.ok) {
        await refreshAllData();
        addToast('success', `Résultat de « ${vResult.name} » enregistré en bibliothèque.`);
      } else {
        const err = await res.json();
        addToast('error', err.error || 'Erreur lors de l enregistrement.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)] flex items-center gap-2.5">
            <PlaySquare className="w-6 h-6 text-[var(--accent-primary)]" />
            <span>Prompt Playground Multi-Variantes</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Exécutez simultanément jusqu’à 4 variantes d’un même prompt avec des paramètres identiques et comparez les sorties côte à côte en temps réel.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleAddVariant}
            disabled={variants.length >= 4 || isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une variante ({variants.length}/4)</span>
          </button>

          <button
            type="button"
            onClick={handleRunAllVariants}
            disabled={isRunning || variants.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>{isRunning ? 'Exécution simultanée...' : `Lancer les ${variants.length} variantes`}</span>
          </button>
        </div>
      </div>

      {/* Barre des Paramètres Communs (Partagés entre toutes les variantes) */}
      <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Paramètres d exécution partagés (stricts & identiques pour chaque variante)</span>
          </span>
          <span className="text-[11px] font-mono text-[var(--text-secondary)]">
            Moteur : Gemini 3.8 Flash (Profil : {TARGET_PROFILES.find((p) => p.id === targetModel)?.name})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Modèle cible simulé */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Profil de modèle cible
            </label>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value as TargetProfileId)}
              className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              {TARGET_PROFILES.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.name} ({tp.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Température */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[var(--text-secondary)]">Température</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">{temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-surface-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between text-[9px] text-[var(--text-secondary)]">
              <span>0 (Déterministe)</span>
              <span>1 (Créatif)</span>
            </div>
          </div>

          {/* Max Output Tokens */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[var(--text-secondary)]">Tokens max sortie</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">{maxOutputTokens}</span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="100"
              value={maxOutputTokens}
              onChange={(e) => setMaxOutputTokens(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[var(--bg-surface-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between text-[9px] text-[var(--text-secondary)]">
              <span>200</span>
              <span>3000</span>
            </div>
          </div>

          {/* Context commun partagé facultatif */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Contexte ou Données partagées (optionnel)
            </label>
            <input
              type="text"
              value={commonContext}
              onChange={(e) => setCommonContext(e.target.value)}
              placeholder="Ex: Stack React+Tailwind, données clients, contraintes..."
              className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>
        </div>
      </div>

      {/* Grille des Variantes en Entrée (Colonnes Côte à Côte) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-semibold text-[var(--text-main)] uppercase tracking-wider">
            Variantes de Prompts à exécuter ({variants.length})
          </span>
          <span className="text-xs text-[var(--text-secondary)]">
            Personnalisez le libellé, l instruction système et le corps de chaque variante.
          </span>
        </div>

        <div
          className={`grid gap-4 ${
            variants.length === 1
              ? 'grid-cols-1'
              : variants.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : variants.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {variants.map((variant, idx) => {
            const palette = VARIANT_PALETTE[idx % VARIANT_PALETTE.length];
            return (
              <div
                key={variant.id}
                className={`p-4 rounded-xl bg-[var(--bg-surface)] border ${palette.border} flex flex-col justify-between space-y-3 shadow-xs`}
              >
                <div className="space-y-2.5">
                  {/* Titre & suppression */}
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleUpdateVariant(variant.id, { name: e.target.value })}
                      className="font-display font-bold text-xs text-[var(--text-main)] bg-transparent focus:outline-none focus:border-b focus:border-[var(--accent-primary)] flex-1 min-w-0"
                    />
                    <div className="flex items-center gap-1">
                      <select
                        onChange={(e) => {
                          if (e.target.value) handleLoadPromptIntoVariant(variant.id, e.target.value);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        title="Charger un prompt existant de votre bibliothèque dans cette variante"
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)] max-w-[90px] truncate"
                      >
                        <option value="" disabled>
                          Charger...
                        </option>
                        {prompts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(variant.id)}
                          title="Supprimer cette variante"
                          className="p-1 text-[var(--text-secondary)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Consigne Système Spécifique à la variante */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
                      Instruction Système (Optionnelle)
                    </label>
                    <input
                      type="text"
                      value={variant.systemInstruction || ''}
                      onChange={(e) => handleUpdateVariant(variant.id, { systemInstruction: e.target.value })}
                      placeholder="Ex: Sois direct, Pense pas à pas..."
                      className="w-full px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                    />
                  </div>

                  {/* Corps du Prompt */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)]">
                      <label className="font-semibold uppercase">Corps du Prompt</label>
                      <span className="font-mono">
                        {variant.promptText.trim() ? variant.promptText.trim().split(/\s+/).length : 0} mots
                      </span>
                    </div>
                    <textarea
                      rows={9}
                      value={variant.promptText}
                      onChange={(e) => handleUpdateVariant(variant.id, { promptText: e.target.value })}
                      placeholder="Rédigez la variante du prompt ici..."
                      className="w-full p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${palette.badge}`}>
                    {variant.name.slice(0, 15)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(variant.promptText, variant.name)}
                    disabled={!variant.promptText.trim()}
                    className="hover:text-[var(--text-main)] text-[10px] disabled:opacity-40"
                  >
                    Copier prompt
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RÉSULTATS D'EXÉCUTION CÔTE À CÔTE */}
      {batchResult && (
        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)] animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--text-main)]">
                  Résultats d exécution simultanée côte à côte
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  {batchResult.results.length} variantes comparées sous {batchResult.targetModel} — Temps total :{' '}
                  <span className="font-mono font-bold text-emerald-400">{batchResult.totalDurationMs} ms</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunAllVariants}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface)] text-xs text-[var(--text-main)] font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-tester</span>
              </button>
            </div>
          </div>

          {/* Grille des réponses côte à côte */}
          <div
            className={`grid gap-4 ${
              batchResult.results.length === 1
                ? 'grid-cols-1'
                : batchResult.results.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : batchResult.results.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {batchResult.results.map((res, idx) => {
              const palette = VARIANT_PALETTE[idx % VARIANT_PALETTE.length];
              return (
                <div
                  key={res.id}
                  className={`p-4 rounded-xl bg-[var(--bg-surface)] border ${palette.border} flex flex-col justify-between space-y-3 shadow-md`}
                >
                  <div className="space-y-2.5">
                    {/* En-tête de la variante résultat */}
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                      <span className="text-xs font-bold text-[var(--text-main)] truncate" title={res.name}>
                        {res.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" />
                          <span>{res.durationMs}ms</span>
                        </span>
                        <span className="font-bold text-[var(--text-main)]">{res.wordCount} mots</span>
                      </div>
                    </div>

                    {/* Zone de texte de la réponse */}
                    <div className="p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] min-h-[280px] max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap select-text">
                      {res.output}
                    </div>
                  </div>

                  {/* Boutons d'action pour cette variante */}
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(res.output, `Sortie de ${res.name}`)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPromptInOptimizer(res.promptText, res.name)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-surface-secondary)]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Optimiser</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveVariantAsPrompt(res)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--accent-primary)] text-white text-[11px] font-medium hover:opacity-90"
                    >
                      <Save className="w-3 h-3" />
                      <span>Sauvegarder</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
