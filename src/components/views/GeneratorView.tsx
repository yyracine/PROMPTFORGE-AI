import React, { useState, useMemo, useRef } from 'react';
import {
  Sparkles,
  HelpCircle,
  Copy,
  Save,
  SlidersHorizontal,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  GitBranchPlus,
  Folder,
  Wand2,
  Plus,
  CheckCircle2,
  Cpu,
  Zap,
  Info,
  BarChart2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  PROFESSIONAL_DOMAINS,
  TARGET_PROFILES,
} from '../../lib/constants';
import { getContextualSuggestionsForCategory } from '../../lib/contextualAutocomplete';
import { TokenCounterBar } from '../common/TokenCounterBar';
import {
  countTokensApproximate,
  formatUsdCost,
} from '../../lib/tokenEstimator';
import {
  ClarificationQuestion,
  DetailLevel,
  GenerationMode,
  OutputFormat,
  ProfessionalDomain,
  TargetProfileId,
} from '../../types/promptforge';

export const GeneratorView: React.FC = () => {
  const {
    generatorForm,
    setGeneratorForm,
    generatedOutput,
    setGeneratedOutput,
    generatedTitle,
    setGeneratedTitle,
    generatedAssumptions,
    setGeneratedAssumptions,
    categories,
    tags,
    refreshAllData,
    openPromptInOptimizer,
    openPromptInEvaluator,
    focusMode,
    setFocusMode,
    addToast,
  } = useWorkspace();

  const needTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClarifying, setIsClarifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat-dev');
  const [tagsInput, setTagsInput] = useState<string>('prompt-engineering');

  // Smart autocomplete state while typing in needDescription
  const [activeAutocompleteIndex, setActiveAutocompleteIndex] = useState<number>(0);
  const [isTextareaFocused, setIsTextareaFocused] = useState<boolean>(false);
  const [showGeminiTokenModal, setShowGeminiTokenModal] = useState<boolean>(false);

  // Real-time token calculation for standard Gemini models (Flash & Pro)
  const geminiTokenMetrics = useMemo(() => {
    const rawText = generatedOutput || '';
    const tokens = countTokensApproximate(rawText);
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    const chars = rawText.length;

    // Standard Gemini Models specifications (Google AI Studio / Gemini API)
    const geminiModels = [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        contextLimit: 1_000_000,
        contextLabel: '1M',
        inputPricePerMillion: 0.15,
        outputPricePerMillion: 0.60,
        speedScore: 'Ultra-rapide (~180 tok/s)',
        recommendedFor: 'Tâches courantes, prompts réactifs, agents',
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        contextLimit: 1_000_000,
        contextLabel: '1M',
        inputPricePerMillion: 0.075,
        outputPricePerMillion: 0.30,
        speedScore: 'Très rapide (~160 tok/s)',
        recommendedFor: 'Haut volume, latence critique, batch',
      },
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        contextLimit: 2_000_000,
        contextLabel: '2M',
        inputPricePerMillion: 1.25,
        outputPricePerMillion: 5.00,
        speedScore: 'Raisonnement profond (~65 tok/s)',
        recommendedFor: 'Code complexe, architecture, longs documents',
      },
    ];

    const modelEstimates = geminiModels.map((m) => {
      const usagePercent = Math.min(100, (tokens / m.contextLimit) * 100);
      const inputCost = (tokens / 1_000_000) * m.inputPricePerMillion;
      const typicalOutputCost = (800 / 1_000_000) * m.outputPricePerMillion;
      return {
        ...m,
        usagePercent,
        inputCost,
        typicalTotalCost: inputCost + typicalOutputCost,
        remainingTokens: Math.max(0, m.contextLimit - tokens),
      };
    });

    return {
      tokens,
      words,
      chars,
      modelEstimates,
    };
  }, [generatedOutput]);

  const updateField = <K extends keyof typeof generatorForm>(
    field: K,
    value: (typeof generatorForm)[K]
  ) => {
    setGeneratorForm((prev) => ({ ...prev, [field]: value }));
  };

  // Contextual profile based on the selected category (and custom user tags)
  const contextualProfile = useMemo(() => {
    const base = getContextualSuggestionsForCategory(
      selectedCategoryId,
      categories,
      generatorForm.domain
    );
    // Merge any custom tags from the user's SQLite library to enrich contextual keywords
    const userTagNames = tags.map((t) => t.name).filter(Boolean);
    const mergedKeywords = Array.from(new Set([...base.keywords, ...userTagNames]));
    return {
      ...base,
      keywords: mergedKeywords,
    };
  }, [selectedCategoryId, categories, generatorForm.domain, tags]);

  // Extract the current word fragment being typed at the end of needDescription
  const currentTypingToken = useMemo(() => {
    const text = generatorForm.needDescription;
    if (!text) return '';
    const match = text.match(/([a-zA-ZÀ-ÿ0-9_-]{2,})$/);
    return match ? match[1] : '';
  }, [generatorForm.needDescription]);

  // Normalize string for accent-insensitive autocomplete matching
  const normalizeStr = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  // Live autocomplete matches when typing a word of >= 2 characters
  const liveAutocompleteMatches = useMemo(() => {
    if (!isTextareaFocused || currentTypingToken.length < 2) return [];
    const query = normalizeStr(currentTypingToken);
    const currentTextNorm = normalizeStr(generatorForm.needDescription);

    return contextualProfile.keywords
      .filter((kw) => {
        const kwNorm = normalizeStr(kw);
        // Suggest if keyword contains the typed fragment and isn't already fully present right at the end
        return kwNorm.includes(query) && kwNorm !== query && !currentTextNorm.endsWith(kwNorm);
      })
      .slice(0, 6);
  }, [
    isTextareaFocused,
    currentTypingToken,
    contextualProfile.keywords,
    generatorForm.needDescription,
  ]);

  // Handle category selection and optionally sync domain/role to match category context
  const handleSelectCategory = (newCatId: string) => {
    setSelectedCategoryId(newCatId);
    const profile = getContextualSuggestionsForCategory(
      newCatId,
      categories,
      generatorForm.domain
    );
    setGeneratorForm((prev) => ({
      ...prev,
      domain: profile.recommendedDomain,
      aiRole: profile.recommendedRole,
    }));
  };

  // Apply a live autocomplete suggestion (replaces the partial word being typed)
  const applyLiveAutocomplete = (suggestion: string) => {
    const text = generatorForm.needDescription;
    if (currentTypingToken && text.endsWith(currentTypingToken)) {
      const prefix = text.slice(0, text.length - currentTypingToken.length);
      updateField('needDescription', `${prefix}${suggestion} `);
    } else {
      const separator = text && !text.endsWith(' ') && !text.endsWith('\n') ? ', ' : '';
      updateField('needDescription', `${text}${separator}${suggestion}`);
    }
    setActiveAutocompleteIndex(0);
    needTextareaRef.current?.focus();
  };

  // Insert a contextual keyword chip into the need description
  const insertContextualKeyword = (keyword: string) => {
    const current = generatorForm.needDescription.trim();
    if (!current) {
      const starter =
        contextualProfile.objectiveStarters[0] ||
        'Concevoir un prompt structuré intégrant : ';
      updateField('needDescription', `${starter}${keyword}`);
    } else {
      const needsSeparator = !/[,.;:\n-]\s*$/.test(current);
      updateField(
        'needDescription',
        `${current}${needsSeparator ? ' — inclure : ' : ' '}${keyword}`
      );
    }
    needTextareaRef.current?.focus();
  };

  // Insert a contextual constraint snippet
  const insertConstraintSnippet = (snippet: string) => {
    const current = generatorForm.constraints.trim();
    if (current.includes(snippet)) return;
    updateField('constraints', current ? `${current}\n- ${snippet}` : `- ${snippet}`);
    setShowAdvanced(true);
    addToast('success', 'Contrainte métier ajoutée aux paramètres avancés.');
  };

  // Assistant de clarification
  const handleAskClarifications = async () => {
    if (!generatorForm.needDescription.trim()) {
      addToast('warning', 'Veuillez saisir une description du besoin avant de lancer la clarification.');
      return;
    }

    setIsClarifying(true);
    try {
      const res = await fetch('/api/ai/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatorForm),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Impossible de générer les questions de clarification.');
        return;
      }
      setClarificationQuestions(data.questions || []);
      if (Array.isArray(data.detectedAssumptions)) {
        setGeneratedAssumptions(data.detectedAssumptions);
      }
      addToast(
        'success',
        `${(data.questions || []).length} questions ciblées proposées. Vous pouvez y répondre ou générer directement.`
      );
    } catch (err: any) {
      addToast('error', `Erreur réseau : ${err.message}`);
    } finally {
      setIsClarifying(false);
    }
  };

  // Génération du prompt structuré
  const handleGenerate = async (variantHint?: string) => {
    if (!generatorForm.needDescription.trim()) {
      addToast('warning', 'Veuillez décrire votre besoin (même en une phrase courte).');
      return;
    }

    setIsGenerating(true);
    try {
      const payload = {
        ...generatorForm,
        additionalInfo: variantHint
          ? `${generatorForm.additionalInfo}\nVariante demandée : ${variantHint}`
          : generatorForm.additionalInfo,
      };
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Échec de la génération du prompt.');
        return;
      }

      setGeneratedOutput(data.generatedPrompt || '');
      if (data.suggestedTitle && !generatedTitle) {
        setGeneratedTitle(data.suggestedTitle);
      }
      if (Array.isArray(data.assumptionsAdded)) {
        setGeneratedAssumptions(data.assumptionsAdded);
      }
      await refreshAllData();
      addToast('success', `Prompt généré en mode ${generatorForm.generationMode} (${data.durationMs} ms).`);
    } catch (err: any) {
      addToast('error', `Erreur lors de la génération : ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Enregistrer dans SQLite
  const handleSaveToLibrary = async () => {
    if (!generatedOutput.trim()) {
      addToast('warning', 'Aucun prompt à enregistrer.');
      return;
    }

    const finalTitle =
      generatedTitle.trim() ||
      `Prompt ${generatorForm.domain} — ${new Date().toLocaleDateString('fr-FR')}`;

    setIsSaving(true);
    try {
      const profileObj =
        TARGET_PROFILES.find((p) => p.id === generatorForm.targetProfile) || TARGET_PROFILES[0];
      const tagList = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: generatorForm.objective || generatorForm.needDescription.slice(0, 140),
          original_input: generatorForm.needDescription,
          generated_content: generatedOutput,
          domain: generatorForm.domain,
          task_type: 'generation',
          target_provider: profileObj.provider,
          target_model: generatorForm.targetProfile,
          output_format: generatorForm.outputFormat,
          category_id: selectedCategoryId,
          tags: tagList,
          mode_used: generatorForm.generationMode,
          change_summary: `Généré en mode ${generatorForm.generationMode}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Impossible d’enregistrer le prompt.');
        return;
      }

      await refreshAllData();
      addToast('success', `Prompt « ${finalTitle} » enregistré dans la bibliothèque SQLite.`);
    } catch (err: any) {
      addToast('error', `Erreur lors de l'enregistrement : ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Export individuel (TXT, MD, JSON)
  const handleExport = (format: 'txt' | 'md' | 'json') => {
    if (!generatedOutput.trim()) return;
    const slug = (generatedTitle || 'prompt-forge')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let content = generatedOutput;
    let mime = 'text/plain;charset=utf-8';
    let ext = 'txt';

    if (format === 'md') {
      ext = 'md';
      mime = 'text/markdown;charset=utf-8';
      content = `# ${generatedTitle || 'Prompt Généré'}\n\n- Domaine : ${generatorForm.domain}\n- Modèle cible : ${generatorForm.targetProfile}\n- Mode : ${generatorForm.generationMode}\n\n---\n\n${generatedOutput}`;
    } else if (format === 'json') {
      ext = 'json';
      mime = 'application/json;charset=utf-8';
      content = JSON.stringify(
        {
          title: generatedTitle || 'Prompt Généré',
          domain: generatorForm.domain,
          target_model: generatorForm.targetProfile,
          output_format: generatorForm.outputFormat,
          original_input: generatorForm.needDescription,
          generated_content: generatedOutput,
          assumptions: generatedAssumptions,
          exported_at: new Date().toISOString(),
        },
        null,
        2
      );
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug || 'prompt'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `Fichier exporté au format .${ext.toUpperCase()}.`);
  };

  const currentNeedNorm = normalizeStr(generatorForm.needDescription);

  return (
    <div className={`space-y-6 transition-all duration-200 ${focusMode ? 'p-6 max-w-full' : 'p-8 max-w-7xl mx-auto'}`}>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
              Générateur de prompts structurés
            </h1>
            {focusMode && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30 animate-pulse">
                Mode Focus actif
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {focusMode
              ? 'Espace de travail épuré : sidebar et en-tête masqués pour une concentration totale.'
              : 'Transformez une idée simple en instructions structurées avec auto-complétion contextuelle selon la catégorie métier.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bouton Mode Focus */}
          <button
            type="button"
            onClick={() => {
              const next = !focusMode;
              setFocusMode(next);
              addToast(
                'success',
                next
                  ? 'Mode Focus activé : sidebar et barres masquées pour maximiser la rédaction.'
                  : 'Mode standard rétabli.'
              );
            }}
            title={focusMode ? 'Quitter le Mode Focus (afficher la sidebar)' : 'Activer le Mode Focus (masquer la sidebar et maximiser l’espace)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              focusMode
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-primary)]'
            }`}
          >
            {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />}
            <span>{focusMode ? 'Quitter le Focus' : 'Mode Focus'}</span>
          </button>

          {/* Sélecteur de Mode : Rapide / Professionnel / Expert */}
          <div
            className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] shrink-0"
            role="group"
            aria-label="Mode de génération"
          >
            {(
              [
                { id: 'rapide', label: 'Mode Rapide' },
                { id: 'professionnel', label: 'Mode Professionnel' },
                { id: 'expert', label: 'Mode Expert' },
              ] as { id: GenerationMode; label: string }[]
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => updateField('generationMode', m.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  generatorForm.generationMode === m.id
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille 2 colonnes : Formulaire (gauche) & Panneau d'édition du résultat (droite) */}
      <div className={`grid grid-cols-1 ${focusMode ? 'lg:grid-cols-12 gap-6' : 'lg:grid-cols-12 gap-8'} items-start`}>
        {/* Colonne gauche : Formulaire de création (5 cols ou 4 cols en focus) */}
        <div className={`${focusMode ? 'lg:col-span-5' : 'lg:col-span-5'} space-y-5 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]`}>
          {/* Sélecteur de Catégorie / Dossier métier (pilote l'auto-complétion intelligente) */}
          <div className="space-y-2 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Catégorie métier (pilote l’auto-complétion)</span>
              </label>
              <span className="text-[11px] text-[var(--text-secondary)]">
                {contextualProfile.keywords.length} mots-clés actifs
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description du besoin + Auto-complétion intelligente en temps réel */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Description du besoin (même très courte) *
              </label>
              <span className="text-[11px] text-[var(--accent-primary)] flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                <span>Auto-complétion : {contextualProfile.categoryLabel}</span>
              </span>
            </div>

            <div className="relative">
              <textarea
                ref={needTextareaRef}
                rows={4}
                value={generatorForm.needDescription}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => {
                  // Delay hiding so clicking a suggestion item registers
                  setTimeout(() => setIsTextareaFocused(false), 180);
                }}
                onChange={(e) => {
                  updateField('needDescription', e.target.value);
                  setActiveAutocompleteIndex(0);
                }}
                onKeyDown={(e) => {
                  if (liveAutocompleteMatches.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setActiveAutocompleteIndex(
                        (prev) => (prev + 1) % liveAutocompleteMatches.length
                      );
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setActiveAutocompleteIndex(
                        (prev) =>
                          (prev - 1 + liveAutocompleteMatches.length) %
                          liveAutocompleteMatches.length
                      );
                    } else if (e.key === 'Tab' || (e.key === 'Enter' && e.ctrlKey)) {
                      e.preventDefault();
                      applyLiveAutocomplete(
                        liveAutocompleteMatches[activeAutocompleteIndex] ||
                          liveAutocompleteMatches[0]
                      );
                    }
                  }
                }}
                placeholder={`Ex (${contextualProfile.categoryLabel}) : ${
                  contextualProfile.objectiveStarters[0] || 'Décrivez votre besoin...'
                }${contextualProfile.keywords.slice(0, 2).join(', ')}...`}
                className="w-full p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />

              {/* Menu déroulant d'auto-complétion en direct pendant la frappe */}
              {liveAutocompleteMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-xl bg-[var(--bg-surface)] border border-[var(--accent-primary)] shadow-lg overflow-hidden">
                  <div className="px-3 py-1.5 bg-[var(--bg-surface-secondary)] border-b border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                    <span className="font-medium text-[var(--text-main)]">
                      Suggestions pour « {currentTypingToken} » ({contextualProfile.categoryLabel})
                    </span>
                    <span className="font-mono">Tab ou Clic pour compléter</span>
                  </div>
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {liveAutocompleteMatches.map((match, idx) => (
                      <button
                        key={match}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyLiveAutocomplete(match);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          idx === activeAutocompleteIndex
                            ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-semibold'
                            : 'text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]'
                        }`}
                      >
                        <span>{match}</span>
                        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                          Insérer ↵
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Barre de mots-clés contextuels suggérés selon la catégorie sélectionnée */}
            <div className="p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                  <Wand2 className="w-3 h-3 text-[var(--accent-primary)]" />
                  <span>
                    Mots-clés contextuels ({contextualProfile.categoryLabel}) :
                  </span>
                </span>
                <span className="text-[var(--text-secondary)]">
                  Cliquez pour enrichir le besoin
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {contextualProfile.keywords.slice(0, 12).map((kw) => {
                  const alreadyIncluded = currentNeedNorm.includes(normalizeStr(kw));
                  return (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => insertContextualKeyword(kw)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                        alreadyIncluded
                          ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40 font-semibold'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Plus className="w-2.5 h-2.5 shrink-0" />
                      <span>{kw}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <TokenCounterBar
              text={[
                generatorForm.needDescription,
                generatorForm.aiRole,
                generatorForm.objective,
                generatorForm.context,
                generatorForm.constraints,
                generatorForm.successCriteria,
              ]
                .filter(Boolean)
                .join('\n')}
              targetProfile={generatorForm.targetProfile}
              label="Spécification d'entrée"
            />

            {/* Bandeau actif lorsque la demande concerne une Landing Page / CRO */}
            {(selectedCategoryId === 'cat-landing' ||
              generatorForm.domain === 'Landing Pages & Conversion (CRO)' ||
              /(landing\s*page|page\s*d['’]atterrissage|page\s*de\s*vente|above[- ]the[- ]fold|hero\s*section|taux\s*de\s*conversion|\bcro\b)/i.test(
                `${generatorForm.needDescription} ${generatorForm.objective}`
              )) && (
              <div className="p-3 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Charte d’Amélioration Landing Page & CRO activée (10 règles injectées)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const rulesSummary =
                        '- Top Bar 3 zones + Hero Above-the-Fold (< 5s) + CTA orienté résultat avec réassurance\n- Séquence : Avant/Après -> Grille Bento (Mécanisme -> Bénéfice chiffré) -> Preuves en tabular-nums -> Pricing -> FAQ (5-6 objections) -> Capture validée\n- Design 60-30-10, typographie 2+1, zéro jargon creux, zéro boîte imbriquée, zéro pilule statique, SEO & JSON-LD';
                      const cur = generatorForm.constraints.trim();
                      if (!cur.includes('Top Bar 3 zones')) {
                        updateField('constraints', cur ? `${cur}\n${rulesSummary}` : rulesSummary);
                        setShowAdvanced(true);
                        addToast('success', 'Les 10 règles d’amélioration Landing Page ont été ajoutées aux contraintes.');
                      } else {
                        addToast('info', 'Les règles Landing Page figurent déjà dans vos contraintes.');
                      }
                    }}
                    className="px-2 py-1 rounded bg-[var(--accent-primary)] text-white text-[10px] font-medium whitespace-nowrap shrink-0 hover:opacity-90"
                  >
                    + Injecter dans les contraintes
                  </button>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Le moteur applique automatiquement vos améliorations Landing Page : Hero &lt; 5s, chaîne Fonctionnalité → Mécanisme → Bénéfice chiffré, comparatif Avant/Après, grille Bento asymétrique, preuves en <code className="font-mono">tabular-nums</code>, Pricing, FAQ anti-objections et discipline Anti-Slop (60-30-10).
                </p>
              </div>
            )}
          </div>

          {/* Domaine & Modèle Cible */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Domaine professionnel
              </label>
              <select
                value={generatorForm.domain}
                onChange={(e) => updateField('domain', e.target.value as ProfessionalDomain)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {PROFESSIONAL_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Modèle / Agent cible
              </label>
              <select
                value={generatorForm.targetProfile}
                onChange={(e) => updateField('targetProfile', e.target.value as TargetProfileId)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {TARGET_PROFILES.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Niveau de détail & Format de sortie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Niveau de détail
              </label>
              <select
                value={generatorForm.detailLevel}
                onChange={(e) => updateField('detailLevel', e.target.value as DetailLevel)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="concis">Concis et direct</option>
                <option value="standard">Standard équilibré</option>
                <option value="exhaustif">Exhaustif et chirurgical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Format de structuration
              </label>
              <select
                value={generatorForm.outputFormat}
                onChange={(e) => updateField('outputFormat', e.target.value as OutputFormat)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                <option value="markdown">Markdown structuré (#, ##)</option>
                <option value="xml">Balises XML (&lt;role&gt;, &lt;context&gt;)</option>
                <option value="json">Spécification JSON</option>
                <option value="texte">Texte continu structuré</option>
              </select>
            </div>
          </div>

          {/* Rôle et suggestions de rôles selon la catégorie */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              Rôle que doit adopter l’IA
            </label>
            <input
              type="text"
              value={generatorForm.aiRole}
              onChange={(e) => updateField('aiRole', e.target.value)}
              placeholder="Ex: Architecte Python/Django Senior & Expert Sécurité"
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] text-[var(--text-secondary)]">Rôles suggérés :</span>
              {contextualProfile.roleSuggestions.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => updateField('aiRole', role)}
                  className="text-[11px] text-[var(--accent-primary)] hover:underline text-left"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton dépliant Paramètres avancés */}
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] hover:opacity-90 transition-opacity"
          >
            <span>Paramètres avancés (Contexte, Contraintes, Critères de réussite)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Objectif précis attendu
                </label>
                <input
                  type="text"
                  value={generatorForm.objective}
                  onChange={(e) => updateField('objective', e.target.value)}
                  placeholder="Quel est le livrable final exact ?"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Contexte technique ou métier
                </label>
                <textarea
                  rows={2}
                  value={generatorForm.context}
                  onChange={(e) => updateField('context', e.target.value)}
                  placeholder="Environnement Windows, stack existante, public cible..."
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Contraintes non négociables
                </label>
                <textarea
                  rows={2}
                  value={generatorForm.constraints}
                  onChange={(e) => updateField('constraints', e.target.value)}
                  placeholder="Ex: Aucun Docker, pas de mocks, code complet..."
                  className="w-full p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {contextualProfile.constraintSnippets.map((snippet, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertConstraintSnippet(snippet)}
                      className="px-2 py-0.5 rounded bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-main)] text-left"
                    >
                      + {snippet}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Critères de réussite et de validation
                </label>
                <input
                  type="text"
                  value={generatorForm.successCriteria}
                  onChange={(e) => updateField('successCriteria', e.target.value)}
                  placeholder="Comment vérifier que la réponse est valide ?"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--text-secondary)]">
                  Ton et style
                </label>
                <input
                  type="text"
                  value={generatorForm.toneAndStyle}
                  onChange={(e) => updateField('toneAndStyle', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm text-[var(--text-main)]"
                />
              </div>
            </div>
          )}

          {/* Assistant de Clarification */}
          {clarificationQuestions.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-main)]">
                  Questions ciblées de clarification (facultatives)
                </span>
                <button
                  onClick={() => setClarificationQuestions([])}
                  className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                >
                  Masquer
                </button>
              </div>
              {clarificationQuestions.map((q) => (
                <div key={q.id} className="space-y-1">
                  <label className="block text-xs font-medium text-[var(--text-main)]">
                    {q.question}
                  </label>
                  <input
                    type="text"
                    value={generatorForm.clarificationAnswers[q.question] || ''}
                    onChange={(e) =>
                      setGeneratorForm((prev) => ({
                        ...prev,
                        clarificationAnswers: {
                          ...prev.clarificationAnswers,
                          [q.question]: e.target.value,
                        },
                      }))
                    }
                    placeholder={q.placeholder}
                    className="w-full px-2.5 py-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Avis de transmission au fournisseur externe */}
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            Confidentialité : votre texte est transmis au moteur Google Gemini configuré côté serveur uniquement lorsque vous cliquez sur « Générer » ou « Clarifier ».
          </p>

          {/* Boutons d'action du formulaire */}
          <div className="flex flex-wrap items-stretch gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAskClarifications}
              disabled={isClarifying || isGenerating}
              className="flex-1 min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] transition-colors disabled:opacity-50 text-center"
            >
              {isClarifying ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <HelpCircle className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
              )}
              <span>Clarifier le besoin</span>
            </button>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-sm font-medium transition-opacity disabled:opacity-50 text-center"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 shrink-0" />
              )}
              <span>{isGenerating ? 'Structuration...' : 'Générer le prompt'}</span>
            </button>
          </div>
        </div>

        {/* Colonne droite : Panneau d'édition du résultat (7 cols) */}
        <div className="lg:col-span-7 space-y-5 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]">
          {/* Barre d'outils du résultat */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex-1 min-w-[220px]">
              <input
                type="text"
                value={generatedTitle}
                onChange={(e) => setGeneratedTitle(e.target.value)}
                placeholder="Titre du prompt pour l'enregistrement..."
                className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm font-display font-semibold text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (!generatedOutput.trim()) return;
                  navigator.clipboard.writeText(generatedOutput);
                  addToast('success', 'Prompt copié dans le presse-papiers.');
                }}
                disabled={!generatedOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier</span>
              </button>

              <button
                onClick={() =>
                  handleGenerate('Proposer une variante structurée différemment avec un angle plus direct')
                }
                disabled={!generatorForm.needDescription.trim() || isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <GitBranchPlus className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Créer une variante</span>
              </button>

              <button
                onClick={() => openPromptInOptimizer(generatedOutput, generatedTitle)}
                disabled={!generatedOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Optimiser</span>
              </button>

              <button
                onClick={() => openPromptInEvaluator(generatedOutput)}
                disabled={!generatedOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Évaluer</span>
              </button>
            </div>
          </div>

          {/* Éditeur principal du prompt généré */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Éditeur de prompt (modifiable directement)</span>
              <span className="font-mono tabular-nums">
                {generatedOutput.trim() ? generatedOutput.trim().split(/\s+/).length : 0} mots ·{' '}
                {generatedOutput.length} caractères
              </span>
            </div>

            <textarea
              rows={18}
              value={generatedOutput}
              onChange={(e) => setGeneratedOutput(e.target.value)}
              placeholder="Le prompt structuré apparaîtra ici. Vous pouvez également rédiger ou coller un prompt directement pour l'éditer et l'enregistrer dans votre bibliothèque SQLite."
              className="w-full p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-sm leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
            />

            <TokenCounterBar
              text={generatedOutput}
              targetProfile={generatorForm.targetProfile}
              label="Prompt final généré"
            />

            {/* Outil d'estimation des Tokens en temps réel basé sur les modèles Gemini Standards */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5">
                      <span>Calculateur de Tokens en Temps Réel — Modèles Gemini Standards</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        BPE / SentencePiece
                      </span>
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Estimation précise selon les spécifications officielles de Google AI Studio & Gemini API
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                    ~{geminiTokenMetrics.tokens.toLocaleString('fr-FR')} tokens
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowGeminiTokenModal((prev) => !prev)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
                  >
                    <BarChart2 className="w-3 h-3 text-indigo-400" />
                    <span>Détails & Tarifs</span>
                  </button>
                </div>
              </div>

              {/* Cartes comparatives directes des 3 modèles Gemini standards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {geminiTokenMetrics.modelEstimates.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5 hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--text-main)] truncate" title={m.name}>
                        {m.name}
                      </span>
                      <span className="font-mono text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                        {m.contextLabel}
                      </span>
                    </div>

                    {/* Jauge d'utilisation du contexte Gemini (1M ou 2M) */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-200"
                          style={{
                            width: `${
                              geminiTokenMetrics.tokens === 0
                                ? 0
                                : Math.max(1.5, Math.min(100, m.usagePercent))
                            }%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono tabular-nums text-[var(--text-secondary)]">
                        <span>
                          {m.usagePercent < 0.01 && geminiTokenMetrics.tokens > 0
                            ? '< 0.01%'
                            : `${m.usagePercent.toFixed(2)}%`}
                        </span>
                        <span>{formatUsdCost(m.inputCost)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hypothèses explicites ajoutées par le moteur */}
          {generatedAssumptions.length > 0 && (
            <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-semibold text-[var(--text-main)]">
                Hypothèses explicites retenues par le moteur :
              </div>
              <ul className="space-y-1 text-xs text-[var(--text-secondary)] list-disc list-inside">
                {generatedAssumptions.map((assumption, idx) => (
                  <li key={idx}>{assumption}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Barre de sauvegarde en bibliothèque & Export */}
          <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategoryId}
                onChange={(e) => handleSelectCategory(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    Dossier : {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags séparés par virgule..."
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] w-48"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleExport('md')}
                  disabled={!generatedOutput.trim()}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
                >
                  .MD
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  disabled={!generatedOutput.trim()}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
                >
                  .TXT
                </button>
                <button
                  onClick={() => handleExport('json')}
                  disabled={!generatedOutput.trim()}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-40"
                >
                  .JSON
                </button>
              </div>

              <button
                onClick={handleSaveToLibrary}
                disabled={!generatedOutput.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-xs font-medium transition-opacity disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer en bibliothèque'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Détails & Métriques des Tokens pour les Modèles Gemini Standards */}
      {showGeminiTokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-gemini-token-title"
          >
            {/* En-tête de la modale */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between gap-4 bg-[var(--bg-surface-secondary)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="modal-gemini-token-title" className="text-base font-display font-bold text-[var(--text-main)]">
                    Analyse des Tokens — Modèles Google Gemini Standards
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Calcul en temps réel sur le tokenizer BPE/SentencePiece de Google AI Studio
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGeminiTokenModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Corps de la modale */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[var(--text-main)]">
              {/* Résumé global */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-center">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] uppercase">Tokens Estimés</div>
                  <div className="text-lg font-bold text-indigo-400">
                    ~{geminiTokenMetrics.tokens.toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="space-y-0.5 border-x border-[var(--border-subtle)]">
                  <div className="text-[11px] text-[var(--text-secondary)] uppercase">Mots</div>
                  <div className="text-lg font-bold text-[var(--text-main)]">
                    {geminiTokenMetrics.words.toLocaleString('fr-FR')}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] uppercase">Caractères</div>
                  <div className="text-lg font-bold text-[var(--text-main)]">
                    {geminiTokenMetrics.chars.toLocaleString('fr-FR')}
                  </div>
                </div>
              </div>

              {/* Tableau comparatif des 3 modèles */}
              <div className="space-y-3">
                <h4 className="font-semibold text-xs text-[var(--text-main)] uppercase tracking-wider">
                  Comparaison des Modèles Gemini Standards
                </h4>

                <div className="space-y-3">
                  {geminiTokenMetrics.modelEstimates.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--text-main)]">{m.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Fenêtre : {m.contextLabel} tokens
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                          {m.speedScore}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-secondary)]">
                          <span>
                            Utilisation fenêtre ({geminiTokenMetrics.tokens.toLocaleString('fr-FR')} /{' '}
                            {m.contextLimit.toLocaleString('fr-FR')} tok) :
                          </span>
                          <span className="font-bold text-indigo-400">
                            {m.usagePercent < 0.01 && geminiTokenMetrics.tokens > 0
                              ? '< 0.01 %'
                              : `${m.usagePercent.toFixed(3)} %`}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{
                              width: `${Math.max(1, Math.min(100, m.usagePercent))}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
                        <span>{m.recommendedFor}</span>
                        <span className="font-mono tabular-nums font-semibold text-[var(--text-main)]">
                          Coût entrée : {formatUsdCost(m.inputCost)} (${m.inputPricePerMillion}/1M)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Règle et astuce d'optimisation */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-300/90 leading-relaxed">
                  <strong>Règle d'or de tokenisation Gemini :</strong> Le français et le code utilisent en moyenne 1,3 à 1,8 token par mot en raison de la segmentation sous-lexicale des caractères accentués et balises syntaxiques. Grâce à la fenêtre contextuelle native de <strong>1 à 2 millions de tokens</strong> des modèles Gemini, ce prompt consomme moins de <strong>0,5%</strong> de la capacité totale, laissant un espace immense pour la réponse ou les documents joints.
                </p>
              </div>
            </div>

            {/* Pied de page */}
            <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex justify-end shrink-0">
              <button
                onClick={() => setShowGeminiTokenModal(false)}
                className="px-4 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs text-[var(--text-main)] transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
