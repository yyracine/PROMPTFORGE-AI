export type ThemeMode = 'light' | 'dark' | 'system';

export type GenerationMode = 'rapide' | 'professionnel' | 'expert';

export type DetailLevel = 'concis' | 'standard' | 'exhaustif';

export type OutputFormat = 'markdown' | 'xml' | 'json' | 'texte' | 'code_commented';

export type TargetProfileId =
  | 'claude-code'
  | 'cursor-agent'
  | 'opencode'
  | 'claude-3-7-sonnet'
  | 'gpt-4o'
  | 'gemini-3-8-flash';

export interface TargetProfile {
  id: TargetProfileId;
  name: string;
  provider: string;
  category: 'coding-agent' | 'llm';
  description: string;
  recommendedFormat: OutputFormat;
  structuralRules: string[];
}

export type ProfessionalDomain =
  | 'Développement logiciel'
  | 'Django & Python'
  | 'Architecture logicielle'
  | 'Conception MVP & SaaS'
  | 'Landing Pages & Conversion (CRO)'
  | 'Analyse & Rédaction'
  | 'Entrepreneuriat & Marché'
  | 'Marketing & Copywriting'
  | 'Automatisation & Scripts'
  | 'Recherche & Synthèse';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version_number: number;
  content: string;
  mode_used: string;
  provider: string;
  model: string;
  change_summary: string;
  is_manual_edit: boolean;
  created_at: string;
}

export interface PromptRecord {
  id: string;
  title: string;
  description: string;
  original_input: string;
  generated_content: string;
  domain: ProfessionalDomain | string;
  task_type: string;
  target_provider: string;
  target_model: TargetProfileId | string;
  output_format: OutputFormat | string;
  category_id: string;
  tags: string[]; // tag names
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string;
  category_name: string;
  template_content: string;
  variables_schema: TemplateVariable[];
  example_output: string;
  output_format: OutputFormat | string;
  target_provider: string;
  target_model: TargetProfileId | string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface GenerationLog {
  id: string;
  prompt_id?: string | null;
  operation_type: 'generation' | 'optimization' | 'software_dev' | 'evaluation' | 'clarification';
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  status: 'success' | 'error';
  duration_ms: number;
  created_at: string;
}

export interface AppSettings {
  theme: ThemeMode;
  default_mode: GenerationMode;
  default_detail_level: DetailLevel;
  preferred_target_profile: TargetProfileId;
  preferred_output_format: OutputFormat;
  sqlite_path: string;
  auto_save_versions: boolean;
  windows_avoid_docker: boolean;
}

export interface GeneratorFormState {
  needDescription: string;
  domain: ProfessionalDomain;
  objective: string;
  context: string;
  aiRole: string;
  targetProfile: TargetProfileId;
  generationMode: GenerationMode;
  detailLevel: DetailLevel;
  toneAndStyle: string;
  constraints: string;
  outputFormat: OutputFormat;
  successCriteria: string;
  additionalInfo: string;
  clarificationAnswers: Record<string, string>;
}

export interface ClarificationQuestion {
  id: string;
  question: string;
  placeholder: string;
  suggestedOptions?: string[];
  reason: string;
}

export interface ClarificationResponse {
  isVague: boolean;
  questions: ClarificationQuestion[];
  detectedAssumptions: string[];
}

export type OptimizationOperation =
  | 'correction_clarification'
  | 'optimisation_pro'
  | 'version_experte'
  | 'version_concise'
  | 'enrichissement_contexte'
  | 'reorganisation_instructions'
  | 'detection_ambiguites'
  | 'detection_contradictions'
  | 'amelioration_contraintes'
  | 'amelioration_criteres'
  | 'transformation_systeme'
  | 'transformation_agent'
  | 'adaptation_modele';

export interface OptimizationSummary {
  clarifiedElements: string[];
  addedInformation: string[];
  correctedContradictions: string[];
  improvedConstraints: string[];
  assumptionsMade: string[];
}

export interface OptimizationResult {
  optimizedPrompt: string;
  summary: OptimizationSummary;
  durationMs: number;
  modelUsed: string;
}

export type SoftwareUseCaseId =
  | 'django_app'
  | 'rest_api'
  | 'mvp_builder'
  | 'landing_page'
  | 'fullstack_web'
  | 'mobile_app'
  | 'saas_architecture'
  | 'repo_analysis'
  | 'bug_fix'
  | 'refactoring'
  | 'automated_tests'
  | 'security_audit'
  | 'tech_documentation'
  | 'deployment_windows'
  | 'specs_generator'
  | 'software_architecture'
  | 'build_error_diagnosis';

export interface SoftwareDevFormState {
  useCase: SoftwareUseCaseId;
  projectTitle: string;
  projectObjective: string;
  existingContext: string;
  techStack: string;
  mandatoryFeatures: string;
  architecturePattern: string;
  fileStructure: string;
  dataModel: string;
  apiEndpoints: string;
  errorHandling: string;
  securityRequirements: string;
  testingStrategy: string;
  deploymentTarget: string;
  acceptanceCriteria: string;
  targetAssistant: TargetProfileId;
  windowsNativeNoDocker: boolean;
  enforceTenGoldenRules: boolean;
}

export interface EvaluationDimension {
  key: string;
  label: string;
  score: number; // 0 to 100
  status: 'excellent' | 'bon' | 'moyen' | 'faible';
  explanation: string;
  recommendation: string;
}

export interface PromptEvaluationResult {
  evaluationType: 'structural_heuristic' | 'ai_deep_audit';
  overallScore: number;
  methodologyNote: string;
  dimensions: EvaluationDimension[];
  strengths: string[];
  criticalGaps: string[];
  evaluatedAt: string;
}

export interface CategoryUsageMetric {
  id: string;
  name: string;
  promptsCount: number;
  generationsCount: number;
  optimizationsCount: number;
  totalActivity: number;
}

export interface TagUsageMetric {
  name: string;
  promptsCount: number;
  generationsCount: number;
  optimizationsCount: number;
  totalActivity: number;
}

export interface UsageTimelinePoint {
  dateKey: string;
  dateLabel: string;
  generations: number;
  optimizations: number;
  total: number;
  byCategory: Record<string, number>;
}

export interface DashboardStats {
  totalPrompts: number;
  favoritePrompts: number;
  totalVersions: number;
  totalTemplates: number;
  totalGenerations: number;
  avgGenerationDurationMs: number;
  sqliteFilePath: string;
  sqliteSizeKb: number;
  aiEngineReady: boolean;
  aiEngineModel: string;
  categoryMetrics?: CategoryUsageMetric[];
  tagMetrics?: TagUsageMetric[];
  timeline?: UsageTimelinePoint[];
}

export interface ModelComparisonDimensionScore {
  dimension: string;
  scoreA: number; // 0 to 10
  scoreB: number; // 0 to 10
  comment: string;
}

export interface ModelComparisonResult {
  modelAId: TargetProfileId;
  modelAName: string;
  responseA: string;
  durationMsA: number;
  wordCountA: number;

  modelBId: TargetProfileId;
  modelBName: string;
  responseB: string;
  durationMsB: number;
  wordCountB: number;

  comparisonAnalysis: {
    winner: 'modelA' | 'modelB' | 'tie';
    overallScoreA: number; // 0 to 10
    overallScoreB: number; // 0 to 10
    verdictSummary: string;
    modelAStrengths: string[];
    modelBStrengths: string[];
    dimensionComparison: ModelComparisonDimensionScore[];
    promptImprovementTip: string;
  };
  evaluatedAt: string;
}

