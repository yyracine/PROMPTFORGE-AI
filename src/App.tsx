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
import { SoftwareDevView } from './components/views/SoftwareDevView';
import { LibraryView } from './components/views/LibraryView';
import { TemplatesView } from './components/views/TemplatesView';
import { HistoryView } from './components/views/HistoryView';
import { EvaluatorView } from './components/views/EvaluatorView';
import { SettingsView } from './components/views/SettingsView';
import { InstallPwaManager } from './components/common/InstallPwaManager';

const WorkspaceShell: React.FC = () => {
  const { activeView } = useWorkspace();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'generator' && <GeneratorView />}
          {activeView === 'optimizer' && <OptimizerView />}
          {activeView === 'software-dev' && <SoftwareDevView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'templates' && <TemplatesView />}
          {activeView === 'history' && <HistoryView />}
          {activeView === 'evaluator' && <EvaluatorView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
      <InstallPwaManager />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}
