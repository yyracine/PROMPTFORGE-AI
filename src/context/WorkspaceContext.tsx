import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AppSettings,
  Category,
  DashboardStats,
  GeneratorFormState,
  OptimizationOperation,
  OptimizationResult,
  PromptEvaluationResult,
  PromptRecord,
  PromptTemplate,
  SoftwareDevFormState,
  Tag,
  TargetProfileId,
  ThemeMode,
} from '../types/promptforge';

export type ActiveView =
  | 'dashboard'
  | 'generator'
  | 'optimizer'
  | 'software-dev'
  | 'library'
  | 'templates'
  | 'history'
  | 'evaluator'
  | 'settings';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
}

interface WorkspaceContextValue {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  // Server data
  stats: DashboardStats | null;
  prompts: PromptRecord[];
  templates: PromptTemplate[];
  categories: Category[];
  tags: Tag[];
  settings: AppSettings;
  isLoadingData: boolean;
  refreshAllData: () => Promise<void>;

  // Preserved draft states across page navigation & theme toggles
  generatorForm: GeneratorFormState;
  setGeneratorForm: React.Dispatch<React.SetStateAction<GeneratorFormState>>;
  generatedOutput: string;
  setGeneratedOutput: React.Dispatch<React.SetStateAction<string>>;
  generatedTitle: string;
  setGeneratedTitle: React.Dispatch<React.SetStateAction<string>>;
  generatedAssumptions: string[];
  setGeneratedAssumptions: React.Dispatch<React.SetStateAction<string[]>>;

  optimizerInput: string;
  setOptimizerInput: React.Dispatch<React.SetStateAction<string>>;
  optimizerOperations: OptimizationOperation[];
  setOptimizerOperations: React.Dispatch<React.SetStateAction<OptimizationOperation[]>>;
  optimizerTarget: TargetProfileId;
  setOptimizerTarget: React.Dispatch<React.SetStateAction<TargetProfileId>>;
  optimizerResult: OptimizationResult | null;
  setOptimizerResult: React.Dispatch<React.SetStateAction<OptimizationResult | null>>;

  softwareDevForm: SoftwareDevFormState;
  setSoftwareDevForm: React.Dispatch<React.SetStateAction<SoftwareDevFormState>>;
  softwareDevOutput: string;
  setSoftwareDevOutput: React.Dispatch<React.SetStateAction<string>>;
  softwareDevTitle: string;
  setSoftwareDevTitle: React.Dispatch<React.SetStateAction<string>>;

  evaluatorInput: string;
  setEvaluatorInput: React.Dispatch<React.SetStateAction<string>>;
  evaluationResults: {
    heuristic: PromptEvaluationResult | null;
    aiAudit: PromptEvaluationResult | null;
  };
  setEvaluationResults: React.Dispatch<
    React.SetStateAction<{
      heuristic: PromptEvaluationResult | null;
      aiAudit: PromptEvaluationResult | null;
    }>
  >;

  selectedPromptIdForHistory: string | null;
  setSelectedPromptIdForHistory: (id: string | null) => void;

  // Quick workflow bridges
  openPromptInOptimizer: (content: string, title?: string) => void;
  openPromptInEvaluator: (content: string) => void;
  openTemplateInGenerator: (template: PromptTemplate, compiledContent: string) => void;
  startNewPromptDraft: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'warning' | 'error', message: string) => void;
  removeToast: (id: string) => void;
}

const DEFAULT_GENERATOR_FORM: GeneratorFormState = {
  needDescription: '',
  domain: 'Développement logiciel',
  objective: '',
  context: '',
  aiRole: 'Architecte Logiciel & Développeur Senior',
  targetProfile: 'claude-code',
  generationMode: 'professionnel',
  detailLevel: 'standard',
  toneAndStyle: 'Direct, technique, chirurgical et structuré',
  constraints: 'Implémenter le code de bout en bout sans simulations ni mocks. Compatible Windows sans Docker.',
  outputFormat: 'markdown',
  successCriteria: 'Code complet compilable, modulaire et accompagné des commandes de lancement.',
  additionalInfo: '',
  clarificationAnswers: {},
};

