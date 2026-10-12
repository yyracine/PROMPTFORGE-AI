import { Category, ProfessionalDomain } from '../types/promptforge';

export interface ContextualSuggestionProfile {
  categoryId: string;
  categoryLabel: string;
  recommendedDomain: ProfessionalDomain;
  recommendedRole: string;
  keywords: string[];
  roleSuggestions: string[];
  constraintSnippets: string[];
  objectiveStarters: string[];
}

export const CATEGORY_AUTOCOMPLETE_PROFILES: Record<string, ContextualSuggestionProfile> = {
  'cat-dev': {
    categoryId: 'cat-dev',
    categoryLabel: 'Développement logiciel',
    recommendedDomain: 'Développement logiciel',
    recommendedRole: 'Architecte Logiciel & Développeur Full-Stack Senior',
    keywords: [
      'API RESTful',
      'Django REST Framework',
      'React 19 + TypeScript',
      'SQLite en mode WAL',
      'Validation stricte des entrées',
      'Tests unitaires Pytest',
      'Architecture modulaire découplée',
      'Gestion explicite des erreurs HTTP',
      'Sans Docker (natif Windows)',
      'Authentification JWT / Session',
      'Pagination et filtrage',
      'Typage strict sans any',
      'Services métier isolés',
      'Zéro mock / implémentation réelle',
    ],
    roleSuggestions: [
      'Architecte Logiciel & Développeur Full-Stack Senior',
      'Ingénieur Backend Python / Django 5 Expert',
      'Architecte Frontend React 19 & TypeScript',
      'Auditeur Qualité Code & Sécurité Applicative',
    ],
    constraintSnippets: [
      'Fournir le code complet et fonctionnel sans placeholders ni TODOs.',
      'Compatibilité native Windows 11 via PowerShell sans dépendance Docker.',
      'Séparer strictement la couche de routage HTTP de la logique métier.',
    ],
    objectiveStarters: [
      'Concevoir et implémenter de bout en bout un module complet de ',
      'Refactoriser et sécuriser l’architecture de ',
    ],
  },
  'cat-tech': {
    categoryId: 'cat-tech',
    categoryLabel: 'Technique & DevOps',
    recommendedDomain: 'Architecture logicielle',
    recommendedRole: 'Ingénieur Système, DevOps & Sécurité Infrastructure',
    keywords: [
      'Scripts PowerShell (.ps1)',
      'Durcissement sécurité OWASP Top 10',
      'Sauvegarde automatisée SQLite',
      'Journalisation structurée JSON',
      'Diagnostic de performance',
      'Requêtes SQL paramétrées',
      'Variables d’environnement (.env)',
      'Contrôle de santé (/api/health)',
      'Gestion des processus et ports',
      'Protection CSRF / CORS',
      'Pipeline CI/CD reproductible',
      'Indexation et plan d’exécution SQL',
    ],
    roleSuggestions: [
      'Ingénieur Système, DevOps & Sécurité Infrastructure',
      'Architecte Base de Données & Performance SQL',
      'Expert Cybersécurité & Durcissement Applicatif (AppSec)',
    ],
    constraintSnippets: [
      'Ne jamais exposer de clés API ou secrets dans les journaux ou côté client.',
      'Garantir l’idempotence des scripts d’installation et de déploiement.',
      'Prévoir un mécanisme de retour arrière (rollback) sans perte de données.',
    ],
    objectiveStarters: [
      'Automatiser et sécuriser le déploiement local de ',
      'Auditer la sécurité et optimiser les performances de ',
    ],
  },
  'cat-landing': {
    categoryId: 'cat-landing',
    categoryLabel: 'Landing Pages & CRO',
    recommendedDomain: 'Landing Pages & Conversion (CRO)',
    recommendedRole: 'Architecte de Conversion (CRO), UX Writer & Designer Frontend Senior',
    keywords: [
      'Section d’accroche principale (Test des 5 secondes)',
      'Barre supérieure contractuelle en 3 zones',
      'Proposition de valeur unique (UVP)',
      'Chaîne Fonctionnalité → Mécanisme → Bénéfice mesurable',
      'Grille asymétrique modulaire (col-span-2 / col-span-1)',
      'Démonstration produit concrète Avant / Après',
      'Appel à l’action primaire orienté résultat + réassurance',
      'Preuves vérifiables (chiffres tabulaires) & cas concrets',
      'Intégrité des données (interdiction d’inventer des chiffres)',
      'Harmonie visuelle 60-30-10 & accessibilité WCAG AA',
      'Typographie 2+1 (Titres équilibrés + Corps lisible + Monospace)',
      'Discipline anti-encombrement (sans badges superflus, sans bordures épaisses)',
      'Grille tarifaire transparente par profil d’usage',
      'Foire aux questions traitant les 6 objections majeures',
      'Formulaire de contact avec validation et traitement réel',
      'Optimisation sémantique HTML5, OpenGraph et données structurées',
    ],
    roleSuggestions: [
      'Architecte de Conversion (CRO), UX Writer & Designer Frontend Senior',
      'Directeur Artistique Web & Développeur React + Tailwind CSS',
      'Product Marketer B2B SaaS & Spécialiste Copywriting Persuasion',
      'Auditeur CRO & Expert Accessibilité / Performance Web',
    ],
    constraintSnippets: [
      'Respecter le contrat de barre supérieure en 3 zones (Logo typographique · 4-5 liens d’ancrage · 1 bouton d’action principal) et la règle 60-30-10.',
      'Bannir le jargon creux ("boostez", "révolutionnez") et le texte factice : rédiger un argumentaire persuasif complet.',
      'Intégrité commerciale absolue : ne jamais inventer de statistiques, de faux clients ou de témoignages non vérifiés ; privilégier la démonstration produit.',
      'Appliquer la discipline anti-encombrement : aucune boîte imbriquée, zéro bordure gauche épaisse, séparateurs typographiques discrets (·) au lieu de badges.',
      'Structurer selon la séquence : Accroche & Démonstrateur -> Diagnostic Avant/Après -> Mécanismes clés -> Preuves vérifiables -> Tarifs -> Objections -> Capture validée.',
      'Compatibilité Windows native sans Docker et protocole de vérification préalable (audit, tests, compilation de production).',
    ],
    objectiveStarters: [
      'Concevoir et coder une Landing Page à haute conversion (UI/UX + Copywriting intégral) pour ',
      'Rédiger l’architecture persuasive, le copywriting section par section et le code React/Tailwind de la Landing Page de ',
    ],
  },
  'cat-mkt': {
    categoryId: 'cat-mkt',
    categoryLabel: 'Marketing',
    recommendedDomain: 'Marketing & Copywriting',
    recommendedRole: 'Directeur Marketing Produit & Expert Copywriting Conversion (CRO)',
    keywords: [
      'Proposition de valeur unique (UVP)',
      'Page de vente haute conversion (Accroche + Grille + Tarifs + FAQ)',
      'Chaîne Fonctionnalité → Mécanisme → Bénéfice chiffré',
      'Méthode persuasive AIDA / PAS',
      'Bouton d’action principal orienté résultat + réassurance',
      'Preuves vérifiables (chiffres tabulaires) & cas concrets',
      'Comparatif factuel Avant / Après sans jargon creux',
      'Traitement décisif des objections clients',
      'Profil client cible & irritants prioritaires',
      'Accroche principale visible immédiatement (Test des 5 secondes)',
      'Séquence d’accueil par courrier électronique',
      'Positionnement concurrentiel différenciant',
      'Optimisation de conversion & Harmonie visuelle 60-30-10',
      'Offre de lancement et garantie de satisfaction',
    ],
    roleSuggestions: [
      'Directeur Marketing Produit & Expert Copywriting Conversion (CRO)',
      'Stratège Croissance & Acquisition B2B/SaaS',
      'Concepteur-Rédacteur Senior spécialisé Pages de Vente',
    ],
    constraintSnippets: [
      'Bannir le jargon générique et les superlatifs vagues ; relier chaque fonctionnalité à son mécanisme concret et à un bénéfice mesurable.',
      'Structurer chaque section avec Titre H1/H2 (équilibrage visuel), Sous-titre, Preuve adjacente, Réassurance et Action explicite.',
      'Respecter l’esthétique anti-encombrement (Barre supérieure en 3 zones, règle 60-30-10, séparateurs typographiques discrets, chiffres tabulaires).',
    ],
    objectiveStarters: [
      'Rédiger l’architecture complète et le copywriting d’une Landing Page à haute conversion pour ',
      'Structurer une campagne d’acquisition et de conversion destinée à ',
    ],
  },
  'cat-seo': {
    categoryId: 'cat-seo',
    categoryLabel: 'SEO & Rédaction Web',
    recommendedDomain: 'Marketing & Copywriting',
    recommendedRole: 'Consultant SEO Senior & Architecte Sémantique Web',
    keywords: [
      'Intention de recherche (Search Intent)',
      'Cocon sémantique & pages piliers',
      'Mots-clés longue traîne',
      'Maillage interne stratégique',
      'Balises Title & Meta Description',
      'Hiérarchie Hn (H1, H2, H3)',
      'Données structurées Schema.org (JSON-LD)',
      'Optimisation E-E-A-T',
      'Champ lexical & entités nommées',
      'FAQ optimisée Featured Snippets',
      'Audit technique d’indexabilité',
      'Brief éditorial SEO complet',
    ],
    roleSuggestions: [
      'Consultant SEO Senior & Architecte Sémantique Web',
      'Rédacteur Web SEO Expert en Cocons Sémantiques',
      'Spécialiste SEO Technique & Données Structurées Schema.org',
    ],
    constraintSnippets: [
      'Respecter strictement la hiérarchie sémantique H1 unique puis H2/H3.',
      'Intégrer naturellement les mots-clés principaux et secondaires sans suroptimisation.',
      'Fournir les balises Title (< 60 caractères) et Meta Description (< 155 caractères).',
    ],
    objectiveStarters: [
      'Concevoir la stratégie de cocon sémantique et le brief SEO complet pour ',
      'Rédiger un article pilier optimisé SEO répondant à l’intention de recherche ',
    ],
  },
  'cat-ent': {
    categoryId: 'cat-ent',
    categoryLabel: 'Entrepreneuriat',
    recommendedDomain: 'Entrepreneuriat & Marché',
    recommendedRole: 'Conseiller Stratégique Startup, Product Manager & Analyste Venture',
    keywords: [
      'Validation de MVP (Minimum Viable Product)',
      'Étude de marché TAM / SAM / SOM',
      'Modèle économique (Pricing & Unit Economics)',
      'Coût d’acquisition client (CAC) vs LTV',
      'Matrice concurrentielle',
      'Go-To-Market (GTM) Strategy',
      ' Feuille de route produit (Roadmap 90 jours)',
      'Hypothèses de risque et tests terrain',
      'Pitch Deck investisseurs',
      'Segmentation des premiers adoptants (Early Adopters)',
    ],
    roleSuggestions: [
      'Conseiller Stratégique Startup, Product Manager & Analyste Venture',
      'Architecte Produit SaaS & Spécialiste Go-To-Market',
      'Analyste Financier & Business Model Strategist',
    ],
    constraintSnippets: [
      'Chiffrer les hypothèses économiques et distinguer clairement faits et estimations.',
      'Prioriser les fonctionnalités selon le ratio impact utilisateur / effort de développement.',
    ],
    objectiveStarters: [
      'Élaborer le plan de validation MVP et le modèle économique pour ',
      'Réaliser l’analyse concurrentielle et la stratégie Go-To-Market de ',
    ],
  },
  'cat-vid': {
    categoryId: 'cat-vid',
    categoryLabel: 'Vidéo & Médias IA',
    recommendedDomain: 'Marketing & Copywriting',
    recommendedRole: 'Réalisateur Vidéo IA, Directeur de la Photographie & Prompt Artist (Veo / Sora / Runway)',
    keywords: [
      'Mouvement de caméra ( Traveling / Dolly zoom / Drone )',
      'Éclairage cinématographique (Golden hour / Néon / Clair-obscur)',
      'Focale 35mm anamorphique',
      'Continuité visuelle multi-plans',
      'Storyboard séquentiel minuté',
      'Accroche visuelle (Hook 3 premières secondes)',
      'Voix-off & Sound Design (SFX)',
      'Format vertical 9:16 (Reels / Shorts / TikTok)',
      'Format cinématique 16:9 (4K 24fps)',
      'Texture photoréaliste & profondeur de champ',
    ],
    roleSuggestions: [
      'Réalisateur Vidéo IA, Directeur de la Photographie & Prompt Artist (Veo / Sora / Runway)',
      'Scénariste & Storyboarder de Vidéos Produit / Publicitaires',
      'Créateur de Contenus Vidéo Courts Haute Rétention (Shorts / Reels)',
    ],
    constraintSnippets: [
      'Décrire précisément chaque plan : sujet, action, cadrage, mouvement de caméra et lumière.',
      'Fournir les prompts visuels prêts à copier pour les générateurs vidéo IA ainsi que le script voix-off.',
    ],
    objectiveStarters: [
      'Concevoir le storyboard plan par plan et les prompts vidéo IA pour ',
      'Scénariser une vidéo de démonstration produit percutante sur ',
    ],
  },
  'cat-ana': {
    categoryId: 'cat-ana',
    categoryLabel: 'Analyse et productivité',
    recommendedDomain: 'Analyse & Rédaction',
    recommendedRole: 'Analyste Principal, Chercheur & Rédacteur Exécutif',
    keywords: [
      'Synthèse exécutive structurée',
      'Matrice décisionnelle multicritère',
      'Extraction de données en tableau Markdown',
      'Analyse des risques et mesures de mitigation',
      'Plan d’action opérationnel (30/60/90 jours)',
      'Indicateurs clés de performance (KPI)',
      'Vérification factuelle sans extrapolation',
      'Compte-rendu structuré et livrables',
    ],
    roleSuggestions: [
      'Analyste Principal, Chercheur & Rédacteur Exécutif',
      'Directeur des Opérations & Consultant en Productivité',
      'Ingénieur Documentaire & Synthèse Technique',
    ],
    constraintSnippets: [
      'Synthétiser les points clés en tête de document avant le développement détaillé.',
      'Ne jamais inventer de données chiffrées non présentes dans le contexte fourni.',
    ],
    objectiveStarters: [
      'Produire une synthèse analytique complète et un plan d’action pour ',
      'Extraire et structurer les enseignements clés concernant ',
    ],
  },
};

