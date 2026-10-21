/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardView } from './components/views/DashboardView';
import { GeneratorView } from './components/views/GeneratorView';
import { OptimizerView } from './components/views/OptimizerView';
import { PlaygroundView } from './components/views/PlaygroundView';
import { SoftwareDevView } from './components/views/SoftwareDevView';
import { LibraryView } from './components/views/LibraryView';
import { TemplatesView } from './components/views/TemplatesView';
import { HistoryView } from './components/views/HistoryView';
import { EvaluatorView } from './components/views/EvaluatorView';
import { SettingsView } from './components/views/SettingsView';
import { InstallPwaManager } from './components/common/InstallPwaManager';

const WorkspaceShell: React.FC = () => {
  const { activeView, focusMode } = useWorkspace();
  const isFocusActive = activeView === 'generator' && focusMode;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      {!isFocusActive && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isFocusActive && <TopBar />}
        <main className="flex-1 overflow-y-auto">
          {(!activeView || activeView === 'dashboard') && <DashboardView />}
          {activeView === 'generator' && <GeneratorView />}
          {activeView === 'optimizer' && <OptimizerView />}
          {activeView === 'playground' && <PlaygroundView />}
          {activeView === 'software-dev' && <SoftwareDevView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'templates' && <TemplatesView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'evaluator' && <EvaluatorView />}
          {activeView === 'settings' && <SettingsView />}
          {activeView &&
            ![
              'dashboard',
              'generator',
              'optimizer',
              'playground',
              'software-dev',
              'library',
              'templates',
              'history',
              'evaluator',
              'settings',
            ].includes(activeView) && <DashboardView />}
        </main>
      </div>
      <InstallPwaManager />
      <ToastContainer />
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PromptForge IA Caught UI Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#101116] text-[#F3F4F8] p-8 text-center">
          <div className="max-w-md p-6 rounded-2xl bg-[#1B1D26] border border-amber-500/30 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 font-bold text-xl">
              !
            </div>
            <h2 className="text-lg font-bold">Un problème d'affichage est survenu</h2>
            <p className="text-xs text-[#A1A6B5] leading-relaxed">
              Une exception a été interceptée par le bouclier d'erreur :
            </p>
            <pre className="p-3 rounded-lg bg-black/50 text-red-400 text-xs font-mono text-left overflow-x-auto border border-red-500/20 max-h-36">
              {this.state.error?.message || 'Erreur inconnue'}
            </pre>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Recharger l'application
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <WorkspaceProvider>
        <WorkspaceShell />
      </WorkspaceProvider>
    </AppErrorBoundary>
  );
}