const DEFAULT_SOFTWARE_FORM: SoftwareDevFormState = {
  useCase: 'django_app',
  projectTitle: '',
  projectObjective: '',
  existingContext: 'Application personnelle locale sous Windows 11 sans Docker.',
  techStack: 'Python 3.12, Django 5.x, Django REST Framework, SQLite, Pytest',
  mandatoryFeatures: '',
  architecturePattern: 'Architecture modulaire découplée (Modèles -> Services Métier -> Sérialiseurs/Vues)',
  fileStructure: '',
  dataModel: '',
  apiEndpoints: '',
  errorHandling: 'Validation stricte des entrées, codes HTTP explicites et journalisation sans secrets.',
  securityRequirements: 'Requêtes paramétrées ORM, protection CSRF/CORS local, clés API isolées en variables d’environnement.',
  testingStrategy: 'Tests unitaires et d’intégration Pytest couvrant les cas nominaux et les cas d’erreur.',
  deploymentTarget: 'Exécution locale Windows via scripts PowerShell (.ps1) sans Docker.',
  acceptanceCriteria: 'Démarrage local fonctionnel, persistance vérifiée après redémarrage, tests passants.',
  targetAssistant: 'claude-code',
  windowsNativeNoDocker: true,
  enforceTenGoldenRules: true,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  default_mode: 'professionnel',
  default_detail_level: 'standard',
  preferred_target_profile: 'claude-code',
  preferred_output_format: 'markdown',
  sqlite_path: '.data/promptforge.sqlite',
  auto_save_versions: true,
  windows_avoid_docker: true,
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Theme initialization from localStorage before main paint
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('promptforge_theme') as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      // ignore storage errors
    }
    return 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const computeResolved = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return mediaQuery.matches ? 'dark' : 'light';
      }
      return theme;
    };

    const applyTheme = () => {
      const target = computeResolved();
      setResolvedTheme(target);
      const root = document.documentElement;
      if (target === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('promptforge_theme', newTheme);
    } catch {
      // ignore
    }
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: newTheme }),
    }).catch(() => {});
  }, []);

  // Server data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prompts, setPrompts] = useState<PromptRecord[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Preserved draft states
  const [generatorForm, setGeneratorForm] = useState<GeneratorFormState>(DEFAULT_GENERATOR_FORM);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [generatedAssumptions, setGeneratedAssumptions] = useState<string[]>([]);

  const [optimizerInput, setOptimizerInput] = useState<string>('');
  const [optimizerOperations, setOptimizerOperations] = useState<OptimizationOperation[]>([
    'optimisation_pro',
    'amelioration_contraintes',
  ]);
  const [optimizerTarget, setOptimizerTarget] = useState<TargetProfileId>('claude-code');
  const [optimizerResult, setOptimizerResult] = useState<OptimizationResult | null>(null);

  const [softwareDevForm, setSoftwareDevForm] = useState<SoftwareDevFormState>(DEFAULT_SOFTWARE_FORM);
  const [softwareDevOutput, setSoftwareDevOutput] = useState<string>('');
  const [softwareDevTitle, setSoftwareDevTitle] = useState<string>('');

  const [evaluatorInput, setEvaluatorInput] = useState<string>('');
  const [evaluationResults, setEvaluationResults] = useState<{
    heuristic: PromptEvaluationResult | null;
    aiAudit: PromptEvaluationResult | null;
  }>({ heuristic: null, aiAudit: null });

  const [selectedPromptIdForHistory, setSelectedPromptIdForHistory] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback(
    (type: 'success' | 'warning' | 'error', message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => removeToast(id), 4200);
    },
    [removeToast]
  );

  const refreshAllData = useCallback(async () => {
    try {
      const [statusRes, promptsRes, templatesRes, categoriesRes, tagsRes, settingsRes] =
        await Promise.all([
          fetch('/api/status'),
          fetch('/api/prompts'),
          fetch('/api/templates'),
          fetch('/api/categories'),
          fetch('/api/tags'),
          fetch('/api/settings'),
        ]);

      if (statusRes.ok) setStats(await statusRes.json());
      if (promptsRes.ok) setPrompts(await promptsRes.json());
      if (templatesRes.ok) setTemplates(await templatesRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (tagsRes.ok) setTags(await tagsRes.json());
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setSettings((prev) => ({ ...prev, ...sData }));
      }
    } catch (error) {
      console.error('Failed to load workspace data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const openPromptInOptimizer = useCallback((content: string, title?: string) => {
    setOptimizerInput(content);
    setOptimizerResult(null);
    if (title) {
      setGeneratedTitle(`${title} (Optimisé)`);
    }
    setActiveView('optimizer');
  }, []);

  const openPromptInEvaluator = useCallback((content: string) => {
    setEvaluatorInput(content);
    setActiveView('evaluator');
  }, []);

  const openTemplateInGenerator = useCallback((template: PromptTemplate, compiledContent: string) => {
    setGeneratorForm((prev) => ({
      ...prev,
      needDescription: compiledContent,
      targetProfile: (template.target_model as TargetProfileId) || 'claude-code',
      outputFormat: (template.output_format as any) || 'markdown',
    }));
    setGeneratedOutput(compiledContent);
    setGeneratedTitle(template.title);
    setActiveView('generator');
  }, []);

  const startNewPromptDraft = useCallback(() => {
    setGeneratorForm({
      ...DEFAULT_GENERATOR_FORM,
      generationMode: settings.default_mode || 'professionnel',
      detailLevel: settings.default_detail_level || 'standard',
      targetProfile: settings.preferred_target_profile || 'claude-code',
      outputFormat: settings.preferred_output_format || 'markdown',
    });
    setGeneratedOutput('');
    setGeneratedTitle('');
    setGeneratedAssumptions([]);
    setActiveView('generator');
  }, [settings]);

  return (
    <WorkspaceContext.Provider
      value={{
        activeView,
        setActiveView,
        theme,
        setTheme,
        resolvedTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        stats,
        prompts,
        templates,
        categories,
        tags,
        settings,
        isLoadingData,
        refreshAllData,
        generatorForm,
        setGeneratorForm,
        generatedOutput,
        setGeneratedOutput,
        generatedTitle,
        setGeneratedTitle,
        generatedAssumptions,
        setGeneratedAssumptions,
        optimizerInput,
        setOptimizerInput,
        optimizerOperations,
        setOptimizerOperations,
        optimizerTarget,
        setOptimizerTarget,
        optimizerResult,
        setOptimizerResult,
        softwareDevForm,
        setSoftwareDevForm,
        softwareDevOutput,
        setSoftwareDevOutput,
        softwareDevTitle,
        setSoftwareDevTitle,
        evaluatorInput,
        setEvaluatorInput,
        evaluationResults,
        setEvaluationResults,
        selectedPromptIdForHistory,
        setSelectedPromptIdForHistory,
        openPromptInOptimizer,
        openPromptInEvaluator,
        openTemplateInGenerator,
        startNewPromptDraft,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return ctx;
}
