import { EvaluationDimension, PromptEvaluationResult } from '../types/promptforge';

/**
 * Analyse structurelle heuristique déterministe d'un prompt sur 8 dimensions.
 * Documente explicitement la méthode de calcul pour ne jamais faire passer
 * cette heuristique pour une mesure scientifique.
 */
export function evaluatePromptHeuristically(promptText: string): PromptEvaluationResult {
  const text = promptText.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const lineCount = text ? text.split(/\r?\n/).length : 0;

  // Détection de marqueurs structurels (titres Markdown, balises XML, listes)
  const hasHeadings = /^#{1,4}\s+.+/m.test(text) || /<[a-zA-Z0-9_-]+>[\s\S]*?<\/[a-zA-Z0-9_-]+>/.test(text);
  const hasLists = /^(\s*[-*•]|\s*\d+\.)\s+.+/m.test(text);
  const hasRole = /(rôle|role|agis en tant|tu es|expert|architecte|développeur|consultant|spécialiste)/i.test(text);
  const hasContext = /(contexte|context|environnement|projet|cible|audience|situation|existant|stack)/i.test(text);
  const hasObjective = /(objectif|mission|but|tâche|task|goal|créer|concevoir|analyser|générer|implémenter|rédiger)/i.test(text);
  const hasConstraints = /(contrainte|interdit|ne pas|jamais|obligatoire|impératif|sans|limite|règle|éviter|strictement)/i.test(text);
  const hasOutputFormat = /(format|sortie|output|json|markdown|xml|tableau|structure attendue|livrable|sections)/i.test(text);
  const hasVerification = /(critère|validation|vérifi|test|acceptation|qualité|succès|contrôle|preuve|mesurable)/i.test(text);

  // Détection d'ambiguïtés lexicales fréquentes
  const vagueMatches = text.match(/\b(quelque chose|etc\.?|peut-être|un peu|genre|truc|vite fait|si possible|améliorer ça)\b/gi) || [];

  // Détection spécifique d'un prompt de Landing Page / Page de vente / CRO
  const isLandingPagePrompt = /(landing\s*page|page\s*d['’]atterrissage|page\s*de\s*vente|above[- ]the[- ]fold|hero\s*section|taux\s*de\s*conversion|\bcro\b)/i.test(text);
  const hasLandingCta = /(\bcta\b|appel\s*à\s*l['’]action|call[- ]to[- ]action|bouton\s*d['’]action)/i.test(text);
  const hasLandingProof = /(preuve\s*sociale|témoignage|avant\s*\/\s*après|chiffré|tabular-nums|étude\s*de\s*cas|bénéfice\s*mesurable)/i.test(text);
  const hasLandingObjections = /(\bfaq\b|objection|garantie|réassurance|pricing|tarif)/i.test(text);
  const hasLandingDesignRules = /(60-30-10|bento|top\s*bar|anti-slop|wcag|responsive|mobile|typography|typographie)/i.test(text);

  const getStatus = (score: number): 'excellent' | 'bon' | 'moyen' | 'faible' => {
    if (score >= 82) return 'excellent';
    if (score >= 65) return 'bon';
    if (score >= 45) return 'moyen';
    return 'faible';
  };

  // 1. Clarté
  let clarteScore = 45;
  if (hasHeadings) clarteScore += 25;
  if (hasLists) clarteScore += 15;
  if (lineCount >= 4) clarteScore += 10;
  clarteScore -= Math.min(25, vagueMatches.length * 8);
  clarteScore = Math.max(15, Math.min(98, clarteScore));

  // 2. Précision
  let precisionScore = 40;
  if (wordCount >= 40) precisionScore += 20;
  if (wordCount >= 100) precisionScore += 15;
  if (hasRole) precisionScore += 12;
  if (vagueMatches.length === 0 && wordCount > 20) precisionScore += 10;
  precisionScore = Math.max(15, Math.min(96, precisionScore));

  // 3. Contexte
  let contexteScore = hasContext ? 78 : 35;
  if (wordCount >= 60 && hasContext) contexteScore += 14;
  if (hasRole) contexteScore += 5;
  contexteScore = Math.max(15, Math.min(96, contexteScore));

  // 4. Cohérence
  let coherenceScore = 65;
  if (hasHeadings && hasObjective) coherenceScore += 20;
  if (hasLists) coherenceScore += 8;
  coherenceScore = Math.max(25, Math.min(96, coherenceScore));

  // 5. Qualité des contraintes
  let contraintesScore = hasConstraints ? 80 : 30;
  if (hasConstraints && hasLists) contraintesScore += 12;
  contraintesScore = Math.max(15, Math.min(96, contraintesScore));

  // 6. Définition du résultat attendu
  let resultatScore = hasObjective ? 72 : 32;
  if (hasOutputFormat) resultatScore += 16;
  if (wordCount >= 50) resultatScore += 6;
  resultatScore = Math.max(15, Math.min(96, resultatScore));

  // 7. Pertinence du format de sortie
  let formatScore = hasOutputFormat ? 84 : 34;
  if (hasHeadings && hasOutputFormat) formatScore += 10;
  formatScore = Math.max(15, Math.min(97, formatScore));

  // 8. Vérifiabilité
  let verifiabiliteScore = hasVerification ? 82 : 28;
  if (hasConstraints && hasVerification) verifiabiliteScore += 12;
  verifiabiliteScore = Math.max(15, Math.min(96, verifiabiliteScore));

  const dimensions: EvaluationDimension[] = [
    {
      key: 'clarte',
      label: 'Clarté',
      score: clarteScore,
      status: getStatus(clarteScore),
      explanation: hasHeadings
        ? 'Le prompt utilise des sections visuelles ou balises facilitant la séparation des consignes.'
        : 'Le texte est monolithique et manque de délimitations visuelles (titres Markdown # ou balises XML).',
      recommendation: hasHeadings
        ? 'Maintenir des intitulés de sections courts et univoques.'
        : 'Découper le prompt avec des titres Markdown (# RÔLE, # OBJECTIF, # FORMAT) ou des balises XML.',
    },
    {
      key: 'precision',
      label: 'Précision',
      score: precisionScore,
      status: getStatus(precisionScore),
      explanation:
        vagueMatches.length > 0
          ? `Termes imprécis détectés (${vagueMatches.slice(0, 3).join(', ')}). Longueur : ${wordCount} mots.`
          : `Vocabulaire direct (${wordCount} mots) sans marqueurs d'hésitation manifestes.`,
      recommendation:
        vagueMatches.length > 0
          ? 'Remplacer les formulations ouvertes ("etc.", "quelque chose") par des exigences explicites et dénombrables.'
          : 'Spécifier les versions exactes des technologies ou les volumes attendus (ex: nombre de sections ou de mots).',
    },
    {
      key: 'contexte',
      label: 'Contexte',
      score: contexteScore,
      status: getStatus(contexteScore),
      explanation: hasContext
        ? 'Le cadre opérationnel, technique ou métier est mentionné dans la demande.'
        : 'Aucun contexte explicite (environnement, public cible, état existant) n’a été détecté.',
      recommendation: hasContext
        ? 'Préciser les contraintes de l’environnement cible (ex: Windows sans Docker, base SQLite existante).'
        : 'Ajouter une section # CONTEXTE décrivant le projet, l’utilisateur final et l’existant.',
    },
    {
      key: 'coherence',
      label: 'Cohérence',
      score: coherenceScore,
      status: getStatus(coherenceScore),
      explanation:
        hasRole && hasObjective
          ? 'L’alignement entre l’expertise assignée à l’IA et la mission demandée est bien structuré.'
          : 'L’articulation entre le rôle de l’IA, l’objectif et les étapes d’exécution reste implicite.',
      recommendation:
        'Vérifier que chaque instruction détaillée concourt directement à l’objectif sans injonction contradictoire.',
    },
    {
      key: 'contraintes',
      label: 'Qualité des contraintes',
      score: contraintesScore,
      status: getStatus(contraintesScore),
      explanation: hasConstraints
        ? 'Des règles impératives ou des interdictions ("Ne pas...", "Obligatoire") balisent la génération.'
        : 'Absence de garde-fous : le modèle risque d’extrapoler ou d’utiliser des solutions génériques non souhaitées.',
      recommendation: hasConstraints
        ? 'Regrouper toutes les contraintes négatives et techniques dans une liste numérotée dédiée.'
        : 'Ajouter une section # CONTRAINTES listant explicitement ce que l’IA ne doit jamais faire (ex: pas de mocks, pas de Docker).',
    },
    {
      key: 'resultat_attendu',
      label: 'Définition du résultat attendu',
      score: resultatScore,
      status: getStatus(resultatScore),
      explanation: hasObjective
        ? 'L’action principale et la finalité du livrable sont exprimées.'
        : 'Le livrable final attendu reste flou ou non formulé par des verbes d’action.',
      recommendation:
        'Décrire concrètement à quoi ressemble une réponse complète et exploitable dès la première lecture.',
    },
    {
      key: 'format_sortie',
      label: 'Pertinence du format de sortie',
      score: formatScore,
      status: getStatus(formatScore),
      explanation: hasOutputFormat
        ? 'Le format de restitution (Markdown, XML, JSON, structure de fichiers) est spécifié.'
        : 'Le format de sortie n’est pas imposé ; le modèle choisira une mise en forme arbitraire.',
      recommendation: hasOutputFormat
        ? 'Fournir un gabarit ou l’ordre exact des blocs attendus dans la réponse.'
        : 'Ajouter une section # FORMAT DE SORTIE précisant la structure exacte (ex: Arborescence + Code complet + Commandes).',
    },
    {
      key: 'verifiabilite',
      label: 'Vérifiabilité',
      score: verifiabiliteScore,
      status: getStatus(verifiabiliteScore),
      explanation: hasVerification
        ? 'Des critères de validation, de test ou d’acceptation permettent de contrôler la réponse.'
        : 'Aucun critère d’acceptation ou d’auto-contrôle n’est défini pour vérifier le résultat.',
      recommendation: hasVerification
        ? 'Demander à l’IA de vérifier sa propre sortie contre cette liste avant de conclure.'
        : 'Ajouter une section # CRITÈRES D’ACCEPTATION avec 3 à 5 conditions objectives de réussite.',
    },
  ];

  const overallScore = Math.round(
    dimensions.reduce((acc, dim) => acc + dim.score, 0) / dimensions.length
  );

  const strengths = dimensions
    .filter((d) => d.score >= 75)
    .map((d) => `${d.label} solide (${d.score}/100)`);
  const criticalGaps = dimensions
    .filter((d) => d.score < 55)
    .map((d) => `${d.label} à renforcer : ${d.recommendation}`);

  if (isLandingPagePrompt) {
    if (!hasLandingCta) {
      criticalGaps.push(
        'Landing Page — CTA & Réassurance : Préciser un appel à l’action (CTA) primaire unique orienté résultat accompagné d’une micro-copie de réassurance.'
      );
    }
    if (!hasLandingProof) {
      criticalGaps.push(
        'Landing Page — Preuve & Mécanisme : Exiger la chaîne Fonctionnalité → Mécanisme → Bénéfice chiffré, un comparatif Avant/Après et des métriques en tabular-nums.'
      );
    }
    if (!hasLandingObjections) {
      criticalGaps.push(
        'Landing Page — Objections & Offre : Inclure une grille tarifaire/offre transparente et une FAQ décisive traitant les 5-6 objections majeures.'
      );
    }
    if (!hasLandingDesignRules) {
      criticalGaps.push(
        'Landing Page — Design & Anti-Slop : Spécifier le contrat Top Bar 3 zones, la règle 60-30-10, une grille Bento asymétrique et l’interdiction du jargon creux.'
      );
    }
    if (hasLandingCta && hasLandingProof && hasLandingObjections && hasLandingDesignRules) {
      strengths.push('Architecture Landing Page & CRO complète (Hero, Mécanisme, Preuve, FAQ, Design 60-30-10)');
    }
  }

  return {
    evaluationType: 'structural_heuristic',
    overallScore,
    methodologyNote:
      'Analyse structurelle heuristique locale : calcul déterministe basé sur la présence de balises/sections (Rôle, Contexte, Objectif, Contraintes, Format, Critères de validation), la densité lexicale et la détection de termes vagues. Cet indice évalue la rigueur formelle du prompt et ne remplace ni un audit sémantique par IA ni un test d’exécution réel.',
    dimensions,
    strengths:
      strengths.length > 0
        ? strengths
        : ['Le prompt constitue une première base de travail pouvant être structurée.'],
    criticalGaps:
      criticalGaps.length > 0
        ? criticalGaps
        : ['Aucune lacune structurelle majeure détectée par l’analyse heuristique.'],
    evaluatedAt: new Date().toISOString(),
  };
}
