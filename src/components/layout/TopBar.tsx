import React from 'react';
import {
  Search,
  Plus,
  SlidersHorizontal,
  ShieldCheck,
  Database,
  Sparkles,
  Download,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { triggerInstallModal } from '../common/InstallPwaManager';

export const TopBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    status,
    setGeneratorDraft,
  } = useWorkspace();

  const handleGlobalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim() && activeView !== 'library') {
      setActiveView('library');
    }
  };

  const handleQuickNewPrompt = () => {
    setGeneratorDraft(null);
    setActiveView('generator');
  };

  return (
    <header className="h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 flex items-center justify-between gap-4 shrink-0">
      {/* Global Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleGlobalSearchChange}
          placeholder="Rechercher dans vos prompts (titre, tag, modèle, contenu)..."
          className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Status Badges & Quick Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Local SQLite Status */}
        <div
          onClick={() => setActiveView('settings')}
          title="Base de données SQLite locale active"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/15 transition-colors"
        >
          <Database className="w-3 h-3" />
          <span>SQLite Local ({status?.stats.totalPrompts ?? 0} prompts)</span>
        </div>

        {/* AI Engine Status */}
        <div
          onClick={() => setActiveView('settings')}
          title="Statut du moteur IA Gemini côté serveur"
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border cursor-pointer transition-colors ${
            status?.aiConfigured
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/15'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{status?.aiConfigured ? 'Moteur IA Prêt' : 'Mode Heuristique'}</span>
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
      </div>
    </header>
  );
};