/**
 * Retourne le profil d'auto-complétion contextuel correspondant à la catégorie sélectionnée
 * (y compris pour les dossiers métiers personnalisés créés par l'utilisateur).
 */
export function getContextualSuggestionsForCategory(
  categoryId: string,
  categories: Category[],
  domainFallback?: ProfessionalDomain
): ContextualSuggestionProfile {
  if (CATEGORY_AUTOCOMPLETE_PROFILES[categoryId]) {
    return CATEGORY_AUTOCOMPLETE_PROFILES[categoryId];
  }

  const folder = categories.find((c) => c.id === categoryId);
  const nameLower = (folder?.name || '').toLowerCase();

  if (
    nameLower.includes('landing') ||
    nameLower.includes('conversion') ||
    nameLower.includes('cro') ||
    nameLower.includes('page de vente')
  ) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-landing'],
      categoryId,
      categoryLabel: folder?.name || 'Landing Pages & CRO',
    };
  }
  if (nameLower.includes('seo') || nameLower.includes('rédaction') || nameLower.includes('redaction')) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-seo'],
      categoryId,
      categoryLabel: folder?.name || 'SEO & Rédaction Web',
    };
  }
  if (nameLower.includes('market') || nameLower.includes('vente') || nameLower.includes('crm')) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-mkt'],
      categoryId,
      categoryLabel: folder?.name || 'Marketing',
    };
  }
  if (nameLower.includes('tech') || nameLower.includes('devops') || nameLower.includes('sécurité')) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-tech'],
      categoryId,
      categoryLabel: folder?.name || 'Technique & DevOps',
    };
  }
  if (nameLower.includes('vidéo') || nameLower.includes('video') || nameLower.includes('média')) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-vid'],
      categoryId,
      categoryLabel: folder?.name || 'Vidéo & Médias IA',
    };
  }
  if (nameLower.includes('produit') || nameLower.includes('ux') || nameLower.includes('entrep')) {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-ent'],
      categoryId,
      categoryLabel: folder?.name || 'Produit & Entrepreneuriat',
    };
  }

  // Fallback based on selected domain or default software dev profile
  if (domainFallback === 'Landing Pages & Conversion (CRO)') {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-landing'],
      categoryId,
      categoryLabel: folder?.name || 'Landing Pages & CRO',
    };
  }
  if (domainFallback === 'Marketing & Copywriting') {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-mkt'],
      categoryId,
      categoryLabel: folder?.name || 'Marketing',
    };
  }
  if (domainFallback === 'Entrepreneuriat & Marché') {
    return {
      ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-ent'],
      categoryId,
      categoryLabel: folder?.name || 'Entrepreneuriat',
    };
  }

  return {
    ...CATEGORY_AUTOCOMPLETE_PROFILES['cat-dev'],
    categoryId,
    categoryLabel: folder?.name || 'Développement logiciel',
  };
}
