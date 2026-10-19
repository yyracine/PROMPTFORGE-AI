import { jsPDF } from 'jspdf';
import {
  ModelComparisonDimensionScore,
  ModelComparisonResult,
  PromptEvaluationResult,
  PromptRecord,
  PromptVersion,
} from '../types/promptforge';

function toSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'rapport'
  );
}

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${str.replace(/"/g, '""')}"`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clean characters that standard jsPDF Helvetica Latin-1 font might misrender
 */
function sanitizePdfText(str: string): string {
  return String(str ?? '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[—–]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-');
}

// ============================================================================
// 1. EXPORT DES RÉSULTATS DE L'ÉVALUATEUR (8 DIMENSIONS) — CSV & PDF
// ============================================================================

export function exportEvaluation8DToCsv(
  promptText: string,
  result: PromptEvaluationResult
) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const typeLabel =
    result.evaluationType === 'ai_deep_audit'
      ? 'Audit IA Approfondi (8 dimensions)'
      : 'Analyse Structurelle Locale (8 dimensions)';

  const rows: string[][] = [
    ['Rapport', 'PromptForge AI - Evaluation Qualite 8 Dimensions'],
    ['Type Evaluation', typeLabel],
    ['Score Global (/100)', String(result.overallScore)],
    ['Date Evaluation', new Date(result.evaluatedAt).toLocaleString('fr-FR')],
    ['Methodologie', result.methodologyNote],
    ['Prompt Evalue (Extrait)', promptText.slice(0, 500)],
    [],
    ['Cle', 'Dimension', 'Score (/100)', 'Statut', 'Constat Factuel', 'Recommandation'],
  ];

  for (const dim of result.dimensions) {
    rows.push([
      dim.key,
      dim.label,
      String(dim.score),
      dim.status,
      dim.explanation,
      dim.recommendation,
    ]);
  }

  rows.push([]);
  rows.push(['Points Forts', ...(result.strengths || [])]);
  rows.push(['Priorites Amelioration', ...(result.criticalGaps || [])]);

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel under Windows opens French accents cleanly
  const csvContent =
    '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `promptforge-evaluation-8d-${dateStr}.csv`);
}

export function exportEvaluation8DToPdf(
  promptText: string,
  result: PromptEvaluationResult
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
    }
  };

  // Header Banner
  doc.setFillColor(91, 91, 214);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text("PromptForge AI - Rapport d'Evaluation (8 Dimensions)", margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const typeLabel =
    result.evaluationType === 'ai_deep_audit'
      ? "Evaluation approfondie par modele d'IA"
      : 'Analyse structurelle deterministe locale';
  doc.text(
    sanitizePdfText(
      `${typeLabel}  |  Score Global : ${result.overallScore}/100  |  Date : ${new Date(
        result.evaluatedAt
      ).toLocaleString('fr-FR')}`
    ),
    margin,
    20
  );

  y = 34;
  doc.setTextColor(23, 25, 35);

  // Methodology Note
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1. Methodologie de calcul', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const methLines = doc.splitTextToSize(
    sanitizePdfText(result.methodologyNote),
    maxLineWidth
  );
  doc.text(methLines, margin, y);
  y += methLines.length * 4.5 + 4;

  // Dimensions Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. Diagnostic detaille sur les 8 dimensions', margin, y);
  y += 6;

  for (const dim of result.dimensions) {
    const expLines = doc.splitTextToSize(
      sanitizePdfText(`Constat : ${dim.explanation}`),
      maxLineWidth - 6
    );
    const recLines = doc.splitTextToSize(
      sanitizePdfText(`Recommandation : ${dim.recommendation}`),
      maxLineWidth - 6
    );
    const boxHeight = 9 + (expLines.length + recLines.length) * 4.2;

    checkPageBreak(boxHeight + 4);

    doc.setFillColor(244, 245, 248);
    doc.roundedRect(margin, y, maxLineWidth, boxHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(23, 25, 35);
    doc.text(
      sanitizePdfText(`${dim.label} — ${dim.score}/100 (${dim.status.toUpperCase()})`),
      margin + 3,
      y + 5.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(65, 72, 86);
    let innerY = y + 10.5;
    doc.text(expLines, margin + 3, innerY);
    innerY += expLines.length * 4.2;

    doc.setTextColor(23, 25, 35);
    doc.text(recLines, margin + 3, innerY);

    y += boxHeight + 3.5;
  }

  // Strengths & Critical Gaps
  checkPageBreak(35);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(23, 25, 35);
  doc.text("3. Synthese des points forts et priorites d'amelioration", margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  for (const s of result.strengths || []) {
    const lines = doc.splitTextToSize(sanitizePdfText(`+ [Force] ${s}`), maxLineWidth);
    checkPageBreak(lines.length * 4.2 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.2;
  }
  for (const g of result.criticalGaps || []) {
    const lines = doc.splitTextToSize(
      sanitizePdfText(`! [Amelioration] ${g}`),
      maxLineWidth
    );
    checkPageBreak(lines.length * 4.2 + 2);
    doc.text(lines, margin, y);
    y += lines.length * 4.2;
  }

  // Prompt Text Appendix
  checkPageBreak(30);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('4. Contenu du prompt evalue', margin, y);
  y += 5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  const promptLines = doc.splitTextToSize(sanitizePdfText(promptText), maxLineWidth);
  for (const line of promptLines) {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 4;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`promptforge-rapport-evaluation-8d-${dateStr}.pdf`);
}

// ============================================================================
// 2. EXPORT DE LA COMPARAISON DE MODÈLES (SCORING 0-10) — CSV & PDF
// ============================================================================

export function exportModelComparisonToCsv(params: {
  promptText: string;
  modelAName: string;
  modelBName: string;
  scoreA: number;
  scoreB: number;
  metrics: ModelComparisonDimensionScore[];
  responseA: string;
  responseB: string;
  comparisonResult?: ModelComparisonResult | null;
}) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const rows: string[][] = [
    ['Rapport', 'PromptForge AI - Comparaison Cote-a-Cote des Modeles (Scoring 0-10)'],
    ['Date', new Date().toLocaleString('fr-FR')],
    ['Modele A', params.modelAName, 'Score Global A (/10)', params.scoreA.toFixed(1)],
    ['Modele B', params.modelBName, 'Score Global B (/10)', params.scoreB.toFixed(1)],
    ['Prompt Teste', params.promptText],
    [],
    [
      'Metrique Predefinie',
      `${params.modelAName} (/10)`,
      `${params.modelBName} (/10)`,
      'Ecart (A - B)',
      'Diagnostic Comparatif',
    ],
  ];

  for (const m of params.metrics) {
    const sA = Number(m.scoreA || 0);
    const sB = Number(m.scoreB || 0);
    const delta = (sA - sB).toFixed(1);
    rows.push([m.dimension, sA.toFixed(1), sB.toFixed(1), delta, m.comment]);
  }

  rows.push([]);
  rows.push([`Reponse Complete ${params.modelAName}`, params.responseA]);
  rows.push([`Reponse Complete ${params.modelBName}`, params.responseB]);

  if (params.comparisonResult?.comparisonAnalysis?.promptImprovementTip) {
    rows.push([
      'Recommandation Amelioration Prompt',
      params.comparisonResult.comparisonAnalysis.promptImprovementTip,
    ]);
  }

  const csvContent =
    '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `promptforge-comparaison-modeles-${dateStr}.csv`);
}

export function exportModelComparisonToPdf(params: {
  promptText: string;
  modelAName: string;
  modelBName: string;
  scoreA: number;
  scoreB: number;
  metrics: ModelComparisonDimensionScore[];
  responseA: string;
  responseB: string;
  comparisonResult?: ModelComparisonResult | null;
}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
    }
  };

  doc.setFillColor(91, 91, 214);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PromptForge AI - Rapport Comparatif de Modeles (Scoring 0-10)', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    sanitizePdfText(
      `${params.modelAName} (${params.scoreA.toFixed(1)}/10)  vs  ${
        params.modelBName
      } (${params.scoreB.toFixed(1)}/10)  |  ${new Date().toLocaleString('fr-FR')}`
    ),
    margin,
    20
  );

  y = 34;
  doc.setTextColor(23, 25, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. Grille de Scoring Automatique (Echelle 0-10)', margin, y);
  y += 6;

  for (const m of params.metrics) {
    const sA = Number(m.scoreA || 0).toFixed(1);
    const sB = Number(m.scoreB || 0).toFixed(1);
    const commentLines = doc.splitTextToSize(
      sanitizePdfText(m.comment),
      maxLineWidth - 6
    );
    const boxHeight = 10 + commentLines.length * 4.2;
    checkPageBreak(boxHeight + 3);

    doc.setFillColor(244, 245, 248);
    doc.roundedRect(margin, y, maxLineWidth, boxHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(23, 25, 35);
    doc.text(
      sanitizePdfText(
        `${m.dimension}  —  ${params.modelAName}: ${sA}/10  |  ${params.modelBName}: ${sB}/10`
      ),
      margin + 3,
      y + 5.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(65, 72, 86);
    doc.text(commentLines, margin + 3, y + 10);

    y += boxHeight + 3;
  }

  // Prompt
  checkPageBreak(25);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(23, 25, 35);
  doc.text('2. Prompt soumis aux deux modeles', margin, y);
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  for (const line of doc.splitTextToSize(sanitizePdfText(params.promptText), maxLineWidth)) {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 4;
  }

  // Response A
  checkPageBreak(25);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(
    sanitizePdfText(`3. Reponse Modele A : ${params.modelAName} (${params.scoreA.toFixed(1)}/10)`),
    margin,
    y
  );
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  for (const line of doc.splitTextToSize(
    sanitizePdfText(params.responseA || '(Vide)'),
    maxLineWidth
  )) {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 4;
  }

  // Response B
  checkPageBreak(25);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(
    sanitizePdfText(`4. Reponse Modele B : ${params.modelBName} (${params.scoreB.toFixed(1)}/10)`),
    margin,
    y
  );
  y += 5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  for (const line of doc.splitTextToSize(
    sanitizePdfText(params.responseB || '(Vide)'),
    maxLineWidth
  )) {
    checkPageBreak(5);
    doc.text(line, margin, y);
    y += 4;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`promptforge-rapport-comparatif-${dateStr}.pdf`);
}

// ============================================================================
// 3. EXPORT DE L'HISTORIQUE DES VERSIONS D'UN PROMPT — CSV & PDF
// ============================================================================

export function exportVersionHistoryToCsv(
  prompt: PromptRecord | { title: string; domain?: string; target_model?: string },
  versions: PromptVersion[]
) {
  const slug = toSlug(prompt.title);
  const rows: string[][] = [
    ['Rapport', 'PromptForge AI - Historique des Versions'],
    ['Prompt', prompt.title],
    ['Domaine', prompt.domain || 'Non specifie'],
    ['Modele Cible', prompt.target_model || 'Non specifie'],
    ['Total Versions', String(versions.length)],
    ['Export Date', new Date().toLocaleString('fr-FR')],
    [],
    [
      'Version',
      'Date et Heure',
      'Type Modification',
      'Mode Utilise',
      'Fournisseur',
      'Modele',
      'Note de Modification',
      'Nombre de Mots',
      'Contenu Complet du Prompt',
    ],
  ];

  for (const v of versions) {
    const wordCount = v.content.trim() ? v.content.trim().split(/\s+/).length : 0;
    rows.push([
      `v${v.version_number}`,
      new Date(v.created_at).toLocaleString('fr-FR'),
      v.is_manual_edit ? 'Edition manuelle' : 'Generation / Optimisation IA',
      v.mode_used,
      v.provider,
      v.model,
      v.change_summary,
      String(wordCount),
      v.content,
    ]);
  }

  const csvContent =
    '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `promptforge-historique-versions-${slug}.csv`);
}

export function exportVersionHistoryToPdf(
  prompt: PromptRecord | { title: string; domain?: string; target_model?: string },
  versions: PromptVersion[]
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxLineWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 15) {
      doc.addPage();
      y = 18;
    }
  };

  doc.setFillColor(91, 91, 214);
  doc.rect(0, 0, pageWidth, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("PromptForge AI - Rapport d'Historique des Versions", margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    sanitizePdfText(
      `Prompt : ${prompt.title}  |  ${versions.length} version(s)  |  Export : ${new Date().toLocaleString(
        'fr-FR'
      )}`
    ),
    margin,
    20
  );

  y = 34;
  doc.setTextColor(23, 25, 35);

  for (const v of versions) {
    checkPageBreak(25);

    doc.setFillColor(241, 243, 247);
    doc.roundedRect(margin, y, maxLineWidth, 14, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(23, 25, 35);
    doc.text(
      sanitizePdfText(
        `Version v${v.version_number}  —  ${v.change_summary} (${
          v.is_manual_edit ? 'Edition manuelle' : `Mode ${v.mode_used}`
        })`
      ),
      margin + 3,
      y + 5.5
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 88, 104);
    const wordCount = v.content.trim() ? v.content.trim().split(/\s+/).length : 0;
    doc.text(
      sanitizePdfText(
        `Date : ${new Date(v.created_at).toLocaleString('fr-FR')}  |  Modele : ${
          v.model
        }  |  ${wordCount} mots`
      ),
      margin + 3,
      y + 11
    );

    y += 18;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(23, 25, 35);
    const contentLines = doc.splitTextToSize(sanitizePdfText(v.content), maxLineWidth);
    for (const line of contentLines) {
      checkPageBreak(5);
      doc.text(line, margin, y);
      y += 4;
    }

    y += 6;
  }

  const slug = toSlug(prompt.title);
  doc.save(`promptforge-historique-versions-${slug}.pdf`);
}

// ============================================================================
// 4. EXPORT DES PROMPTS DE LA BIBLIOTHÈQUE (CSV & JSON)
// ============================================================================

export function exportPromptsToCsv(
  prompts: PromptRecord[],
  categoryMap: Map<string, string>,
  scopeName = 'bibliotheque'
) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const rows: string[][] = [
    [
      'ID',
      'Titre',
      'Description',
      'Dossier / Categorie',
      'Domaine',
      'Modele Cible',
      'Fournisseur Cible',
      'Format de Sortie',
      'Tags',
      'Favori',
      'Usage Count',
      'Contenu Genere',
      'Prompt Original (Input)',
      'Date de Creation',
      'Derniere Modification',
    ],
  ];

  for (const p of prompts) {
    rows.push([
      p.id,
      p.title,
      p.description || '',
      categoryMap.get(p.category_id) || 'Non classe',
      p.domain || '',
      p.target_model || '',
      p.target_provider || '',
      p.output_format || 'markdown',
      Array.isArray(p.tags) ? p.tags.join(', ') : '',
      p.is_favorite ? 'Oui' : 'Non',
      p.usage_count?.toString() || '0',
      p.generated_content || '',
      p.original_input || '',
      p.created_at || '',
      p.updated_at || '',
    ]);
  }

  // BOM UTF-8 for perfect display in Excel / Numbers
  const csvContent =
    '\uFEFF' + rows.map((r) => r.map(escapeCsvCell).join(';')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `promptforge-prompts-${scopeName}-${dateStr}.csv`);
}

export function exportPromptsToJson(
  prompts: PromptRecord[],
  categoryMap: Map<string, string>,
  scopeName = 'bibliotheque'
) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const jsonPayload = {
    schemaVersion: '1.0.0',
    application: 'PromptForge AI',
    exportType: 'prompts_library',
    exportedAt: new Date().toISOString(),
    totalPrompts: prompts.length,
    prompts: prompts.map((p) => ({
      ...p,
      category_name: categoryMap.get(p.category_id) || 'Non classé',
    })),
  };

  const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  triggerDownload(blob, `promptforge-prompts-${scopeName}-${dateStr}.json`);
}
