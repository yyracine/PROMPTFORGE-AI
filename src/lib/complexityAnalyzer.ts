import { countTokensApproximate } from './tokenEstimator';

export interface KeywordDensityItem {
  keyword: string;
  category: string;
  count: number;
  percentage: number;
}

export interface SystemInstructionDetection {
  hasSystemRole: boolean;
  hasXmlOrMarkdownContract: boolean;
  hasNegativeConstraints: boolean;
  hasFewShotExamples: boolean;
  hasVerificationCriteria: boolean;
  hasChainOfThought: boolean;
  detectedSignals: string[];
  totalScore: number; // 0 to 100
  qualificationLevel: 'Minimaliste' | 'Intermédiaire' | 'Avancé' | 'Contrat d’Élite';
}

export interface PromptComplexityAnalysis {
  tokens: number;
  words: number;
  characters: number;
  vocabularyRichnessRatio: number; // Unique words / total words
  keywordDensity: KeywordDensityItem[];
  totalKeywordsDetected: number;
  systemInstructions: SystemInstructionDetection;
  complexityIndex: number; // 0 to 100
  complexityLevel: 'Simple' | 'Modéré' | 'Complexe' | 'Ultra-Réglementé';
  recommendedModelClass: string;
  analysisSummary: string;
}

const DOMAIN_KEYWORDS_LEXICON: Record<string, string[]> = {
  'Rôles & Persona': [
    'rôle', 'role', 'agis en tant', 'expert', 'architecte', 'directeur', 'consultant',
    'développeur', 'persona', 'spécialiste', 'lead', 'senior', 'copywriter', 'ingénieur',
  ],
  'Cadre & Contexte': [
    'contexte', 'context', 'environnement', 'projet', 'audience', 'cible', 'marché',
    'données', 'donnee', 'icp', 'secteur', 'b2b', 'b2c', 'existant',
  ],
  'Objectifs & Tâches': [
    'objectif', 'mission', 'tâche', 'task', 'produire', 'concevoir', 'analyser',
    'générer', 'rédiger', 'implémenter', 'créer', 'développer', 'structurer', 'livrable',
  ],
  'Contraintes & Interdits': [
    'contrainte', 'interdit', 'ne pas', 'jamais', 'sans', 'exclure', 'obligatoire',
    'impératif', 'règle', 'limite', 'anti-slop', 'aucun', 'stricte', 'validation requise',
  ],
  'Format & Structure': [
    'json', 'markdown', 'xml', 'schéma', 'tableau', 'p-r-i-e-f-v', 'c-t-c-d', 'sections',
    'hiérarchie', 'h1', 'h2', 'h3', 'code', 'modulaire',
  ],
  'Qualité & Vérification': [
    'test', 'vérification', 'validation', 'critère', 'métrique', 'kpi', 'acceptation',
    'anti-hallucination', 'auto-check', 'cohérence', 'audit', 'mesurable',
  ],
};

/**
 * Analyse la complexité globale d'un prompt :
 * 1. Tokens approximatifs (BPE SentencePiece)
 * 2. Densité et diversité lexicale des mots-clés d'ingénierie
 * 3. Présence et profondeur des instructions système (rôle, XML, contraintes négatives, Few-Shot, CoT, auto-check)
 */
