import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Save,
  SlidersHorizontal,
  ShieldCheck,
  Loader2,
  Terminal,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  SOFTWARE_USE_CASES,
  TARGET_PROFILES,
  TEN_CODING_AGENT_RULES,
} from '../../lib/constants';
import { SoftwareUseCaseId, TargetProfileId } from '../../types/promptforge';

export const SoftwareDevView: React.FC = () => {
  const {
    softwareDevForm,
    setSoftwareDevForm,
    softwareDevOutput,
    setSoftwareDevOutput,
    softwareDevTitle,
    setSoftwareDevTitle,
    openPromptInOptimizer,
    openPromptInEvaluator,
    refreshAllData,
    addToast,
  } = useWorkspace();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const codingProfiles = TARGET_PROFILES;

  const handleSelectUseCase = (useCaseId: SoftwareUseCaseId) => {
    const found = SOFTWARE_USE_CASES.find((u) => u.id === useCaseId);
    if (!found) return;
    setSoftwareDevForm((prev) => ({
      ...prev,
      useCase: useCaseId,
      techStack: found.defaultStack,
      architecturePattern: found.defaultArchitecture,
    }));
  };

  const updateField = <K extends keyof typeof softwareDevForm>(
    field: K,
    value: (typeof softwareDevForm)[K]
  ) => {
    setSoftwareDevForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateDevPrompt = async () => {
    if (!softwareDevForm.projectObjective.trim()) {
      addToast(
        'warning',
        'Veuillez préciser l’objectif du projet ou de la fonctionnalité à développer.'
      );
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/software-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(softwareDevForm),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Échec de la génération du prompt logiciel.');
        return;
      }

      setSoftwareDevOutput(data.generatedPrompt || '');
      if (data.suggestedTitle && !softwareDevTitle) {
        setSoftwareDevTitle(data.suggestedTitle);
      }
      await refreshAllData();
      addToast(
        'success',
        `Spécification pour agent de programmation générée (${data.durationMs} ms).`
      );
    } catch (err: any) {
      addToast('error', `Erreur réseau : ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDevPrompt = async () => {
    if (!softwareDevOutput.trim()) return;
    const useCaseObj =
      SOFTWARE_USE_CASES.find((u) => u.id === softwareDevForm.useCase) ||
      SOFTWARE_USE_CASES[0];
    const finalTitle =
      softwareDevTitle.trim() ||
      `${useCaseObj.title} — ${softwareDevForm.projectTitle || 'Spécification'}`;

    setIsSaving(true);
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          description: softwareDevForm.projectObjective.slice(0, 160),
          original_input: softwareDevForm.projectObjective,
          generated_content: softwareDevOutput,
          domain: 'Développement logiciel',
          task_type: `software_${softwareDevForm.useCase}`,
          target_provider: 'Coding Assistant Profile',
          target_model: softwareDevForm.targetAssistant,
          output_format: 'markdown',
          category_id: 'cat-dev',
          tags: ['dev-logiciel', softwareDevForm.useCase, softwareDevForm.targetAssistant],
          mode_used: 'expert-dev',
          change_summary: `Généré via l'Atelier Développement Logiciel (${useCaseObj.title})`,
        }),
      });

      if (res.ok) {
        await refreshAllData();
        addToast('success', `Prompt logiciel « ${finalTitle} » enregistré dans SQLite.`);
      } else {
        const err = await res.json();
        addToast('error', err.error || 'Impossible d’enregistrer.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Module spécialisé en développement logiciel
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Concevez des instructions chirurgicales pour Claude Code, Cursor, OpenCode et assistants d’ingénierie.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowRulesModal((prev) => !prev)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] whitespace-nowrap shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>{showRulesModal ? 'Masquer les 10 règles d’or' : 'Voir les 10 règles pour agents'}</span>
          </button>
        </div>
      </div>

      {/* Affichage optionnel des 10 règles d'or pour assistants de programmation */}
      {showRulesModal && (
        <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5">
          <div className="text-xs font-display font-semibold text-[var(--text-main)]">
            Directives d’ingénierie injectées pour les assistants de programmation (Claude Code, Cursor, OpenCode) :
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
            {TEN_CODING_AGENT_RULES.map((rule, idx) => (
              <div key={idx} className="p-2 rounded bg-[var(--bg-surface-secondary)]">
                {rule}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sélection des 16 Cas d'Usage Logiciels */}
      <div className="space-y-2.5">
        <div className="text-xs font-semibold text-[var(--text-main)]">
          1. Choisissez un cas d’usage logiciel ({SOFTWARE_USE_CASES.length} modèles spécialisés)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SOFTWARE_USE_CASES.map((uc) => {
            const active = softwareDevForm.useCase === uc.id;
            return (
              <button
                key={uc.id}
                type="button"
                onClick={() => handleSelectUseCase(uc.id)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] shadow-2xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)]'
                }`}
              >
                <div className="text-xs font-display font-semibold text-[var(--text-main)] leading-snug break-words">
                  {uc.title}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1 break-words">
                  {uc.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille 2 colonnes : Paramètres techniques (gauche) & Prompt d'ingénierie généré (droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulaire d'architecture logicielle (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Nom du projet / module
              </label>
              <input
                type="text"
                value={softwareDevForm.projectTitle}
                onChange={(e) => updateField('projectTitle', e.target.value)}
                placeholder="Ex: FacturLocal Django"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Assistant de programmation cible
              </label>
              <select
                value={softwareDevForm.targetAssistant}
                onChange={(e) => updateField('targetAssistant', e.target.value as TargetProfileId)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              >
                {codingProfiles.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              Objectif technique détaillé *
            </label>
            <textarea
              rows={3}
              value={softwareDevForm.projectObjective}
              onChange={(e) => updateField('projectObjective', e.target.value)}
              placeholder="Décrivez ce que l'agent de codage doit créer, corriger, auditer ou refactoriser..."
              className="w-full p-3 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              Stack technique (sans technologie imposée sans justification)
            </label>
            <input
              type="text"
              value={softwareDevForm.techStack}
              onChange={(e) => updateField('techStack', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[var(--text-main)]">
              Fonctionnalités obligatoires de bout en bout
            </label>
            <textarea
              rows={2}
              value={softwareDevForm.mandatoryFeatures}
              onChange={(e) => updateField('mandatoryFeatures', e.target.value)}
              placeholder="CRUD complet, validation des schémas, persistance SQLite, export..."
              className="w-full p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Modèle de données (Tables / Entités)
              </label>
              <input
                type="text"
                value={softwareDevForm.dataModel}
                onChange={(e) => updateField('dataModel', e.target.value)}
                placeholder="Ex: User, Project, Task, AuditLog"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Endpoints / Routes API
              </label>
              <input
                type="text"
                value={softwareDevForm.apiEndpoints}
                onChange={(e) => updateField('apiEndpoints', e.target.value)}
                placeholder="Ex: GET/POST /api/tasks, PUT /api/tasks/:id"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Architecture & Structure des fichiers
            </label>
            <input
              type="text"
              value={softwareDevForm.architecturePattern}
              onChange={(e) => updateField('architecturePattern', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Sécurité & Gestion des erreurs
              </label>
              <input
                type="text"
                value={softwareDevForm.securityRequirements}
                onChange={(e) => updateField('securityRequirements', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium text-[var(--text-secondary)]">
                Tests & Critères d’acceptation
              </label>
              <input
                type="text"
                value={softwareDevForm.testingStrategy}
                onChange={(e) => updateField('testingStrategy', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
              />
            </div>
          </div>

          {/* Options d'environnement Windows & Règles Agent */}
          <div className="pt-2 space-y-2 border-t border-[var(--border-subtle)]">
            <label className="flex items-center gap-2.5 text-xs text-[var(--text-main)] cursor-pointer">
              <input
                type="checkbox"
                checked={softwareDevForm.windowsNativeNoDocker}
                onChange={(e) => updateField('windowsNativeNoDocker', e.target.checked)}
                className="rounded border-[var(--border-subtle)]"
              />
              <span>Exiger la compatibilité Windows native sans Docker (scripts PowerShell .ps1)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-[var(--text-main)] cursor-pointer">
              <input
                type="checkbox"
                checked={softwareDevForm.enforceTenGoldenRules}
                onChange={(e) => updateField('enforceTenGoldenRules', e.target.checked)}
                className="rounded border-[var(--border-subtle)]"
              />
              <span>Injecter les 10 règles strictes pour assistants de programmation (zéro mock/simulation)</span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleGenerateDevPrompt}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white text-sm font-medium transition-opacity disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Code2 className="w-4 h-4" />
            )}
            <span>
              {isGenerating
                ? 'Construction du prompt logiciel...'
                : 'Générer le prompt pour l’agent de codage'}
            </span>
          </button>
        </div>

        {/* Panneau droit : Résultat (7 cols) */}
        <div className="lg:col-span-7 space-y-4 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <input
              type="text"
              value={softwareDevTitle}
              onChange={(e) => setSoftwareDevTitle(e.target.value)}
              placeholder="Titre du prompt technique..."
              className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-sm font-display font-semibold text-[var(--text-main)]"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (!softwareDevOutput.trim()) return;
                  navigator.clipboard.writeText(softwareDevOutput);
                  addToast('success', 'Prompt logiciel copié dans le presse-papiers.');
                }}
                disabled={!softwareDevOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>Copier</span>
              </button>

              <button
                onClick={() => openPromptInOptimizer(softwareDevOutput, softwareDevTitle)}
                disabled={!softwareDevOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Optimiser</span>
              </button>

              <button
                onClick={() => openPromptInEvaluator(softwareDevOutput)}
                disabled={!softwareDevOutput.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
                <span>Évaluer</span>
              </button>

              <button
                onClick={handleSaveDevPrompt}
                disabled={!softwareDevOutput.trim() || isSaving}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <Save className="w-3.5 h-3.5 shrink-0" />
                <span>{isSaving ? 'Sauvegarde...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>

          <textarea
            rows={22}
            value={softwareDevOutput}
            onChange={(e) => setSoftwareDevOutput(e.target.value)}
            placeholder="Le prompt complet destiné à Claude Code, Cursor ou OpenCode s'affichera ici avec l'architecture, le modèle de données, les règles anti-simulation et les critères d'acceptation..."
            className="w-full p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-sm leading-relaxed text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>
      </div>
    </div>
  );
};
