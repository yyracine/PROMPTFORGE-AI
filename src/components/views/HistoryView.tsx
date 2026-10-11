import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  GitCompare,
  SlidersHorizontal,
  Loader2,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  exportVersionHistoryToCsv,
  exportVersionHistoryToPdf,
} from '../../lib/reportExporter';
import { PromptVersion } from '../../types/promptforge';

export const HistoryView: React.FC = () => {
  const {
    prompts,
    selectedPromptIdForHistory,
    setSelectedPromptIdForHistory,
    refreshAllData,
    openPromptInOptimizer,
    addToast,
  } = useWorkspace();

  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    selectedPromptIdForHistory || prompts[0]?.id || ''
  );
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);

  const [leftVersionId, setLeftVersionId] = useState<string>('');
  const [rightVersionId, setRightVersionId] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  useEffect(() => {
    if (selectedPromptIdForHistory) {
      setSelectedPromptId(selectedPromptIdForHistory);
    } else if (!selectedPromptId && prompts.length > 0) {
      setSelectedPromptId(prompts[0].id);
    }
  }, [selectedPromptIdForHistory, prompts, selectedPromptId]);

  const loadPromptVersions = async (promptId: string) => {
    if (!promptId) return;
    setIsLoadingVersions(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}`);
      if (res.ok) {
        const data = await res.json();
        const verList: PromptVersion[] = data.versions || [];
        setVersions(verList);
        if (verList.length >= 2) {
          setRightVersionId(verList[0].id); // latest
          setLeftVersionId(verList[1].id); // previous
        } else if (verList.length === 1) {
          setRightVersionId(verList[0].id);
          setLeftVersionId(verList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load versions:', err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    if (selectedPromptId) {
      loadPromptVersions(selectedPromptId);
    }
  }, [selectedPromptId]);

  const handleRestoreVersion = async (version: PromptVersion) => {
    if (!selectedPromptId) return;
    setIsRestoring(true);
    try {
      const res = await fetch(
        `/api/prompts/${selectedPromptId}/versions/${version.id}/restore`,
        { method: 'POST' }
      );
      if (res.ok) {
        const data = await res.json();
        await refreshAllData();
        await loadPromptVersions(selectedPromptId);
        addToast(
          'success',
          `Version v${version.version_number} restaurée en tant que nouvelle version v${data.restoredVersionNumber} (sans écraser l'historique).`
        );
      } else {
        const err = await res.json();
        addToast('error', err.error || 'Échec de la restauration.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const leftVersion = versions.find((v) => v.id === leftVersionId) || versions[0];
  const rightVersion = versions.find((v) => v.id === rightVersionId) || versions[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
            Historique et comparateur de versions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Consultez les révisions successives, distinguez les éditions manuelles des optimisations IA et restaurez une version sans perte.
          </p>
        </div>

        {/* Sélecteur de prompt & Export CSV / PDF */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">
            Prompt inspecté :
          </label>
          <select
            value={selectedPromptId}
            onChange={(e) => {
              setSelectedPromptId(e.target.value);
              setSelectedPromptIdForHistory(e.target.value);
            }}
            className="px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-main)] max-w-sm"
          >
            {prompts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              const promptObj = prompts.find((p) => p.id === selectedPromptId);
              if (!promptObj || versions.length === 0) return;
              exportVersionHistoryToCsv(promptObj, versions);
              addToast('success', 'Historique des versions exporté au format CSV.');
            }}
            disabled={versions.length === 0}
            title="Exporter l'historique complet des versions au format CSV"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => {
              const promptObj = prompts.find((p) => p.id === selectedPromptId);
              if (!promptObj || versions.length === 0) return;
              exportVersionHistoryToPdf(promptObj, versions);
              addToast('success', 'Rapport d’historique des versions exporté au format PDF.');
            }}
            disabled={versions.length === 0}
            title="Exporter le rapport d'historique des versions au format PDF professionnel"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-secondary)] text-xs font-medium text-[var(--text-main)] disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />
            <span>Exporter PDF</span>
          </button>
        </div>
      </div>

      {isLoadingVersions ? (
        <div className="p-12 text-center text-sm text-[var(--text-secondary)] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Chargement de l’historique des versions...</span>
        </div>
      ) : versions.length === 0 ? (
        <div className="p-12 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs text-[var(--text-secondary)]">
          Aucune version enregistrée pour ce prompt.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chronologie des versions (4 cols) */}
          <div className="lg:col-span-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            <div className="px-4 py-3 text-xs font-display font-semibold text-[var(--text-main)]">
              Chronologie des versions ({versions.length})
            </div>
            {versions.map((ver) => {
              const isSelectedLeft = ver.id === leftVersionId;
              const isSelectedRight = ver.id === rightVersionId;
              return (
                <div
                  key={ver.id}
                  className="p-4 space-y-2 hover:bg-[var(--bg-surface-secondary)]/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-sm text-[var(--text-main)] tabular-nums">
                      Version v{ver.version_number}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {ver.is_manual_edit ? 'Modification manuelle' : `Mode ${ver.mode_used}`}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)]">
                    {ver.change_summary}
                  </p>

                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                    <span>{ver.provider}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{ver.model}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {new Date(ver.created_at).toLocaleString('fr-FR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setLeftVersionId(ver.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          isSelectedLeft
                            ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-surface-secondary)]'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        Panneau A
                      </button>
                      <button
                        onClick={() => setRightVersionId(ver.id)}
                        className={`px-2 py-1 rounded text-[11px] font-medium border ${
                          isSelectedRight
                            ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-surface-secondary)]'
                            : 'border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        }`}
                      >
                        Panneau B
                      </button>
                    </div>

                    <button
                      onClick={() => handleRestoreVersion(ver)}
                      disabled={isRestoring}
                      title="Créer une nouvelle version à partir de celle-ci"
                      className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparateur Côte-à-Côte (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
                <GitCompare className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>
                  Comparaison : Version v{leftVersion?.version_number} vs Version v
                  {rightVersion?.version_number}
                </span>
              </div>
              <span className="text-xs text-[var(--text-secondary)]">
                L’historique est immuable : restaurer une ancienne version crée une nouvelle révision au sommet.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Panneau A */}
              {leftVersion && (
                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                        Panneau A — v{leftVersion.version_number}
                      </span>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {leftVersion.change_summary}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(leftVersion.content);
                        addToast('success', `Version v${leftVersion.version_number} copiée.`);
                      }}
                      className="p-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap max-h-[460px] overflow-y-auto">
                    {leftVersion.content}
                  </pre>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)]">
                      {leftVersion.content.split(/\s+/).length} mots
                    </span>
                    <button
                      onClick={() => openPromptInOptimizer(leftVersion.content)}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Créer une variante optimisée</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Panneau B */}
              {rightVersion && (
                <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                    <div>
                      <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                        Panneau B — v{rightVersion.version_number}
                      </span>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {rightVersion.change_summary}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(rightVersion.content);
                        addToast('success', `Version v${rightVersion.version_number} copiée.`);
                      }}
                      className="p-1.5 rounded border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <pre className="p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] font-mono text-xs leading-relaxed text-[var(--text-main)] whitespace-pre-wrap max-h-[460px] overflow-y-auto">
                    {rightVersion.content}
                  </pre>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono tabular-nums text-[var(--text-secondary)]">
                      {rightVersion.content.split(/\s+/).length} mots
                    </span>
                    <button
                      onClick={() => openPromptInOptimizer(rightVersion.content)}
                      className="flex items-center gap-1 text-xs font-medium text-[var(--accent-primary)] hover:underline"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Créer une variante optimisée</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
