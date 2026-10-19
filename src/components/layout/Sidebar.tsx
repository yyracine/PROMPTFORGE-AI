import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  SlidersHorizontal,
  Code2,
  FolderKanban,
  BookTemplate,
  History,
  ShieldCheck,
  Settings,
  Plus,
  Sun,
  Moon,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ActiveView, useWorkspace } from '../../context/WorkspaceContext';
import { ThemeMode } from '../../types/promptforge';
import { AppLogo } from '../common/AppLogo';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'generator', label: 'Générateur', icon: Sparkles },
  { id: 'optimizer', label: 'Optimiseur', icon: SlidersHorizontal },
  { id: 'software-dev', label: 'Développement logiciel', icon: Code2 },
  { id: 'library', label: 'Bibliothèque', icon: FolderKanban },
  { id: 'templates', label: 'Modèles', icon: BookTemplate },
  { id: 'history', label: 'Historique', icon: History },
  { id: 'evaluator', label: 'Évaluateur 8D', icon: ShieldCheck },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    theme,
    setTheme,
    sidebarCollapsed,
    setSidebarCollapsed,
    stats,
    startNewPromptDraft,
  } = useWorkspace();

  const themeOptions: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { mode: 'light', label: 'Clair', icon: Sun },
    { mode: 'dark', label: 'Sombre', icon: Moon },
    { mode: 'system', label: 'Auto', icon: Monitor },
  ];

  return (
    <aside
      className={`flex flex-col justify-between border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] transition-all duration-150 shrink-0 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-68'
      }`}
    >
      {/* Top: Brand + New Prompt button + Navigation */}
      <div className="p-3 space-y-4">
        <div
          className={`flex items-center ${
            sidebarCollapsed ? 'flex-col gap-2 justify-center' : 'justify-between px-1.5 py-1'
          }`}
        >
          <button
            onClick={() => setActiveView('dashboard')}
            title="Retour au Tableau de bord — PromptForge IA"
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <AppLogo
              size={sidebarCollapsed ? 'xs' : 'sm'}
              showText={!sidebarCollapsed}
              showSubtitle={!sidebarCollapsed}
            />
          </button>

          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors shrink-0"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Action principale : Nouveau prompt */}
        <button
          onClick={startNewPromptDraft}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[var(--accent-primary)] hover:opacity-95 text-white font-medium text-sm transition-opacity shadow-xs whitespace-nowrap shrink-0 ${
            sidebarCollapsed ? 'px-0' : ''
          }`}
          title="Nouveau prompt"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Nouveau prompt</span>}
        </button>

        {/* Navigation Links */}
        <nav className="space-y-1" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] border border-[var(--border-subtle)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-secondary)]'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span className="leading-snug">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Theme Switcher + AI Provider State + Version */}
      <div className="p-3 border-t border-[var(--border-subtle)] space-y-3">
        {/* Sélecteur de thème Clair / Sombre / Automatique */}
        {!sidebarCollapsed ? (
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
            role="group"
            aria-label="Sélecteur de thème"
          >
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => setTheme(opt.mode)}
                  className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-2xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={() =>
              setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
            }
            title={`Thème actuel : ${theme}`}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-[var(--bg-surface-secondary)] text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>
        )}

        {/* État du fournisseur d'IA et version */}
        {!sidebarCollapsed && (
          <div className="px-2 py-1 text-xs text-[var(--text-secondary)] flex items-center justify-between">
            <span className="truncate">
              {stats?.aiEngineReady ? 'Moteur Gemini prêt' : 'Mode hors-ligne local'}
            </span>
            <span className="font-mono tabular-nums">v1.0.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};