export function analyzePromptComplexity(promptText: string): PromptComplexityAnalysis {
  const text = promptText.trim();
  if (!text) {
    return {
      tokens: 0,
      words: 0,
      characters: 0,
      vocabularyRichnessRatio: 0,
      keywordDensity: [],
      totalKeywordsDetected: 0,
      systemInstructions: {
        hasSystemRole: false,
        hasXmlOrMarkdownContract: false,
        hasNegativeConstraints: false,
        hasFewShotExamples: false,
        hasVerificationCriteria: false,
        hasChainOfThought: false,
        detectedSignals: [],
        totalScore: 0,
        qualificationLevel: 'Minimaliste',
      },
      complexityIndex: 0,
      complexityLevel: 'Simple',
      recommendedModelClass: 'Modèle rapide (Gemini 1.5 Flash / Flash-Lite)',
      analysisSummary: 'Prompt vide. Collez ou chargez un prompt pour inspecter sa complexité.',
    };
  }

  const tokens = countTokensApproximate(text);
  const wordsArray = text.split(/\s+/).filter(Boolean);
  const words = wordsArray.length;
  const characters = text.length;

  // Calcul de la richesse lexicale (mots uniques normalisés)
  const normalizedWords = wordsArray.map((w) =>
    w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
  ).filter((w) => w.length > 2);
  const uniqueWords = new Set(normalizedWords);
  const vocabularyRichnessRatio = words > 0 ? Math.round((uniqueWords.size / words) * 100) : 0;

  // Analyse de la densité de mots-clés d'ingénierie
  const lowerText = text.toLowerCase();
  const keywordDensity: KeywordDensityItem[] = [];
  let totalKeywordsDetected = 0;

  for (const [category, keywords] of Object.entries(DOMAIN_KEYWORDS_LEXICON)) {
    let catCount = 0;
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        catCount += matches.length;
      }
    }

    if (catCount > 0) {
      totalKeywordsDetected += catCount;
      const percentage = words > 0 ? Math.round((catCount / words) * 1000) / 10 : 0;
      keywordDensity.push({
        category,
        keyword: keywords.slice(0, 3).join(', '),
        count: catCount,
        percentage,
      });
    }
  }

  // Détection des signaux d'instructions système professionnelles
  const detectedSignals: string[] = [];
  const hasSystemRole = /(rôle|role|tu es|agis en tant que|expert|senior|directeur|architecte)\b/i.test(text);
  if (hasSystemRole) detectedSignals.push('Rôle / Persona explicite défini');

  const hasXmlOrMarkdownContract =
    /<(context|objective|instructions|constraints|role|rules|system)>[\s\S]*?<\//i.test(text) ||
    /\[(P · PERSONA|R · BUT|I · INSTRUCTIONS|E · EXEMPLES|F · FORMAT|V · VÉRIFICATION)\]/i.test(text) ||
    /#{1,3}\s+(contexte|instructions|contraintes|format|règles)/i.test(text);
  if (hasXmlOrMarkdownContract) detectedSignals.push('Balises XML ou Contrat P-R-I-E-F-V structuré');

  const hasNegativeConstraints =
    /(ne pas|jamais|sans|interdit|proscrire|éviter|zéro todo|zéro placeholder|aucun|exclure)/i.test(text);
  if (hasNegativeConstraints) detectedSignals.push('Contraintes négatives & interdits stricts');

  const hasFewShotExamples =
    /(exemple|exemples|anti-exemple|few-shot|bon exemple|cas concret|illustration)/i.test(text);
  if (hasFewShotExamples) detectedSignals.push('Exemples directifs (Few-shot / Anti-exemples)');

  const hasVerificationCriteria =
    /(critère|critères|validation|vérification|auto-check|acceptation|checklist|test unitaire|mesurable)/i.test(text);
  if (hasVerificationCriteria) detectedSignals.push('Critères de validation & Checklist d’acceptation');

  const hasChainOfThought =
    /(étape par étape|step by step|réfléchis avant|chain of thought|raisonnement|démarche)/i.test(text);
  if (hasChainOfThought) detectedSignals.push('Protocole de réflexion pas à pas (Chain-of-Thought)');

  // Score de profondeur des instructions système (0 - 100)
  let systemScore = 15;
  if (hasSystemRole) systemScore += 20;
  if (hasXmlOrMarkdownContract) systemScore += 20;
  if (hasNegativeConstraints) systemScore += 15;
  if (hasFewShotExamples) systemScore += 10;
  if (hasVerificationCriteria) systemScore += 10;
  if (hasChainOfThought) systemScore += 10;
  systemScore = Math.min(100, systemScore);

  let qualificationLevel: 'Minimaliste' | 'Intermédiaire' | 'Avancé' | 'Contrat d’Élite' = 'Minimaliste';
  if (systemScore >= 80) qualificationLevel = 'Contrat d’Élite';
  else if (systemScore >= 60) qualificationLevel = 'Avancé';
  else if (systemScore >= 40) qualificationLevel = 'Intermédiaire';

  // Calcul de l'indice de complexité composite (0 - 100)
  // Facteurs : volume de tokens (35%), profondeur des instructions système (35%), densité de mots-clés d'ingénierie (30%)
  const tokenWeight = Math.min(35, (tokens / 600) * 35);
  const systemWeight = (systemScore / 100) * 35;
  const densityWeight = Math.min(30, (totalKeywordsDetected / 20) * 30);
  const complexityIndex = Math.round(tokenWeight + systemWeight + densityWeight);

  let complexityLevel: 'Simple' | 'Modéré' | 'Complexe' | 'Ultra-Réglementé' = 'Simple';
  let recommendedModelClass = 'Modèle rapide (Gemini 1.5 Flash / Claude Haiku)';

  if (complexityIndex >= 78) {
    complexityLevel = 'Ultra-Réglementé';
    recommendedModelClass = 'Modèle de raisonnement frontière (Claude 3.7 Sonnet / Gemini 1.5 Pro / GPT-4o)';
  } else if (complexityIndex >= 55) {
    complexityLevel = 'Complexe';
    recommendedModelClass = 'Modèle d’ingénierie polyvalent (Claude 3.7 Sonnet / Gemini 3.8 Flash)';
  } else if (complexityIndex >= 35) {
    complexityLevel = 'Modéré';
    recommendedModelClass = 'Modèle standard réactif (Gemini 3.8 Flash / Claude 3.5 Sonnet)';
  }

  const analysisSummary = `Ce prompt présente une complexité ${complexityLevel.toLowerCase()} (Indice : ${complexityIndex}/100) avec environ ${tokens.toLocaleString('fr-FR')} tokens. Le niveau de formalisation système est qualifié de « ${qualificationLevel} » (${systemScore}/100), totalisant ${totalKeywordsDetected} mot(s)-clé(s) structurants.`;

  return {
    tokens,
    words,
    characters,
    vocabularyRichnessRatio,
    keywordDensity,
    totalKeywordsDetected,
    systemInstructions: {
      hasSystemRole,
      hasXmlOrMarkdownContract,
      hasNegativeConstraints,
      hasFewShotExamples,
      hasVerificationCriteria,
      hasChainOfThought,
      detectedSignals,
      totalScore: systemScore,
      qualificationLevel,
    },
    complexityIndex,
    complexityLevel,
    recommendedModelClass,
    analysisSummary,
  };
}
