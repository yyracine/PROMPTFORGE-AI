import React from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  ShieldCheck,
  Database,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { triggerInstallModal } from '../common/InstallPwaManager';

export const TopBar: React.FC = () => {
  const {
    setActiveView,
    stats,
    isLoadingData,
    startNewPromptDraft,
    theme,
    setTheme,
    resolvedTheme,
  } = useWorkspace();

  const [localSearch, setLocalSearch] = React.useState('');

  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearch(val);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setActiveView('library');
    }
  };

  const handleQuickNewPrompt = () => {
    startNewPromptDraft();
  };

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 flex items-center justify-between gap-4 shrink-0">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={handleGlobalSearchChange}
          placeholder="Rechercher dans vos prompts (titre, tag, modèle)..."
          className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            Effacer
          </button>
        )}
      </form>

      {/* Status Badges & Quick Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Local SQLite Status Indicator */}
        {(() => {
          const isConnected = Boolean(stats?.sqliteConnected ?? (stats !== null));
          const isInitialized = Boolean(stats?.sqliteInitialized ?? ((stats?.totalTemplates ?? 0) > 0));

          if (isLoadingData && !stats) {
            return (
              <div
                title="Vérification de la connexion à la base de données SQLite..."
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"
              >
                <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                <span>SQLite (connexion...)</span>
              </div>
            );
          }

          if (isConnected && isInitialized) {
            return (
              <div
                onClick={() => setActiveView('settings')}
                title={`Base SQLite connectée et initialisée (${stats?.sqliteFilePath || '.data/promptforge.sqlite'})\n${stats?.totalPrompts ?? 0} prompts · ${stats?.totalTemplates ?? 0} modèles · ${stats?.sqliteSizeKb ?? 0} Ko`}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 transition-colors group"
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="absolute w-2 h-2 rounded-full bg-emerald-400/40 animate-ping" />
                </div>
                <Database className="w-3 h-3 text-emerald-400" />
                <span>SQLite Connectée</span>
                <span className="text-[10px] text-emerald-500/80 font-mono">
                  ({stats?.totalPrompts ?? 0} prompts)
                </span>
              </div>
            );
          }

          if (isConnected && !isInitialized) {
            return (
              <div
                onClick={() => setActiveView('settings')}
                title="Base SQLite connectée mais tables non initialisées"
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <Database className="w-3 h-3 text-amber-400" />
                <span>SQLite En attente d'init</span>
              </div>
            );
          }

          return (
            <div
              onClick={() => setActiveView('settings')}
              title="Base SQLite déconnectée ou inaccessible"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer hover:bg-rose-500/15 transition-colors"
            >
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>SQLite Déconnectée</span>
            </div>
          );
        })()}

        {/* AI Engine Status */}
        <div
          onClick={() => setActiveView('settings')}
          title="Statut du moteur IA Gemini côté serveur"
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
            stats?.aiEngineReady
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{stats?.aiEngineReady ? 'Moteur IA Prêt' : 'Mode Heuristique'}</span>
        </div>

        {/* Quick Action: Install App (PWA / Desktop) */}
        <button
          onClick={triggerInstallModal}
          title="Installer PromptForge IA sur votre ordinateur (PWA ou Installateur Windows/macOS)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Installer l’app</span>
        </button>

        {/* Quick Action: Optimize */}
        <button
          onClick={() => setActiveView('optimizer')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-hover)] hover:bg-slate-700/60 text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="hidden md:inline">Optimiser</span>
        </button>

        {/* Quick Action: 10 Rules */}
        <button
          onClick={() => setActiveView('software-dev')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-hover)] hover:bg-slate-700/60 text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors cursor-pointer shrink-0 whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="hidden lg:inline">10 Règles Code</span>
        </button>

        {/* Quick Action: New Prompt */}
        <button
          onClick={handleQuickNewPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20 transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Nouveau Prompt</span>
        </button>

        {/* Theme Toggle Button (Dark / Light) */}
        <button
          onClick={() => {
            const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);
          }}
          title={
            resolvedTheme === 'dark'
              ? 'Passer en thème clair (sauvegardé en mémoire locale)'
              : 'Passer en thème sombre (sauvegardé en mémoire locale)'
          }
          aria-label={
            resolvedTheme === 'dark'
              ? 'Activer le mode clair'
              : 'Activer le mode sombre'
          }
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-colors cursor-pointer shrink-0"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-200 hover:-rotate-12" />
          )}
        </button>
      </div>
    </header>
  );
};
