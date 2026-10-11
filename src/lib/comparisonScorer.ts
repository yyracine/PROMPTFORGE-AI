import { ModelComparisonDimensionScore } from '../types/promptforge';

export interface AutoComparisonScores {
  overallScoreA: number; // 0 to 10 (1 decimal)
  overallScoreB: number; // 0 to 10 (1 decimal)
  metrics: ModelComparisonDimensionScore[];
  methodologyNote: string;
}

function clamp10(value: number): number {
  return Math.round(Math.max(0, Math.min(10, value)) * 10) / 10;
}

function extractSignificantKeywords(text: string): string[] {
  const stopWords = new Set([
    'dans', 'avec', 'pour', 'sans', 'plus', 'moins', 'comme', 'cette', 'sont',
    'etre', 'avoir', 'faire', 'tout', 'tous', 'toute', 'toutes', 'mais', 'donc',
    'alors', 'depuis', 'vers', 'chez', 'entre', 'sous', 'tres', 'bien', 'meme',
    'role', 'objectif', 'contexte', 'mission', 'format', 'sortie', 'prompt',
    'the', 'and', 'for', 'with', 'from', 'that', 'this', 'must', 'should',
  ]);
  const words = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9_]+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
  return Array.from(new Set(words));
}

function scoreSingleResponse(promptText: string, responseText: string) {
  const cleanResp = responseText.trim();
  if (!cleanResp) {
    return {
      pertinence: 0,
      contraintes: 0,
      concision: 0,
      structure: 0,
      exploitabilite: 0,
      overall: 0,
    };
  }

  const promptKeywords = extractSignificantKeywords(promptText);
  const respNormalized = cleanResp
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const wordCount = cleanResp.split(/\s+/).length;
  const lineCount = cleanResp.split(/\r?\n/).length;

  // 1. Pertinence (0-10) : couverture sémantique des termes clés du prompt
  let keywordCoverage = 0.7;
  if (promptKeywords.length > 0) {
    const matched = promptKeywords.filter((kw) => respNormalized.includes(kw)).length;
    keywordCoverage = matched / promptKeywords.length;
  }
  let pertinence = 3.5 + keywordCoverage * 5.5;
  if (wordCount >= 60) pertinence += 0.8;
  pertinence = clamp10(pertinence);

  // 2. Respect des contraintes (0-10) : format demandé, interdictions, exhaustivité
  let contraintes = 7.2;
  const wantsJson = /\bjson\b/i.test(promptText);
  const wantsXml = /\b(xml|balises)\b/i.test(promptText);
  const wantsMarkdown = /\b(markdown|tableau|table)\b/i.test(promptText);
  const forbidsTodo = /(sans todo|pas de todo|aucun todo|sans simulation|pas de mock|bout en bout)/i.test(
    promptText
  );
  const forbidsDocker = /(sans docker|aucun docker|no docker)/i.test(promptText);

  if (wantsJson) {
    const hasJsonBlock = /\{[\s\S]*\}|\[[\s\S]*\]/.test(cleanResp);
    contraintes += hasJsonBlock ? 1.8 : -2.5;
  }
  if (wantsXml) {
    const hasXmlTags = /<[a-zA-Z0-9_-]+>[\s\S]*?<\/[a-zA-Z0-9_-]+>/.test(cleanResp);
    contraintes += hasXmlTags ? 1.6 : -1.5;
  }
  if (wantsMarkdown) {
    const hasMd = /^#{1,4}\s+.+/m.test(cleanResp) || /\|.+\|/.test(cleanResp);
    contraintes += hasMd ? 1.2 : -1.2;
  }
  if (forbidsTodo && /\b(todo|fixme|à compléter|placeholder)\b/i.test(cleanResp)) {
    contraintes -= 2.5;
  } else if (forbidsTodo) {
    contraintes += 1.0;
  }
  if (forbidsDocker && /\bdockerfile|docker-compose\b/i.test(cleanResp)) {
    contraintes -= 2.5;
  }
  contraintes = clamp10(contraintes);

  // 3. Concision & Densité (0-10) : pénalise les formules de politesse creuses et répétitions
  let concision = 8.4;
  const fluffMatches =
    cleanResp.match(
      /\b(bien sûr|voici votre|avec plaisir|n'hésitez pas|j'espère que cela|en résumé, il est important de noter)\b/gi
    ) || [];
  concision -= fluffMatches.length * 0.9;
  if (wordCount < 20) concision -= 3.0;
  else if (wordCount >= 45 && wordCount <= 900) concision += 1.0;
  else if (wordCount > 1600) concision -= 1.0;
  concision = clamp10(concision);

  // 4. Clarté & Structure (0-10) : titres, listes, blocs de code, aération
  let structure = 5.0;
  const hasHeadings = /^#{1,4}\s+.+/m.test(cleanResp) || /<[a-zA-Z0-9_-]+>/.test(cleanResp);
  const hasLists = /^(\s*[-*•]|\s*\d+\.)\s+.+/m.test(cleanResp);
  const hasCodeBlocks = /```[\s\S]*?```/.test(cleanResp);
  const hasTables = /\|.+\|/.test(cleanResp);

  if (hasHeadings) structure += 2.2;
  if (hasLists) structure += 1.5;
  if (hasCodeBlocks || hasTables) structure += 1.0;
  if (lineCount >= 6) structure += 0.5;
  structure = clamp10(structure);

  // 5. Exploitabilité directe (0-10) : absence de troncature, présence d'exemples ou commandes
  let exploitabilite = 6.8;
  const hasTruncation = /(\.\.\.\s*rest of code|\/\/\s*\.\.\.|#\s*\.\.\.suite)/i.test(cleanResp);
  if (hasTruncation) exploitabilite -= 3.0;
  if (hasCodeBlocks || hasLists || hasHeadings) exploitabilite += 1.8;
  if (wordCount >= 80 && !hasTruncation) exploitabilite += 1.0;
  exploitabilite = clamp10(exploitabilite);

  const overall = clamp10(
    pertinence * 0.25 +
      contraintes * 0.25 +
      concision * 0.2 +
      structure * 0.15 +
      exploitabilite * 0.15
  );

  return {
    pertinence,
    contraintes,
    concision,
    structure,
    exploitabilite,
    overall,
  };
}

/**
 * Calcule automatiquement un scoring 0–10 côte-à-côte sur les 5 métriques prédéfinies :
 * 1. Pertinence (25 %)
 * 2. Respect des contraintes (25 %)
 * 3. Concision & Densité (20 %)
 * 4. Clarté & Structure (15 %)
 * 5. Exploitabilité directe (15 %)
 */
export function computeAutomaticComparisonScoring(
  promptText: string,
  responseA: string,
  responseB: string
): AutoComparisonScores {
  const sA = scoreSingleResponse(promptText, responseA);
  const sB = scoreSingleResponse(promptText, responseB);

  const buildComment = (a: number, b: number, metricLabel: string): string => {
    const diff = Math.round((a - b) * 10) / 10;
    if (Math.abs(diff) <= 0.3) {
      return `Équilibre sur la ${metricLabel.toLowerCase()} (${a.toFixed(1)}/10 vs ${b.toFixed(1)}/10).`;
    }
    if (diff > 0) {
      return `Modèle A devance Modèle B de +${diff.toFixed(1)} pt sur la ${metricLabel.toLowerCase()}.`;
    }
    return `Modèle B devance Modèle A de +${Math.abs(diff).toFixed(1)} pt sur la ${metricLabel.toLowerCase()}.`;
  };

  const metrics: ModelComparisonDimensionScore[] = [
    {
      dimension: 'Pertinence & Couverture',
      scoreA: sA.pertinence,
      scoreB: sB.pertinence,
      comment: buildComment(sA.pertinence, sB.pertinence, 'Pertinence & Couverture'),
    },
    {
      dimension: 'Respect des contraintes',
      scoreA: sA.contraintes,
      scoreB: sB.contraintes,
      comment: buildComment(sA.contraintes, sB.contraintes, 'Respect des contraintes'),
    },
    {
      dimension: 'Concision & Densité',
      scoreA: sA.concision,
      scoreB: sB.concision,
      comment: buildComment(sA.concision, sB.concision, 'Concision & Densité'),
    },
    {
      dimension: 'Clarté & Structure',
      scoreA: sA.structure,
      scoreB: sB.structure,
      comment: buildComment(sA.structure, sB.structure, 'Clarté & Structure'),
    },
    {
      dimension: 'Exploitabilité directe',
      scoreA: sA.exploitabilite,
      scoreB: sB.exploitabilite,
      comment: buildComment(sA.exploitabilite, sB.exploitabilite, 'Exploitabilité directe'),
    },
  ];

  return {
    overallScoreA: sA.overall,
    overallScoreB: sB.overall,
    metrics,
    methodologyNote:
      'Pondération 0–10 : Pertinence (25 %), Respect des contraintes (25 %), Concision & Densité (20 %), Clarté & Structure (15 %), Exploitabilité directe (15 %).',
  };
}
