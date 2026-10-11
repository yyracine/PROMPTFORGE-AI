import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  CheckCircle2,
  X,
  RefreshCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  FolderArchive,
  AlertTriangle,
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { AppLogo } from './AppLogo';
import { useWorkspace } from '../../context/WorkspaceContext';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Shared singleton state so TopBar and SettingsView can also trigger the install modal or native prompt
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

export function triggerInstallModal() {
  window.dispatchEvent(new CustomEvent('promptforge:open-install-modal'));
}

export const InstallPwaManager: React.FC = () => {
  const { addToast, setActiveView } = useWorkspace();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [downloadingScript, setDownloadingScript] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PromptForge IA Service Worker enregistré :', r);
    },
    onRegisterError(error) {
      console.error('Erreur Service Worker :', error);
    },
  });

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    };
    checkStandalone();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(globalDeferredPrompt);
      promptListeners.forEach((fn) => fn());
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setShowModal(false);
      addToast('success', 'PromptForge IA a été installé avec succès sur votre appareil !');
    };

    const handleOpenModal = () => {
      setShowModal(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('promptforge:open-install-modal', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('promptforge:open-install-modal', handleOpenModal);
    };
  }, [addToast]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  const handleDownloadInstaller = async (target: 'zip' | 'windows' | 'unix') => {
    setDownloadingScript(true);
    try {
      const res = await fetch(`/api/installer/${target}`);
      if (!res.ok) throw new Error('Erreur lors de la génération du pack d’installation');

      if (target === 'zip') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'PromptForge-IA-Pack-Complet.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast(
          'success',
          'Pack complet PromptForge-IA-Pack-Complet.zip téléchargé ! Décompressez-le puis lancez setup-windows.bat.'
        );
      } else {
        const text = await res.text();
        const filename = target === 'windows' ? 'setup-windows.bat' : 'setup-unix.sh';
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast('success', `Script ${filename} téléchargé ! Placez-le à la racine du dossier du projet.`);
      }
    } catch (err: any) {
      addToast('error', err.message || 'Impossible de télécharger l’installateur');
    } finally {
      setDownloadingScript(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <>
      {/* Toast PWA Offline / Update */}
      {(offlineReady || needRefresh) && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm bg-[var(--bg-surface)] border border-indigo-500/40 rounded-xl shadow-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[var(--text-main)]">
              {offlineReady ? 'Application prête hors-ligne (PWA)' : 'Nouvelle version disponible'}
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
              {offlineReady
                ? 'PromptForge IA est mis en cache et peut être installé comme application de bureau.'
                : 'Une mise à jour de PromptForge IA est prête à être appliquée.'}
            </p>
            <div className="flex items-center gap-2 mt-2.5">
              {needRefresh && (
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                >
                  Mettre à jour
                </button>
              )}
              {!isInstalled && (
                <button
                  onClick={() => setShowModal(true)}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                >
                  Installer l’application
                </button>
              )}
              <button
                onClick={() => {
                  setOfflineReady(false);
                  setNeedRefresh(false);
                }}
                className="px-2 py-1 rounded-md text-[11px] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Center d'Installation Desktop / PWA / Local */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-amber-950/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <AppLogo size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-[var(--text-main)]">
                      Installer PromptForge IA
                    </h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Desktop & PWA
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Choisissez le mode d’installation adapté à votre poste de travail (PWA 1-clic ou Serveur Local Complet).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* Option 1: PWA Native Desktop App */}
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-2">
                        1. Application de Bureau Native (PWA — Recommandé, sans Node.js)
                        {isInstalled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Installée
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        S’installe directement depuis Chrome ou Edge dans votre menu Démarrer Windows / Bureau avec son icône PromptForge IA. Aucune ligne de commande requise.
                      </p>
                    </div>
                  </div>

                  {deferredPrompt ? (
                    <button
                      onClick={handleNativeInstall}
                      className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Installer maintenant en 1 clic
                    </button>
                  ) : (
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-all shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ouvrir dans un nouvel onglet pour installer
                    </a>
                  )}
                </div>

                {!deferredPrompt && !isInstalled && (
                  <div className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-main)]/80 border border-[var(--border-subtle)] rounded-lg p-3 leading-relaxed">
                    <strong className="text-[var(--text-main)]">Comment l’installer en 5 secondes :</strong> Cliquez sur{' '}
                    <strong className="text-indigo-400">« Ouvrir dans un nouvel onglet pour installer »</strong> ci-dessus, puis cliquez sur l’icône{' '}
                    <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-main)] font-mono">
                      ⊕ Installer PromptForge IA
                    </span>{' '}
                    située à droite de la barre d’adresse de Chrome ou Edge.
                  </div>
                )}
              </div>

              {/* Option 2: Pack Complet ZIP (Serveur Local Autonome Windows / macOS / Linux) */}
              <div className="p-4 rounded-xl border border-amber-500/35 bg-amber-500/5 space-y-3.5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <FolderArchive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-main)]">
                        2. Installation Serveur Local sur votre PC (Pack Complet .ZIP)
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Contient <strong>tous les fichiers du projet</strong> (<code>package.json</code>, <code>server.ts</code>, <code>src/</code>, <code>public/</code>) ainsi que le lanceur automatique <code>setup-windows.bat</code> corrigé.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadInstaller('zip')}
                    disabled={downloadingScript}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
                  >
                    <FolderArchive className="w-4 h-4" />
                    {downloadingScript ? 'Génération du ZIP...' : 'Télécharger le Pack Complet (.ZIP)'}
                  </button>
                </div>

                {/* Avertissement important contre l'exécution du .bat seul */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-[11px] text-[var(--text-main)] leading-relaxed">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Important (Pourquoi l’erreur ENOENT package.json apparaît si vous téléchargez uniquement le .bat) :</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-0.5 text-[var(--text-muted)]">
                      <li>
                        Cliquez sur <strong className="text-[var(--text-main)]">« Télécharger le Pack Complet (.ZIP) »</strong> ci-dessus.
                      </li>
                      <li>
                        Faites un clic droit sur <code>PromptForge-IA-Pack-Complet.zip</code> &rarr; <strong className="text-[var(--text-main)]">« Extraire tout… »</strong>.
                      </li>
                      <li>
                        Ouvrez le dossier extrait <code>PromptForge-IA</code> et double-cliquez sur <strong className="text-amber-300"><code>setup-windows.bat</code></strong>.
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Téléchargement individuel des scripts mis à jour */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleDownloadInstaller('windows')}
                    disabled={downloadingScript}
                    className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                        Script seul : setup-windows.bat
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        À placer dans le dossier contenant package.json
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      .BAT
                    </span>
                  </button>

                  <button
                    onClick={() => handleDownloadInstaller('unix')}
                    disabled={downloadingScript}
                    className="p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex items-center justify-between gap-2 text-left cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        Script seul : setup-unix.sh
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        macOS / Linux • À placer dans le dossier du projet
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      .SH
                    </span>
                  </button>
                </div>

                {/* Quick command line */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
                    <span>Commande manuelle (dans le dossier extrait PromptForge-IA) :</span>
                    <button
                      onClick={() => copyText('npm install --legacy-peer-deps && npm run build && npm run start', 'cmd')}
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 cursor-pointer"
                    >
                      {copiedCmd === 'cmd' ? (
                        <>
                          <Check className="w-3 h-3" /> Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copier
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                    npm install --legacy-peer-deps &amp;&amp; npm run build &amp;&amp; npm run start
                  </pre>
                </div>
              </div>

              {/* Option 3: Pack PowerShell & FastAPI complet */}
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-xs text-[var(--text-muted)]">
                    Besoin des scripts PowerShell (<code>install.ps1</code>, <code>start.ps1</code>) ou d’exporter votre base de données JSON ?
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setActiveView('settings');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-hover)] hover:bg-indigo-500/20 text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors cursor-pointer"
                >
                  Ouvrir Paramètres &amp; Pack Windows
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-main)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pack ZIP autonome, scripts CRLF Windows 10/11 et PWA prêts</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
