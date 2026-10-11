import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Database,
  Download,
  Upload,
  CheckCircle2,
  Loader2,
  Terminal,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { TARGET_PROFILES } from '../../lib/constants';
import { WINDOWS_PACK_FILES, WindowsExportFile } from '../../lib/windowsPackContent';
import {
  DetailLevel,
  GenerationMode,
  OutputFormat,
  TargetProfileId,
  ThemeMode,
} from '../../types/promptforge';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    stats,
    settings,
    refreshAllData,
    addToast,
  } = useWorkspace();

  const [defaultMode, setDefaultMode] = useState<GenerationMode>(
    settings.default_mode || 'professionnel'
  );
  const [defaultDetail, setDefaultDetail] = useState<DetailLevel>(
    settings.default_detail_level || 'standard'
  );
  const [preferredTarget, setPreferredTarget] = useState<TargetProfileId>(
    settings.preferred_target_profile || 'claude-code'
  );
  const [preferredFormat, setPreferredFormat] = useState<OutputFormat>(
    settings.preferred_output_format || 'markdown'
  );
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{
    ok: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  // Import / Restore state
  const [importPreview, setImportPreview] = useState<{
    payload: any;
    totalIncoming: number;
    duplicateCount: number;
    duplicateTitles: string[];
  } | null>(null);
  const [duplicateStrategy, setDuplicateStrategy] = useState<'skip' | 'duplicate' | 'overwrite'>(
    'duplicate'
  );
  const [isRestoring, setIsRestoring] = useState(false);

  // Selected Windows script to inspect/download
  const [selectedWinFile, setSelectedWinFile] = useState<WindowsExportFile>(
    WINDOWS_PACK_FILES[0]
  );

  const handleSavePreferences = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_mode: defaultMode,
          default_detail_level: defaultDetail,
          preferred_target_profile: preferredTarget,
          preferred_output_format: preferredFormat,
        }),
      });
      if (res.ok) {
        await refreshAllData();
        addToast('success', 'Préférences de génération enregistrées dans SQLite.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  const handleTestProvider = async () => {
    setIsTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/provider/test', { method: 'POST' });
      const data = await res.json();
      setConnectionResult(data);
      if (data.ok) {
        addToast('success', data.message);
      } else {
        addToast('warning', data.message);
      }
    } catch (err: any) {
      setConnectionResult({ ok: false, message: `Erreur réseau : ${err.message}` });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Sauvegarde complète JSON (prompts, versions, catégories, tags, modèles, préférences non sensibles)
  const handleExportFullBackup = async () => {
    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) {
        addToast('error', 'Impossible de générer la sauvegarde.');
        return;
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `promptforge-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast(
        'success',
        'Sauvegarde complète exportée au format JSON (sans aucune clé API).'
      );
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    }
  };

  // Lecture et validation d'un fichier JSON ou Markdown avant import/restauration
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let payload: any;

      if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        // Parse Markdown prompt import
        const lines = text.split(/\r?\n/);
        const firstHeading = lines.find((l) => l.startsWith('# '))?.replace(/^#\s+/, '').trim();
        payload = {
          title: firstHeading || file.name.replace(/\.(md|txt)$/i, ''),
          description: 'Importé depuis un fichier Markdown',
          generated_content: text,
          domain: 'Développement logiciel',
          output_format: 'markdown',
        };
      } else {
        payload = JSON.parse(text);
      }

      const inspectRes = await fetch('/api/backup/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const inspectData = await inspectRes.json();
      if (!inspectRes.ok || !inspectData.valid) {
        addToast('error', inspectData.error || 'Fichier non reconnu ou invalide.');
        return;
      }

      setImportPreview({
        payload,
        totalIncoming: inspectData.totalIncoming,
        duplicateCount: inspectData.duplicateCount,
        duplicateTitles: inspectData.duplicateTitles || [],
      });
    } catch (err: any) {
      addToast('error', `Fichier invalide : ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setIsRestoring(true);
    try {
      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: importPreview.payload,
          strategy: duplicateStrategy,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshAllData();
        setImportPreview(null);
        addToast(
          'success',
          `Importation terminée : ${data.importedCount} prompt(s) enregistré(s), ${data.skippedCount} ignoré(s).`
        );
      } else {
        addToast('error', data.error || 'Erreur lors de la restauration.');
      }
    } catch (err: any) {
      addToast('error', `Erreur : ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDownloadWindowsFile = (file: WindowsExportFile) => {
    const filename = file.path.split('/').pop() || 'script.ps1';
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', `Fichier « ${filename} » téléchargé.`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h1 className="text-2xl font-display font-bold text-[var(--text-main)]">
          Paramètres, Sauvegarde et Pack Windows
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Configurez l’apparence, les préférences de génération, les sauvegardes SQLite et les scripts PowerShell pour Windows.
        </p>
      </div>

      {/* Section 1 : Apparence (Clair, Sombre, Automatique) */}
      <section className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div>
          <h2 className="text-base font-display font-semibold text-[var(--text-main)]">
            1. Apparence et Thème
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            La préférence est enregistrée localement et appliquée immédiatement sans jamais réinitialiser vos brouillons en cours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(
            [
              {
                mode: 'light',
                title: 'Mode Clair',
                desc: 'Fond #F7F8FA et surfaces #FFFFFF haute lisibilité',
                icon: Sun,
              },
              {
                mode: 'dark',
                title: 'Mode Sombre',
                desc: 'Fond #101116 et surfaces #1B1D26 à contraste calibré',
                icon: Moon,
              },
              {
                mode: 'system',
                title: 'Mode Automatique',
                desc: 'Synchronisé avec les préférences de votre système',
                icon: Monitor,
              },
            ] as { mode: ThemeMode; title: string; desc: string; icon: any }[]
          ).map((item) => {
            const Icon = item.icon;
            const active = theme === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => setTheme(item.mode)}
                className={`p-4 rounded-xl border text-left transition-colors flex items-start gap-3 ${
                  active
                    ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-secondary)]'
                    : 'border-[var(--border-subtle)] hover:bg-[var(--bg-surface-secondary)]/50'
                }`}
              >
                <Icon className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-display font-semibold text-[var(--text-main)]">
                    {item.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2 : Fournisseurs d'IA & Profils de Modèles */}
      <section className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-[var(--text-main)]">
              2. Fournisseurs d’IA et Sécurité des Clés
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Les appels aux modèles sont exécutés exclusivement par le serveur backend. Aucune clé API n’est exposée au frontend.
            </p>
          </div>

          <button
            onClick={handleTestProvider}
            disabled={isTestingConnection}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isTestingConnection ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Tester la connexion au fournisseur</span>
          </button>
        </div>

        {connectionResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
              connectionResult.ok
                ? 'border-emerald-500/40 bg-emerald-500/10 text-[var(--text-main)]'
                : 'border-amber-500/40 bg-amber-500/10 text-[var(--text-main)]'
            }`}
          >
            <span>{connectionResult.message}</span>
            {connectionResult.latencyMs !== undefined && (
              <span className="font-mono tabular-nums font-semibold">
                {connectionResult.latencyMs} ms
              </span>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {TARGET_PROFILES.map((tp) => (
            <div
              key={tp.id}
              className="p-3.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-1"
            >
              <div className="text-xs font-display font-semibold text-[var(--text-main)]">
                {tp.name}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">{tp.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 : Préférences de génération par défaut */}
      <section className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-display font-semibold text-[var(--text-main)]">
              3. Préférences de génération par défaut
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Paramètres pré-sélectionnés lorsque vous cliquez sur « Nouveau prompt ».
            </p>
          </div>
          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
          >
            Enregistrer les préférences
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Mode par défaut
            </label>
            <select
              value={defaultMode}
              onChange={(e) => setDefaultMode(e.target.value as GenerationMode)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="rapide">Mode Rapide</option>
              <option value="professionnel">Mode Professionnel</option>
              <option value="expert">Mode Expert</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Niveau de détail
            </label>
            <select
              value={defaultDetail}
              onChange={(e) => setDefaultDetail(e.target.value as DetailLevel)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="concis">Concis</option>
              <option value="standard">Standard</option>
              <option value="exhaustif">Exhaustif</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Modèle cible préféré
            </label>
            <select
              value={preferredTarget}
              onChange={(e) => setPreferredTarget(e.target.value as TargetProfileId)}
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
            <label className="block text-xs font-medium text-[var(--text-secondary)]">
              Format de sortie préféré
            </label>
            <select
              value={preferredFormat}
              onChange={(e) => setPreferredFormat(e.target.value as OutputFormat)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)]"
            >
              <option value="markdown">Markdown</option>
              <option value="xml">Balises XML</option>
              <option value="json">JSON</option>
              <option value="texte">Texte brut</option>
            </select>
          </div>
        </div>
      </section>

      {/* Section 4 : Données, Sauvegarde et Restauration SQLite */}
      <section className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>4. Base de données locale SQLite, Sauvegarde et Restauration</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Emplacement actif : <code className="font-mono">{stats?.sqliteFilePath || '.data/promptforge.sqlite'}</code> ({stats?.sqliteSizeKb || 24} Ko)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportFullBackup}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-main)] text-xs font-medium text-[var(--text-main)]"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Exporter une sauvegarde complète (.JSON)</span>
            </button>

            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importer / Restaurer (.JSON, .MD)</span>
              <input
                type="file"
                accept=".json,.md,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Panneau de confirmation et résolution des doublons lors d'un import/restauration */}
        {importPreview && (
          <div className="p-5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--accent-primary)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-semibold text-[var(--text-main)]">
                Validation du fichier importé avant enregistrement
              </h3>
              <button
                onClick={() => setImportPreview(null)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                Annuler
              </button>
            </div>

            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              <p>
                Prompts valides détectés dans le fichier :{' '}
                <strong className="text-[var(--text-main)] font-mono">
                  {importPreview.totalIncoming}
                </strong>
              </p>
              <p>
                Doublons détectés avec votre bibliothèque existante :{' '}
                <strong className="text-[var(--text-main)] font-mono">
                  {importPreview.duplicateCount}
                </strong>
                {importPreview.duplicateTitles.length > 0 &&
                  ` (${importPreview.duplicateTitles.slice(0, 3).join(', ')})`}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-main)]">
                Comportement explicite en cas de doublon :
              </label>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'duplicate'}
                    onChange={() => setDuplicateStrategy('duplicate')}
                  />
                  <span>Conserver les deux (ajouter le suffixe « (Importé) »)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'skip'}
                    onChange={() => setDuplicateStrategy('skip')}
                  />
                  <span>Ignorer les doublons</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="dupStrategy"
                    checked={duplicateStrategy === 'overwrite'}
                    onChange={() => setDuplicateStrategy('overwrite')}
                  />
                  <span>Mettre à jour les prompts existants (crée une nouvelle version)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportPreview(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isRestoring}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isRestoring ? 'Importation...' : 'Confirmer et importer'}</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Section 5 : Compatibilité Windows sans Docker (Scripts PowerShell & FastAPI) */}
      <section className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-[var(--text-main)] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>5. Scripts d’installation et de lancement Windows (Sans Docker)</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Scripts PowerShell (.ps1) gérant les chemins avec espaces et code de référence du backend Python/FastAPI.
            </p>
          </div>

          <button
            onClick={() => handleDownloadWindowsFile(selectedWinFile)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-medium whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Télécharger {selectedWinFile.path.split('/').pop()}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {WINDOWS_PACK_FILES.map((wf) => (
            <button
              key={wf.path}
              onClick={() => setSelectedWinFile(wf)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs border transition-colors ${
                selectedWinFile.path === wf.path
                  ? 'border-[var(--accent-primary)] bg-[var(--bg-surface-secondary)] text-[var(--text-main)] font-semibold'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              {wf.path}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>{selectedWinFile.description}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedWinFile.content);
                addToast('success', `Contenu de ${selectedWinFile.path} copié.`);
              }}
              className="flex items-center gap-1 text-[var(--accent-primary)] hover:underline shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier le script</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-xs leading-relaxed text-[var(--text-main)] overflow-x-auto max-h-80 overflow-y-auto">
            {selectedWinFile.content}
          </pre>
        </div>
      </section>
    </div>
  );
};
