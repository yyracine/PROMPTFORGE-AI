import {
  Category,
  OptimizationOperation,
  ProfessionalDomain,
  PromptTemplate,
  SoftwareUseCaseId,
  TargetProfile,
} from '../types/promptforge';

export const TARGET_PROFILES: TargetProfile[] = [
  {
    id: 'claude-code',
    name: 'Claude Code (CLI Agent)',
    provider: 'Anthropic Profile',
    category: 'coding-agent',
    description:
      'Optimisé pour Claude Code en terminal : balises XML structurées, exploration préalable du dépôt, vérifications de tests et exécution séquentielle.',
    recommendedFormat: 'xml',
    structuralRules: [
      'Utiliser des balises XML sémantiques (<context>, <objective>, <constraints>, <verification_steps>)',
      'Exiger la lecture et l’analyse de l’arborescence existante avant toute écriture',
      'Interdire les implémentations partielles, les TODOs ou les mocks de substitution',
    ],
  },
  {
    id: 'cursor-agent',
    name: 'Cursor Composer / Agent',
    provider: 'Cursor IDE Profile',
    category: 'coding-agent',
    description:
      'Conçu pour l’agent multi-fichiers de Cursor : règles .cursorrules claires, modifications atomiques par fichier, respect strict du typage.',
    recommendedFormat: 'markdown',
    structuralRules: [
      'Structurer par étapes d’implémentation atomiques et vérifiables',
      'Préciser les conventions de nommage, les imports et l’architecture des dossiers',
      'Demander une vérification TypeScript/Linter après chaque lot de modifications',
    ],
  },
  {
    id: 'opencode',
    name: 'OpenCode / Aider Agent',
    provider: 'Open Source Coding Agent',
    category: 'coding-agent',
    description:
      'Adapté aux assistants d’ingénierie autonomes en ligne de commande : instructions directes, chemins de fichiers explicites et commandes de test.',
    recommendedFormat: 'markdown',
    structuralRules: [
      'Spécifier explicitement les fichiers cibles et les contrats d’interface',
      'Fournir les commandes exactes de validation sous Windows (PowerShell)',
      'Découper les changements complexes en étapes déterministes sans effets de bord',
    ],
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Raisonnement & Code)',
    provider: 'Anthropic Profile',
    category: 'llm',
    description:
      'Profil pour raisonnement architectural profond, rédaction technique, analyse complexe et génération de code structuré avec balises XML.',
    recommendedFormat: 'xml',
    structuralRules: [
      'Séparer les données d’entrée et les directives au moyen de balises XML distinctes',
      'Demander une phase d’analyse méthodologique avant la production finale',
      'Définir des critères de qualité et d’auto-vérification explicites',
    ],
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o / o3-mini (Structuration & Synthèse)',
    provider: 'OpenAI Profile',
    category: 'llm',
    description:
      'Profil optimisé pour les sorties Markdown hiérarchisées, schémas JSON stricts, études de marché et synthèses opérationnelles.',
    recommendedFormat: 'markdown',
    structuralRules: [
      'Utiliser des titres Markdown hiérarchiques (#, ##, ###) et listes numérotées',
      'Définir clairement le rôle expert, le ton et le gabarit exact de la réponse attendue',
      'Lister les contraintes négatives ("Ne pas...") de manière explicite',
    ],
  },
  {
    id: 'gemini-3-8-flash',
    name: 'Google Gemini (Exécution & Contexte Long)',
    provider: 'Google Gemini (Actif)',
    category: 'llm',
    description:
      'Moteur nativement actif côté serveur : rapide, précis pour la structuration de prompts, l’analyse de gros volumes documentaires et le code.',
    recommendedFormat: 'markdown',
    structuralRules: [
      'Placer le contexte documentaire en amont et les instructions d’action en fin de prompt',
      'Préciser le format de sortie et les critères mesurables de réussite',
      'Structurer les attentes avec des exemples concrets ou un gabarit explicite',
    ],
  },
];

export const PROFESSIONAL_DOMAINS: ProfessionalDomain[] = [
  'Développement logiciel',
  'Django & Python',
  'Architecture logicielle',
  'Conception MVP & SaaS',
  'Landing Pages & Conversion (CRO)',
  'Analyse & Rédaction',
  'Entrepreneuriat & Marché',
  'Marketing & Copywriting',
  'Automatisation & Scripts',
  'Recherche & Synthèse',
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-dev',
    name: 'Développement logiciel',
    slug: 'developpement-logiciel',
    description: 'Prompts pour applications web, APIs, Django, débogage, tests et architecture.',
  },
  {
    id: 'cat-landing',
    name: 'Landing Pages & CRO',
    slug: 'landing-pages-et-cro',
    description: 'Architecture de landing pages haute conversion, Hero above-the-fold, copywriting persuasif, UX/UI anti-slop, preuve sociale et formulaires.',
  },
  {
    id: 'cat-ent',
    name: 'Entrepreneuriat',
    slug: 'entrepreneuriat',
    description: 'Études de marché, validation de MVP, business plans et modèles économiques.',
  },
  {
    id: 'cat-mkt',
    name: 'Marketing',
    slug: 'marketing',
    description: 'Landing pages, SEO, copywriting, calendriers éditoriaux et acquisition.',
  },
  {
    id: 'cat-ana',
    name: 'Analyse et productivité',
    slug: 'analyse-et-productivite',
    description: 'Synthèse documentaire, extraction structurée, automatisation et gestion de projet.',
  },
  {
    id: 'cat-vid',
    name: 'Vidéo & Médias IA',
    slug: 'video-et-medias-ia',
    description: 'Prompts pour génération de vidéos IA (Veo, Sora, Runway), storyboards, scripts de démo et formats courts.',
  },
  {
    id: 'cat-tech',
    name: 'Technique & DevOps',
    slug: 'technique-et-devops',
    description: 'Infrastructure, sécurité, scripts système, bases de données, CI/CD et architecture technique.',
  },
  {
    id: 'cat-seo',
    name: 'SEO & Rédaction Web',
    slug: 'seo-et-redaction-web',
    description: 'Stratégie de mots-clés, cocons sémantiques, maillage interne, balises méta et articles optimisés.',
  },
];

export const OPTIMIZATION_OPERATIONS: {
  id: OptimizationOperation;
  label: string;
  shortDesc: string;
}[] = [
  {
    id: 'optimisation_pro',
    label: 'Optimisation professionnelle',
    shortDesc: 'Restructure le prompt avec rôle, contexte, méthodologie, contraintes et format de sortie.',
  },
  {
    id: 'version_experte',
    label: 'Version experte',
    shortDesc: 'Ajoute la gestion des cas limites, critères de validation, garde-fous et auto-contrôle.',
  },
  {
    id: 'correction_clarification',
    label: 'Correction et clarification',
    shortDesc: 'Élimine le flou lexical, corrige la syntaxe et rend chaque instruction univoque.',
  },
  {
    id: 'version_concise',
    label: 'Version concise',
    shortDesc: 'Compresse le prompt en conservant 100 % des contraintes critiques tout en réduisant les tokens.',
  },
  {
    id: 'enrichissement_contexte',
    label: 'Enrichissement du contexte',
    shortDesc: 'Explicite le cadre métier, les prérequis techniques et le profil du destinataire.',
  },
  {
    id: 'reorganisation_instructions',
    label: 'Réorganisation des instructions',
    shortDesc: 'Ordonne logiquement les directives selon une séquence d’exécution optimale.',
  },
  {
    id: 'detection_ambiguites',
    label: 'Détection des ambiguïtés',
    shortDesc: 'Repère et résout toutes les formulations sujettes à interprétation multiple.',
  },
  {
    id: 'detection_contradictions',
    label: 'Détection des contradictions',
    shortDesc: 'Identifie et corrige les injonctions contradictoires dans le prompt original.',
  },
  {
    id: 'amelioration_contraintes',
    label: 'Amélioration des contraintes',
    shortDesc: 'Renforce les limites techniques, de sécurité, de performance et d’environnement.',
  },
  {
    id: 'amelioration_criteres',
    label: 'Amélioration des critères d’acceptation',
    shortDesc: 'Définit une liste de contrôle vérifiable permettant de valider la sortie.',
  },
  {
    id: 'transformation_systeme',
    label: 'Transformation en prompt système',
    shortDesc: 'Convertit la demande en System Prompt permanent avec règles d’invariance.',
  },
  {
    id: 'transformation_agent',
    label: 'Transformation en prompt pour un agent',
    shortDesc: 'Adapte le prompt pour un agent autonome (boucle d’examen, d’action et de vérification).',
  },
  {
    id: 'adaptation_modele',
    label: 'Adaptation au modèle cible',
    shortDesc: 'Reformate le prompt selon les conventions optimales du modèle ou de l’agent sélectionné.',
  },
];

export const SOFTWARE_USE_CASES: {
  id: SoftwareUseCaseId;
  title: string;
  subtitle: string;
  defaultStack: string;
  defaultArchitecture: string;
}[] = [
  {
    id: 'django_app',
    title: 'Création d’une application Django',
    subtitle: 'Modèles ORM, vues/DRF, migrations, permissions, interface admin et tests Pytest.',
    defaultStack: 'Python 3.12, Django 5.x, Django REST Framework, SQLite/PostgreSQL, Pytest',
    defaultArchitecture: 'Architecture modulaire par applications Django (apps/), services métier découplés et sérialiseurs stricts',
  },
  {
    id: 'rest_api',
    title: 'Développement d’une API REST',
    subtitle: 'Routes typées, validation Pydantic/Zod, gestion d’erreurs HTTP, pagination et sécurité.',
    defaultStack: 'Python FastAPI + Pydantic v2 + SQLAlchemy 2.0 (ou Node.js Express + TypeScript)',
    defaultArchitecture: 'Architecture en couches : Routeurs API -> Services Métier -> Repositories -> Base de données SQLite/SQL',
  },
  {
    id: 'mvp_builder',
    title: 'Génération d’un MVP fonctionnel',
    subtitle: 'Produit minimum viable complet de bout en bout, sans fonctionnalités SaaS superflues.',
    defaultStack: 'React + TypeScript + Tailwind CSS (Frontend), FastAPI/Django + SQLite (Backend local)',
    defaultArchitecture: 'Monorepo full-stack clair avec persistance locale immédiate et parcours cœur 100 % câblés',
  },
  {
    id: 'landing_page',
    title: 'Landing Page Haute Conversion (UI/UX + Copy + CRO)',
    subtitle: 'Hero above-the-fold, preuve par le mécanisme, grille Bento asymétrique, pricing, FAQ, SEO et zéro AI-slop.',
    defaultStack: 'React 19, TypeScript, Tailwind CSS, Lucide Icons, HTML5 sémantique & JSON-LD SEO',
    defaultArchitecture: 'Séquence persuasive (Proposition -> Mécanisme -> Preuve chiffrée -> Offre/Pricing -> FAQ -> Conversion validée) avec Top Bar 3 zones et design 60-30-10',
  },
  {
    id: 'fullstack_web',
    title: 'Conception d’une application web complète',
    subtitle: 'Interface réactive, système de design clair/sombre, état serveur et base de données.',
    defaultStack: 'React 19, TypeScript, Vite, Tailwind CSS, Backend API REST, SQLite',
    defaultArchitecture: 'Frontend SPA découplé + API REST locale avec validation stricte des entrées/sorties',
  },
  {
    id: 'mobile_app',
    title: 'Conception d’une application mobile',
    subtitle: 'Navigation fluide, gestion hors-ligne, formulaires tactiles et synchronisation API.',
    defaultStack: 'React Native / Expo (TypeScript) ou Flutter, stockage SQLite local',
    defaultArchitecture: 'Architecture orientée fonctionnalités (features/) avec couche de persistance locale hors-ligne',
  },
  {
    id: 'saas_architecture',
    title: 'Création d’un projet SaaS',
    subtitle: 'Architecture multi-tenant, isolation des données, RBAC, audit logs et évolutivité.',
    defaultStack: 'Django / FastAPI + React TypeScript + PostgreSQL',
    defaultArchitecture: 'Architecture multi-tenant sécurisée avec contrôle d’accès par rôle et séparation stricte des domaines',
  },
  {
    id: 'repo_analysis',
    title: 'Analyse d’un dépôt existant',
    subtitle: 'Cartographie de l’architecture, détection de la dette technique et plan d’évolution.',
    defaultStack: 'Dépôt existant (Python, TypeScript, Django, React, etc.)',
    defaultArchitecture: 'Audit non destructif : lecture de l’arborescence, graphe des dépendances et rapport structuré',
  },
  {
    id: 'bug_fix',
    title: 'Correction d’un bug',
    subtitle: 'Analyse de cause racine (RCA), reproduction par un test, correctif minimal et non-régression.',
    defaultStack: 'Stack existante du projet',
    defaultArchitecture: 'Diagnostic ciblé -> Test reproduisant le bug -> Correctif chirurgical sans réécriture globale',
  },
  {
    id: 'refactoring',
    title: 'Refactorisation de code',
    subtitle: 'Amélioration de la lisibilité, découplage et performance à comportement iso-fonctionnel.',
    defaultStack: 'Stack existante du projet',
    defaultArchitecture: 'Préservation stricte des contrats publics et des fonctionnalités existantes avec couverture de tests',
  },
  {
    id: 'automated_tests',
    title: 'Génération de tests automatisés',
    subtitle: 'Tests unitaires et d’intégration (Pytest / Vitest), mocks des services externes et cas limites.',
    defaultStack: 'Pytest, httpx, Vitest, React Testing Library',
    defaultArchitecture: 'Pyramide de tests isolés avec base SQLite en mémoire et mocks déterministes pour les appels externes',
  },
  {
    id: 'security_audit',
    title: 'Audit de sécurité applicative',
    subtitle: 'Analyse OWASP, injections SQL/Prompt, protection des secrets, CORS et validation.',
    defaultStack: 'Application Full-Stack Web / API',
    defaultArchitecture: 'Revue défensive : validation des entrées, paramétrage SQL, isolation des clés API et contrôle CORS',
  },
  {
    id: 'tech_documentation',
    title: 'Documentation technique & Guide Windows',
    subtitle: 'README complet, architecture, installation sous Windows (PowerShell), diagnostic et API.',
    defaultStack: 'Markdown, Scripts PowerShell (.ps1), OpenAPI',
    defaultArchitecture: 'Documentation actionnable orientée développeur avec procédures de démarrage et dépannage Windows',
  },
  {
    id: 'deployment_windows',
    title: 'Déploiement & Scripts Windows sans Docker',
    subtitle: 'Scripts PowerShell robustes (chemins avec espaces), venv Python, gestion des ports et arrêt propre.',
    defaultStack: 'Windows 10/11, PowerShell 5.1/7+, Python venv, Node.js npm',
    defaultArchitecture: 'Exécution locale native sous Windows sans conteneurisation Docker',
  },
  {
    id: 'specs_generator',
    title: 'Génération d’un cahier des charges',
    subtitle: 'Spécifications fonctionnelles et techniques détaillées, modèle de données et critères d’acceptation.',
    defaultStack: 'À définir selon le besoin métier',
    defaultArchitecture: 'Spécification complète prête à être exécutée par une équipe ou un agent de programmation',
  },
  {
    id: 'software_architecture',
    title: 'Architecture logicielle & Modèle de données',
    subtitle: 'Conception système, schéma relationnel, contrats d’API, arbitrage des compromis.',
    defaultStack: 'Python / TypeScript / SQL',
    defaultArchitecture: 'Conception modulaire évolutive avec diagrammes ASCII et schémas de tables explicites',
  },
  {
    id: 'build_error_diagnosis',
    title: 'Analyse d’erreurs de compilation ou d’exécution',
    subtitle: 'Interprétation de stacktraces, résolution de conflits de dépendances ou d’erreurs de typage.',
    defaultStack: 'TypeScript / Vite / Python / Django / FastAPI',
    defaultArchitecture: 'Identification de la cause exacte dans la pile d’appel et résolution immédiate vérifiable',
  },
];

export const TEN_CODING_AGENT_RULES = [
  '1. Examiner impérativement le dépôt et les fichiers existants avant toute modification.',
  '2. Préserver intégralement les fonctionnalités utiles déjà en place.',
  '3. Respecter scrupuleusement les conventions de nommage, de style et d’architecture du projet.',
  '4. Éviter toute réécriture globale inutile : privilégier des modifications ciblées et propres.',
  '5. Implémenter toutes les fonctionnalités demandées de bout en bout (base de données, backend, frontend).',
  '6. Ne jamais remplacer une fonctionnalité essentielle par une simulation, une maquette statique ou un commentaire TODO.',
  '7. Tester systématiquement les changements introduits (compilation, tests automatisés, parcours critiques).',
  '8. Corriger immédiatement toutes les erreurs de syntaxe, de typage ou d’exécution détectées.',
  '9. Documenter clairement les commandes d’installation, de configuration et de lancement (compatibles Windows sans Docker).',
  '10. Signaler avec une transparence absolue toute limite technique ou fonctionnalité restant à compléter.',
];

export const LANDING_PAGE_PROMPT_RULES = [
  '1. Clarté Above-the-Fold (Test des 5 secondes) : Le Hero doit énoncer immédiatement la cible identifiable, la proposition de valeur unique (UVP) sans jargon publicitaire creux ("boostez", "révolutionnez" proscrits), le mécanisme concret et un appel à l’action (CTA) primaire unique orienté résultat direct avec micro-copie de réassurance.',
  '2. Contrat de Top Bar en 3 Zones : Zone 1 = Wordmark typographique sur une seule ligne (whitespace-nowrap shrink-0, aucun badge parasite accolé) ; Zone 2 = 4 à 5 liens d’ancrage fluides (Démo, Mécanisme, Tarifs, FAQ) ; Zone 3 = 1 seul bouton CTA primaire orienté conversion.',
  '3. Séquence Persuasive Complète : Proposition & Démonstrateur (Hero + démonstration interactive/bac à sable) -> Diagnostic Avant/Après factuel -> Mécanisme & Capacités (Grille Bento asymétrique col-span-2 / col-span-1) -> Preuves réelles vérifiables & Exemples concrets -> Grille Tarifaire transparente par profil -> FAQ Décisive (5-6 objections réelles) -> Capture Finale Validée & Footer sobre avec liens fonctionnels.',
  '4. Intégrité des Données & Preuves Sociales Non-Inventées (Règle d’Or de Crédibilité) : Interdiction formelle d’inventer des statistiques fantaisistes ("99.4% de conformité JSON", "-68% de tokens", "réduction de 42%"), de faux clients, de faux logos ou des témoignages fictifs. Si des mesures réelles ne sont pas documentées, l’IA doit présenter ces blocs comme des exemples explicitement illustratifs ou remplacer la preuve sociale par une démonstration produit concrète (brief initial -> prompt généré -> résultat obtenu) qui prouve la valeur en quelques secondes.',
  '5. Portée Réelle du Produit & Démonstration vs Backend : Identifier honnêtement les fonctionnalités existantes dans le projet. Pour les fonctionnalités sans backend ou services externes, fournir une démonstration locale honnêtement présentée comme telle, documenter le contrat d’intégration (API REST, entrées/sorties) et ne jamais prétendre qu’un traitement local dans le navigateur garantit une exécution serveur ou une optimisation infaillible.',
  '6. Formulaires & Capture de Prospects Réelle : Distinguer validation frontend de complaisance (regex email locale) et véritable capture. Documenter le endpoint de soumission, prévoir les états de chargement, de succès et d’erreur, la protection contre les soumissions abusives et la validation côté serveur. Si aucun backend n’est branché, documenter le point d’intégration au lieu d’afficher un succès trompeur.',
  '7. Sécurité Réaliste ("Réduction des Risques" vs "Zéro Injection") : Ne jamais prétendre garantir une absence totale d’injections ou d’hallucinations par le seul usage de balises XML ou de schémas. Exiger une véritable défense en profondeur : validation stricte des entrées et sorties, séparation étanche des instructions système et des données non fiables, tests adversariaux et contrôles de sécurité adaptés.',
  '8. Système de Design 60-30-10 & Accessibilité Mesurable : 60 % de fond neutre maîtrisé, 30 % de surfaces structurelles avec bordures subtiles 1px, 10 % d’accent réservé aux actions primaires. Contraste WCAG AA vérifiable (>= 4.5:1 pour le texte courant, >= 3:1 pour les grands titres et éléments graphiques) en mode clair et sombre. Navigation clavier complète, indicateurs de focus visibles et états accessibles.',
  '9. Hiérarchie Typographique 2+1 & Chiffres Tabulaires Ciblés : Police d’affichage expressive (ex: Plus Jakarta Sans) avec text-wrap: balance appliqué sur les titres (H1/H2), police de corps lisible (DM Sans, 65-75ch), et police monospace (JetBrains Mono) avec tabular-nums réservé aux nombres alignés, prix, métriques et tableaux comparatifs.',
  '10. Discipline Anti-Slop Rigoureuse : Proscrire formellement les cartes imbriquées dans des cartes, les bordures gauches épaisses (border-l-4), les points clignotants artificiels (animate-pulse), les préfixes mécaniques (// 01_FEATURE), et les métadonnées statiques enfermées dans des pilules (utiliser des séparateurs typographiques discrets ·).',
  '11. Médias Locaux Sécurisés & Zéro URL Fragile : Privilégier les ressources locales ou générées en SVG propre, proscrire les URLs Unsplash externes instables ; inclure referrerPolicy="no-referrer" et texte alt descriptif sur tout élément multimédia externe.',
  '12. Protocole de Vérification & Compatibilité Native Windows : Le code généré doit être vérifié (audit préalable de l’existant, package.json, TypeScript sans erreurs, build de production npm run build, smoke test) et exécutable nativement sous Windows (PowerShell/CMD) sans Docker. L’IA doit distinguer explicitement ce qui est testé et fonctionnel de ce qui reste à intégrer.',
];

export const INITIAL_TEMPLATES: Omit<PromptTemplate, 'created_at' | 'updated_at'>[] = [
  // === DÉVELOPPEMENT LOGICIEL (7 modèles) ===
  {
    id: 'tpl-dev-django',
    title: 'Application Django complète et modulaire',
    slug: 'application-django-complete',
    description: 'Conçoit et implémente une application Django robuste avec modèles ORM, vues/DRF, validations et tests Pytest.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 14,
    variables_schema: [
      { name: 'nom_app', label: 'Nom de l’application Django', placeholder: 'ex: billing_manager', defaultValue: 'core_inventory' },
      { name: 'entites', label: 'Entités et modèles principaux', placeholder: 'ex: Produit, MouvementStock, Fournisseur', defaultValue: 'Produit, Categorie, MouvementStock' },
      { name: 'fonctionnalites', label: 'Fonctionnalités clés attendues', placeholder: 'ex: CRUD complet, alertes de seuil, export CSV', defaultValue: 'CRUD complet, calcul de stock en temps réel, export CSV et filtrage multicritère' },
    ],
    template_content: `# RÔLE ET MISSION
Agis en tant qu'Architecte Python/Django Senior. Ta mission est de concevoir et d'implémenter l'application Django **{{nom_app}}** de bout en bout, prête pour un environnement local sous Windows sans Docker.

# CONTEXTE ET MODÈLE DE DONNÉES
L'application doit structurer et gérer les entités suivantes : **{{entites}}**.
Fonctionnalités obligatoires à implémenter réellement :
{{fonctionnalites}}

# DIRECTIVES D'INGÉNIERIE OBLIGATOIRES
1. **Examen préalable** : Inspecte la structure du projet Django existant (\`settings.py\`, \`urls.py\`) avant de créer ou modifier des fichiers.
2. **Modèles ORM (\`models.py\`)** : Définis les champs typés, les relations (\`ForeignKey\`, \`ManyToManyField\`), les contraintes d'intégrité, les index SQLite/PostgreSQL et les méthodes \`__str__\`.
3. **Logique Métier (\`services.py\`)** : Isole la logique métier complexe hors des vues pour garantir la testabilité.
4. **Vues / Sérialiseurs & Formulaires** : Implémente la validation stricte des entrées, la gestion propre des erreurs HTTP et la protection CSRF/permissions.
5. **Tests Automatisés (\`tests/\`)** : Écris les tests unitaires et d'intégration avec \`pytest-django\` couvrant les cas nominaux et les cas d'erreur.

# FORMAT DE SORTIE ATTENDU
Fournis successivement :
- L'arborescence exacte des fichiers créés ou modifiés.
- Le code complet et fonctionnel de chaque fichier (sans \`TODO\` ni code tronqué).
- Les commandes Windows PowerShell pour appliquer les migrations (\`makemigrations\`, \`migrate\`) et exécuter la suite de tests.`,
    example_output: 'Arborescence complète de l’app Django + models.py + services.py + views.py + urls.py + tests/test_models.py + commandes PowerShell.',
  },
  {
    id: 'tpl-dev-mvp',
    title: 'Génération d’un MVP Web Full-Stack',
    slug: 'mvp-web-fullstack',
    description: 'Structure le développement complet d’un produit minimum viable avec base SQLite locale, backend REST et interface React.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 19,
    variables_schema: [
      { name: 'nom_mvp', label: 'Nom du produit MVP', placeholder: 'ex: TaskFlow Local', defaultValue: 'DocuSynth AI' },
      { name: 'probleme_cible', label: 'Problème résolu par le MVP', placeholder: 'ex: Organiser et synthétiser des notes techniques locales', defaultValue: 'Centraliser, taguer et synthétiser des notes techniques d’architecture en local' },
      { name: 'stack_technique', label: 'Stack technique souhaitée', placeholder: 'ex: React + TypeScript + FastAPI + SQLite', defaultValue: 'React 19 + TypeScript + Tailwind CSS + FastAPI + SQLite' },
    ],
    template_content: `# RÔLE ET MISSION
Tu es une équipe senior Full-Stack (Architecte logiciel, Développeur React/TypeScript, Développeur Backend Python/FastAPI et Designer UI/UX). Ta mission est de développer le MVP **{{nom_mvp}}** de bout en bout.

# OBJECTIF PRODUIT
Résoudre le problème suivant : **{{probleme_cible}}**.
Stack technique retenue : **{{stack_technique}}**.

# CONTRAINTES NON NÉGOCIABLES
- Application locale fonctionnant sous Windows sans Docker.
- Persistance réelle dans une base de données SQLite locale (aucune donnée perdue au redémarrage).
- Aucune maquette statique : chaque bouton, filtre et formulaire doit être relié au backend et à la base de données.
- Thème clair et thème sombre complets et lisibles.

# LIVRABLES ATTENDUS
1. Schéma complet de la base de données SQLite et script d'initialisation.
2. Routes REST du backend avec validation stricte des entrées et gestion des erreurs.
3. Interface frontend complète avec états de chargement, états vides et notifications d'action.
4. Scripts PowerShell de démarrage et tests automatisés des routes critiques.`,
    example_output: 'Plan d’architecture + Backend complet + Frontend React connecté + Scripts de lancement Windows.',
  },
  {
    id: 'tpl-dev-api',
    title: 'Architecture et implémentation d’API REST',
    slug: 'architecture-api-rest',
    description: 'Définit une API RESTful propre avec schémas de validation, codes HTTP normalisés, pagination et sécurité.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Cursor IDE Profile',
    target_model: 'cursor-agent',
    usage_count: 11,
    variables_schema: [
      { name: 'domaine_api', label: 'Domaine fonctionnel de l’API', placeholder: 'ex: Gestion de projets et jalons', defaultValue: 'Gestion de bibliothèque de prompts et versions' },
      { name: 'framework', label: 'Framework Backend', placeholder: 'ex: FastAPI + SQLAlchemy 2.0', defaultValue: 'FastAPI + Pydantic v2 + SQLAlchemy 2.0' },
      { name: 'endpoints', label: 'Ressources ou endpoints principaux', placeholder: 'ex: /items, /categories, /export', defaultValue: '/api/prompts, /api/prompts/{id}/versions, /api/tags, /api/backup' },
    ],
    template_content: `# RÔLE
Architecte Backend Senior spécialisé en conception d'API RESTful avec **{{framework}}**.

# OBJECTIF
Concevoir et implémenter l'API REST pour le domaine : **{{domaine_api}}**.
Endpoints principaux à couvrir : **{{endpoints}}**.

# EXIGENCES TECHNIQUES
- **Validation stricte** : Schémas d'entrée et de sortie explicites (Pydantic / Zod).
- **Intégrité des données** : Requêtes paramétrées SQLite/SQL, transactions atomiques et clés étrangères.
- **Gestion des erreurs** : Réponses JSON normalisées (\`code\`, \`message\`, \`details\`) pour les erreurs 400, 404, 409 et 500.
- **Sécurité** : Filtrage CORS strict (origines locales uniquement), non-divulgation des secrets, validation des paramètres de pagination et de recherche.

# FORMAT DE SORTIE
Produis les schémas de données, les modèles ORM, les routeurs complets et une suite de tests d'intégration vérifiant chaque endpoint.`,
    example_output: 'Schémas Pydantic + Modèles SQLAlchemy + Routeurs FastAPI + Tests Pytest.',
  },
  {
    id: 'tpl-dev-audit',
    title: 'Audit de code et de sécurité applicative',
    slug: 'audit-code-securite',
    description: 'Examine un dépôt ou un module pour détecter les failles de sécurité, bugs latents, dettes techniques et goulots d’étranglement.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 9,
    variables_schema: [
      { name: 'perimetre', label: 'Périmètre ou module audité', placeholder: 'ex: Authentification et routes API', defaultValue: 'Backend API, requêtes SQLite et gestion des clés API' },
      { name: 'stack', label: 'Stack technique du code', placeholder: 'ex: Python FastAPI + React TypeScript', defaultValue: 'Python FastAPI / Node Express + React TypeScript' },
    ],
    template_content: `# RÔLE
Auditeur Senior en Sécurité Applicative (AppSec) et Qualité Logicielle.

# PÉRIMÈTRE DE L'AUDIT
Analyse en profondeur le périmètre suivant : **{{perimetre}}** (Stack : **{{stack}}**).

# GRILLE D'ANALYSE OBLIGATOIRE
1. **Sécurité & Confidentialité** : Injections SQL, injections de prompts (Prompt Injection), exposition de clés API ou secrets dans le frontend/journaux, configuration CORS, validation des fichiers importés.
2. **Fiabilité & Gestion des erreurs** : Cas limites non gérés, promesses/exceptions silencieuses, corruption potentielle d'état lors d'échecs réseau.
3. **Architecture & Maintenabilité** : Couplage fort, duplication de logique, respect du typage strict.

# FORMAT DU RAPPORT
Classe les constats par criticité (**Critique**, **Haute**, **Moyenne**, **Faible**). Pour chaque point, indique :
- Le fichier et le mécanisme en cause.
- Le risque concret encouru.
- Le correctif de code exact prêt à être appliqué.`,
    example_output: 'Rapport d’audit classé par criticité avec extraits de code corrigés.',
  },
  {
    id: 'tpl-dev-bug',
    title: 'Diagnostic et correction chirurgicale de bug',
    slug: 'correction-de-bug',
    description: 'Identifie la cause racine d’une anomalie, écrit un test de reproduction et applique un correctif minimal sans régression.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'xml',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 16,
    variables_schema: [
      { name: 'symptome', label: 'Symptôme ou erreur observée', placeholder: 'ex: Erreur 500 lors de la sauvegarde d’une version', defaultValue: 'Perte de l’état du formulaire lors du changement de thème clair/sombre' },
      { name: 'contexte_technique', label: 'Fichiers ou composants concernés', placeholder: 'ex: ThemeProvider.tsx et GeneratorView.tsx', defaultValue: 'Contexte React de thème et état du formulaire Générateur' },
    ],
    template_content: `<role>
Ingénieur Logiciel Senior spécialisé en débogage complexe et fiabilité système.
</role>

<bug_report>
Symptôme observé : {{symptome}}
Contexte technique : {{contexte_technique}}
</bug_report>

<methodology>
1. **Analyse de la cause racine (Root Cause Analysis)** : Examine les fichiers concernés et explique précisément le mécanisme qui provoque l'anomalie.
2. **Reproduction déterministe** : Définis le scénario ou le test automatisé qui met en évidence le défaut.
3. **Correctif minimal et sûr** : Modifie uniquement le code nécessaire pour corriger la cause racine, sans réécrire les fonctionnalités adjacentes ni introduire d'effets de bord.
4. **Vérification de non-régression** : Exécute la compilation et les tests pour confirmer la résolution complète.
</methodology>`,
    example_output: 'Diagnostic RCA + Test de reproduction + Diff chirurgical + Validation.',
  },
  {
    id: 'tpl-dev-tests',
    title: 'Suite de tests automatisés (Backend & Frontend)',
    slug: 'tests-automatises',
    description: 'Génère des tests unitaires et d’intégration complets avec mocks des appels IA payants.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Cursor IDE Profile',
    target_model: 'cursor-agent',
    usage_count: 8,
    variables_schema: [
      { name: 'module_cible', label: 'Module ou fonctionnalité à tester', placeholder: 'ex: Service de génération et CRUD SQLite', defaultValue: 'CRUD des prompts, gestion des versions et moteur d’évaluation' },
      { name: 'outils_test', label: 'Framework de test', placeholder: 'ex: Pytest / Vitest', defaultValue: 'Pytest (Backend) et Vitest (Frontend)' },
    ],
    template_content: `# RÔLE
Ingénieur QA Automation Senior.

# OBJECTIF
Concevoir et implémenter une suite de tests automatisés complète pour : **{{module_cible}}** avec **{{outils_test}}**.

# RÈGLES D'IMPLÉMENTATION
1. **Zéro appel externe payant** : Tous les appels aux fournisseurs d'IA doivent être isolés via des mocks déterministes testant à la fois les réponses valides et les erreurs (timeout, clé invalide, quota dépassé).
2. **Base de données isolée** : Utiliser une base SQLite dédiée aux tests pour vérifier la persistance réelle, les contraintes d'intégrité et l'historique des versions.
3. **Couverture des cas limites** : Tester les entrées vides, les doublons lors de l'import, la protection des secrets et la préservation des brouillons.

# LIVRABLES
Code complet des fichiers de tests et commande exacte d'exécution sous Windows.`,
    example_output: 'Fichiers de tests unitaires et d’intégration complets avec fixtures et mocks.',
  },
  {
    id: 'tpl-dev-doc',
    title: 'Documentation technique et procédure Windows',
    slug: 'documentation-technique',
    description: 'Rédige une documentation claire d’architecture, d’installation et de dépannage sous Windows sans Docker.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 7,
    variables_schema: [
      { name: 'nom_projet', label: 'Nom du projet', placeholder: 'ex: PromptForge AI', defaultValue: 'PromptForge AI' },
      { name: 'prerequis', label: 'Prérequis techniques', placeholder: 'ex: Python 3.11+, Node.js 20+', defaultValue: 'Windows 10/11, Python 3.11+, Node.js 20+, PowerShell' },
    ],
    template_content: `# RÔLE
Rédacteur Technique Senior et Architecte Logiciel.

# MISSION
Rédiger la documentation complète et opérationnelle du projet **{{nom_projet}}** destiné à un environnement **{{prerequis}}** sans Docker.

# STRUCTURE ATTENDUE
1. **Vue d'ensemble et architecture** (schéma ASCII des composants et du flux de données).
2. **Prérequis et vérification de l'environnement** (commandes de diagnostic).
3. **Installation pas à pas sous Windows** (gestion des chemins avec espaces, variables d'environnement \`.env\`).
4. **Lancement et arrêt propre** via les scripts PowerShell (\`install.ps1\`, \`start.ps1\`, \`start-backend.ps1\`, \`start-frontend.ps1\`).
5. **Emplacement et sauvegarde de la base SQLite locale**.
6. **Guide de dépannage des erreurs fréquentes** (port occupé, politique d'exécution PowerShell, dépendance manquante, fournisseur IA indisponible).`,
    example_output: 'README.md structuré et guide d’exploitation Windows.',
  },

  // === ENTREPRENEURIAT (6 modèles) ===
  {
    id: 'tpl-ent-marche',
    title: 'Étude de marché approfondie et segmentation',
    slug: 'etude-de-marche',
    description: 'Analyse structurée de la taille de marché, des segments de clientèle, des douleurs métiers et des opportunités.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 10,
    variables_schema: [
      { name: 'secteur', label: 'Secteur ou produit étudié', placeholder: 'ex: Outils locaux de productivité IA pour développeurs', defaultValue: 'Outils de productivité et d’automatisation IA pour développeurs indépendants' },
      { name: 'zone_geo', label: 'Marché géographique cible', placeholder: 'ex: Europe francophone et Amérique du Nord', defaultValue: 'Marché francophone (France, Belgique, Suisse, Canada) et international' },
    ],
    template_content: `# RÔLE
Consultant Senior en Stratégie et Études de Marché B2B/SaaS.

# MISSION
Réaliser une étude de marché rigoureuse et pragmatique sur le segment : **{{secteur}}** (Zone : **{{zone_geo}}**).

# STRUCTURE DE L'ANALYSE
1. **Dynamique du marché et tendances structurelles** (facteurs d'adoption, freins réglementaires ou techniques).
2. **Segmentation précise des utilisateurs cibles** (Personas, cas d'usage quotidiens, budget, critères d'achat).
3. **Analyse des problèmes non résolus (Pain Points)** par les solutions actuelles.
4. **Opportunités de différenciation** (angle d'attaque produit, barrières à l'entrée).
5. **Hypothèses critiques à vérifier** sur le terrain dans les 30 prochains jours.`,
    example_output: 'Rapport d’étude de marché en 5 sections avec matrices de segmentation.',
  },
  {
    id: 'tpl-ent-validation',
    title: 'Validation d’idée produit et crash-test MVP',
    slug: 'validation-idee-produit',
    description: 'Challenge sans complaisance une idée d’entreprise ou de logiciel avant d’investir du temps de développement.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 12,
    variables_schema: [
      { name: 'idee_produit', label: 'Description de l’idée produit', placeholder: 'ex: Application de génération et gestion locale de prompts', defaultValue: 'Application personnelle de génération, d’optimisation et de versionnage de prompts IA' },
      { name: 'cible', label: 'Utilisateur cible principal', placeholder: 'ex: Développeurs, consultants et entrepreneurs', defaultValue: 'Développeurs full-stack, architectes logiciels et créateurs de produits digitaux' },
    ],
    template_content: `# RÔLE
Product Strategist Senior et Investisseur Critique (approche Lean Startup).

# IDÉE À ÉVALUER
Produit : **{{idee_produit}}**
Cible : **{{cible}}**

# DIRECTIVES D'ÉVALUATION SANS COMPLAISANCE
1. **Proposition de valeur** : Est-ce un "vitamine" (confort) ou un "antidouleur" (besoin critique quotidien) ?
2. **Risques majeurs** : Identifie les 5 raisons les plus probables d'échec ou d'abandon du produit.
3. **Périmètre MVP strict** : Quelles sont les 3 fonctionnalités indispensables dès le jour 1, et quelles fonctionnalités doivent impérativement être exclues ?
4. **Protocole de validation** : Propose 3 expériences concrètes pour valider la valeur réelle en moins de 2 semaines.`,
    example_output: 'Diagnostic critique + Matrice des risques + Périmètre MVP + Plan d’expérimentation.',
  },
  {
    id: 'tpl-ent-bp',
    title: 'Business Plan exécutif et feuille de route',
    slug: 'business-plan-executif',
    description: 'Structure un plan d’affaires synthétique : proposition de valeur, opérations, coûts et jalons.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 6,
    variables_schema: [
      { name: 'projet', label: 'Nom et nature du projet', placeholder: 'ex: Studio de développement de micro-SaaS Python', defaultValue: 'Suite logicielle de productivité IA pour ingénieurs' },
      { name: 'horizon', label: 'Horizon temporel', placeholder: 'ex: 12 mois', defaultValue: '12 mois (de la validation personnelle à la commercialisation)' },
    ],
    template_content: `# RÔLE
Directeur Financier et Stratège Produit.

# OBJECTIF
Construire le Business Plan exécutif du projet **{{projet}}** sur un horizon de **{{horizon}}**.

# SECTIONS ATTENDUES
1. **Synthèse exécutive (Executive Summary)** : Vision, problème, solution et avantage compétitif.
2. **Architecture de l'offre** : Phasing entre version personnelle/gratuite et offre commerciale.
3. **Structure des coûts et ressources** : Infrastructure, développement, distribution, support.
4. **Feuille de route trimestrielle (Q1 à Q4)** avec indicateurs clés de succès (KPIs) mesurables.`,
    example_output: 'Business plan structuré avec feuille de route trimestrielle.',
  },
  {
    id: 'tpl-ent-concurrence',
    title: 'Analyse concurrentielle et matrice de positionnement',
    slug: 'analyse-concurrentielle',
    description: 'Compare les solutions directes et indirectes pour identifier un positionnement différenciant.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 7,
    variables_schema: [
      { name: 'produit_analyse', label: 'Votre produit', placeholder: 'ex: PromptForge AI (outil local de Prompt Engineering)', defaultValue: 'Outil local de Prompt Engineering sans abonnement ni cloud obligatoire' },
      { name: 'concurrents', label: 'Concurrents connus ou alternatives', placeholder: 'ex: Notion AI, gestionnaires de snippets, plateformes SaaS', defaultValue: 'Plateformes SaaS de prompts, fichiers Markdown manuels, extensions navigateur' },
    ],
    template_content: `# RÔLE
Analyste Stratégique Produit.

# CONTEXTE
Produit étudié : **{{produit_analyse}}**
Alternatives et concurrents : **{{concurrents}}**

# MISSION
1. Construire un tableau comparatif multicritère (Fonctionnalités, Confidentialité/Local-first, Coût, Qualité d'interface, Spécialisation technique).
2. Identifier les angles morts des solutions existantes.
3. Formuler le positionnement unique (Unique Value Proposition) en une phrase percutante.`,
    example_output: 'Matrice comparative Markdown + Analyse des angles morts + Positionnement.',
  },
  {
    id: 'tpl-ent-modele-eco',
    title: 'Modèle économique et stratégie de tarification',
    slug: 'modele-economique',
    description: 'Élabore les options de monétisation (licence perpétuelle, BYOK, abonnement, freemium) et l’économie unitaire.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 5,
    variables_schema: [
      { name: 'type_logiciel', label: 'Type de produit', placeholder: 'ex: Application desktop/locale avec clés API utilisateur (BYOK)', defaultValue: 'Application desktop locale avec modèle BYOK (Bring Your Own Key)' },
    ],
    template_content: `# RÔLE
Expert en Pricing SaaS & Logiciels Desktop.

# MISSION
Analyser et comparer les modèles économiques pertinents pour : **{{type_logiciel}}**.

# LIVRABLES
1. Comparaison détaillée : Licence perpétuelle (One-time purchase) vs Abonnement vs Modèle hybride BYOK.
2. Construction de 3 paliers tarifaires cohérents avec la valeur perçue.
3. Analyse des coûts marginaux et de la rentabilité unitaire.`,
    example_output: 'Comparatif des modèles de revenus + Grille tarifaire recommandée.',
  },
  {
    id: 'tpl-ent-lancement',
    title: 'Stratégie de lancement (Go-To-Market)',
    slug: 'strategie-de-lancement',
    description: 'Plan d’action concret pour lancer un produit auprès d’une audience technique ou professionnelle.',
    category_id: 'cat-ent',
    category_name: 'Entrepreneuriat',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 6,
    variables_schema: [
      { name: 'produit', label: 'Produit à lancer', placeholder: 'ex: Outil de génération de prompts pour développeurs', defaultValue: 'Outil d’ingénierie de prompts pour développeurs Python/React' },
      { name: 'canaux', label: 'Canaux privilégiés', placeholder: 'ex: GitHub, LinkedIn, communautés de développeurs', defaultValue: 'GitHub, LinkedIn, Reddit techniques, démonstrations vidéo courtes' },
    ],
    template_content: `# RÔLE
Spécialiste Go-To-Market (Product-Led Growth & Developer Marketing).

# OBJECTIF
Concevoir le plan de lancement sur 4 semaines pour **{{produit}}** via **{{canaux}}**.

# CONTENU ATTENDU
- Préparation avant lancement (assets, démonstrations concrètes avant/après).
- Séquence jour par jour de la semaine de lancement.
- Boucles de retours utilisateurs et métriques d'activation à suivre.`,
    example_output: 'Plan Go-To-Market sur 4 semaines avec livrables et métriques.',
  },

  // === MARKETING (5 modèles) ===
  {
    id: 'tpl-mkt-landing',
    title: 'Architecture et copywriting de Landing Page à haute conversion',
    slug: 'landing-page-haute-conversion',
    description: 'Structure complète d’une page de présentation produit : Hero, preuve par le mécanisme, bénéfices et FAQ.',
    category_id: 'cat-mkt',
    category_name: 'Marketing',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 13,
    variables_schema: [
      { name: 'offre', label: 'Produit ou service présenté', placeholder: 'ex: PromptForge AI', defaultValue: 'PromptForge AI — Atelier personnel de Prompt Engineering' },
      { name: 'promesse', label: 'Résultat principal obtenu par l’utilisateur', placeholder: 'ex: Obtenir du code et des analyses 3x plus précis dès le premier prompt', defaultValue: 'Transformer des idées brutes en instructions structurées qui éliminent les allers-retours avec les LLM' },
    ],
    template_content: `# RÔLE
Product Copywriter Senior spécialisé dans les logiciels B2B et outils pour développeurs.

# MISSION
Rédiger le contenu intégral de la Landing Page pour : **{{offre}}**.
Promesse centrale : **{{promesse}}**.

# RÈGLES DE RÉDACTION
- Ton sobre, factuel, précis, sans jargon publicitaire creux ni promesses exagérées.
- Relier chaque fonctionnalité à son mécanisme concret puis au bénéfice mesurable.

# STRUCTURE DE LA PAGE
1. **Section Hero** : Titre principal percutant, sous-titre explicatif, appel à l'action principal.
2. **Constat (Avant / Après)** : Comparaison entre un prompt improvisé et un prompt structuré.
3. **Piliers fonctionnels** (3 à 4 sections claires).
4. **Traitement des objections (FAQ)** : 5 questions-réponses décisives.`,
    example_output: 'Copywriting complet section par section prêt à intégrer.',
  },
  {
    id: 'tpl-mkt-seo',
    title: 'Stratégie SEO sémantique et brief d’article pilier',
    slug: 'strategie-seo-semantique',
    description: 'Élabore un cocon sémantique, l’intention de recherche et le plan détaillé d’un contenu de référence.',
    category_id: 'cat-mkt',
    category_name: 'Marketing',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 7,
    variables_schema: [
      { name: 'requete_cible', label: 'Thématique ou mot-clé principal', placeholder: 'ex: Structurer des prompts pour Claude Code et Cursor', defaultValue: 'Guide complet du Prompt Engineering pour le développement logiciel' },
    ],
    template_content: `# RÔLE
Architecte SEO Technique & Éditorial.

# OBJECTIF
Construire le brief SEO complet pour la requête cible : **{{requete_cible}}**.

# LIVRABLES
1. Analyse de l'intention de recherche et de l'angle différenciant.
2. Balises \`<title>\`, \`meta description\` et slug optimisés.
3. Structure H1 / H2 / H3 détaillée avec les entités sémantiques à couvrir dans chaque section.
4. Maillage interne recommandé et schémas de données structurées (JSON-LD).`,
    example_output: 'Brief SEO complet avec plan Hn et entités sémantiques.',
  },
  {
    id: 'tpl-mkt-calendrier',
    title: 'Calendrier éditorial expert sur 30 jours',
    slug: 'calendrier-editorial',
    description: 'Planifie 4 semaines de publications à forte valeur ajoutée (études de cas, tutoriels techniques, retours d’expérience).',
    category_id: 'cat-mkt',
    category_name: 'Marketing',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 6,
    variables_schema: [
      { name: 'expertise', label: 'Domaine d’expertise', placeholder: 'ex: Développement Python/Django et IA appliquée', defaultValue: 'Architecture logicielle Python/React et Prompt Engineering avancé' },
      { name: 'frequence', label: 'Fréquence de publication', placeholder: 'ex: 3 publications par semaine', defaultValue: '3 publications par semaine sur 4 semaines' },
    ],
    template_content: `# RÔLE
Directeur Éditorial B2B Tech.

# MISSION
Concevoir un calendrier éditorial pour démontrer une expertise concrète en **{{expertise}}** au rythme de **{{frequence}}**.

# FORMAT ATTENDU
Un tableau structuré comportant pour chaque publication :
- Semaine & Jour
- Titre accrocheur et spécifique
- Angle technique / Retour d'expérience concret
- Structure rapide du post (Accroche -> Démonstration -> Conclusion pratique)`,
    example_output: 'Tableau de 12 publications détaillées sur 4 semaines.',
  },
  {
    id: 'tpl-mkt-ads',
    title: 'Campagne d’acquisition et variantes d’annonces',
    slug: 'campagne-publicitaire',
    description: 'Crée des variantes d’annonces basées sur différents angles psychologiques et opérationnels.',
    category_id: 'cat-mkt',
    category_name: 'Marketing',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 4,
    variables_schema: [
      { name: 'produit_pub', label: 'Produit promu', placeholder: 'ex: Application de gestion de prompts', defaultValue: 'Outil professionnel d’optimisation de prompts IA' },
    ],
    template_content: `# RÔLE
Stratège Acquisition Digitale.

# OBJECTIF
Concevoir 4 variantes d'annonces pour **{{produit_pub}}** selon 4 angles distincts :
1. Gain de temps mesurable au quotidien.
2. Élimination des erreurs de génération de code.
3. Confidentialité et maîtrise locale des données.
4. Comparaison directe Avant / Après optimisation.`,
    example_output: '4 variantes complètes d’annonces avec titres, corps et CTA.',
  },
  {
    id: 'tpl-mkt-copy',
    title: 'Copywriting d’e-mail ou de séquence d’onboarding',
    slug: 'copywriting-sequence',
    description: 'Rédige des messages clairs, orientés action et exempts de remplissage.',
    category_id: 'cat-mkt',
    category_name: 'Marketing',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 5,
    variables_schema: [
      { name: 'objectif_message', label: 'Objectif du message', placeholder: 'ex: Présenter une nouvelle version d’un outil', defaultValue: 'Présenter les fonctionnalités clés d’un nouvel outil à des bêta-testeurs' },
    ],
    template_content: `# RÔLE
Expert en Copywriting B2B et Communication Produit.

# MISSION
Rédiger 3 versions d'un message ayant pour objectif : **{{objectif_message}}** :
- Version 1 : Ultra-directe (moins de 120 mots).
- Version 2 : Orientée démonstration par l'exemple.
- Version 3 : Technique et détaillée.`,
    example_output: '3 versions ciblées avec objets d’e-mail.',
  },

  // === ANALYSE ET PRODUCTIVITÉ (5 modèles) ===
  {
    id: 'tpl-ana-doc',
    title: 'Analyse critique et structuration d’un cahier des charges',
    slug: 'analyse-documentaire',
    description: 'Examine un document long pour en extraire les exigences, les zones d’ombre, les risques et les actions.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'markdown',
    target_provider: 'Google Gemini (Actif)',
    target_model: 'gemini-3-8-flash',
    usage_count: 15,
    variables_schema: [
      { name: 'type_document', label: 'Type de document à analyser', placeholder: 'ex: Cahier des charges client ou spécification technique', defaultValue: 'Cahier des charges fonctionnel et technique' },
      { name: 'objectif_analyse', label: 'Objectif de l’analyse', placeholder: 'ex: Identifier les exigences obligatoires et les points flous', defaultValue: 'Extraire les contraintes non négociables, l’architecture cible et les risques' },
    ],
    template_content: `# RÔLE
Analyste Fonctionnel et Architecte Système Senior.

# MISSION
Analyser de manière exhaustive le document de type **{{type_document}}** avec pour objectif : **{{objectif_analyse}}**.

# MÉTHODOLOGIE D'EXTRACTION
1. **Exigences fonctionnelles et techniques impératives** (classées par module).
2. **Contraintes négatives et interdictions explicites**.
3. **Ambiguïtés, informations manquantes ou contradictions potentielles**.
4. **Plan d'exécution séquentiel par phases** avec critères de validation à chaque étape.`,
    example_output: 'Grille d’exigences + Liste des contraintes + Plan par phases.',
  },
  {
    id: 'tpl-ana-synthese',
    title: 'Synthèse exécutive de rapport complexe',
    slug: 'synthese-de-rapport',
    description: 'Condense un rapport volumineux en conclusions actionnables, chiffres clés et décisions à prendre.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'markdown',
    target_provider: 'Google Gemini (Actif)',
    target_model: 'gemini-3-8-flash',
    usage_count: 9,
    variables_schema: [
      { name: 'sujet_rapport', label: 'Sujet du rapport', placeholder: 'ex: Rapport d’audit de performance', defaultValue: 'Évaluation comparative de solutions techniques' },
    ],
    template_content: `# RÔLE
Analyste Stratégique Senior.

# OBJECTIF
Produire une synthèse exécutive haute densité sur : **{{sujet_rapport}}**.

# FORMAT DE SORTIE
- **L'essentiel en 5 points factuels**.
- **Données chiffrées et faits vérifiables extraits du texte** (sans aucune extrapolation).
- **Décisions recommandées à court et moyen terme**.`,
    example_output: 'Synthèse exécutive structurée en 3 blocs.',
  },
  {
    id: 'tpl-ana-extraction',
    title: 'Extraction structurée d’informations (JSON / Tableaux)',
    slug: 'extraction-informations',
    description: 'Transforme des notes brutes ou des textes non structurés en données normalisées.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'json',
    target_provider: 'Google Gemini (Actif)',
    target_model: 'gemini-3-8-flash',
    usage_count: 8,
    variables_schema: [
      { name: 'champs_cibles', label: 'Champs à extraire', placeholder: 'ex: titre, priorite, echeance, dependances', defaultValue: 'module, fonctionnalite, priorite, statut, critere_validation' },
    ],
    template_content: `# RÔLE
Moteur d'Extraction et de Normalisation de Données.

# INSTRUCTIONS
À partir du texte fourni en entrée, extrais strictement les entités selon les champs suivants : **{{champs_cibles}}**.
- N'invente aucune valeur absente du texte source (utilise \`null\` si une information est manquante).
- Retourne un tableau JSON valide et un récapitulatif Markdown.`,
    example_output: 'Tableau JSON normalisé et vérifié.',
  },
  {
    id: 'tpl-ana-projet',
    title: 'Découpage et organisation de projet technique (WBS)',
    slug: 'organisation-de-projet',
    description: 'Découpe un projet complexe en lots de travaux séquentiels, dépendances et critères de réception.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 11,
    variables_schema: [
      { name: 'projet_a_decouper', label: 'Projet à planifier', placeholder: 'ex: Refonte d’une application locale', defaultValue: 'Développement complet d’une application de Prompt Engineering en 10 phases' },
    ],
    template_content: `# RÔLE
Directeur de Projet Technique & Engineering Manager.

# MISSION
Découper le projet **{{projet_a_decouper}}** en phases logiques (Work Breakdown Structure).

# EXIGENCES
Pour chaque phase, précise :
- Les prérequis bloquants.
- Les livrables techniques concrets.
- Les tests de validation permettant de passer à la phase suivante sans dette cachée.`,
    example_output: 'Plan séquentiel par phases avec jalons et critères de sortie.',
  },
  {
    id: 'tpl-ana-automatisation',
    title: 'Conception de script d’automatisation Python / PowerShell',
    slug: 'automatisation-de-processus',
    description: 'Génère des scripts robustes d’automatisation de tâches sous Windows avec journalisation et gestion d’erreurs.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 12,
    variables_schema: [
      { name: 'tache_auto', label: 'Tâche à automatiser', placeholder: 'ex: Sauvegarde quotidienne de bases SQLite et export JSON', defaultValue: 'Sauvegarde horodatée de base SQLite locale, vérification d’intégrité et rotation des archives' },
      { name: 'environnement_exec', label: 'Environnement d’exécution', placeholder: 'ex: Windows PowerShell 7 + Python 3.12', defaultValue: 'Windows 11 PowerShell + Python 3.12 (chemins avec espaces supportés)' },
    ],
    template_content: `# RÔLE
Ingénieur Automatisation & DevOps Windows/Python.

# OBJECTIF
Automatiser de manière fiable la tâche suivante : **{{tache_auto}}** dans l'environnement **{{environnement_exec}}**.

# CONTRAINTES DE ROBUSTESSE
- Gérer explicitement les chemins de fichiers contenant des espaces et des caractères accentués.
- Vérifier l'existence des répertoires et des dépendances avant exécution.
- Implémenter un mode simulation (\`-WhatIf\` ou \`--dry-run\`) et une journalisation claire sans exposer de secrets.
- Retourner des codes de sortie explicites en cas d'erreur.`,
    example_output: 'Script Python/PowerShell commenté + Instructions d’exécution et de planification.',
  },

  // === GÉNÉRATION DE VIDÉOS & MÉDIAS IA (3 modèles) ===
  {
    id: 'tpl-vid-ia-prompt',
    title: 'Prompt de génération de vidéo IA cinématographique (Veo / Sora / Runway)',
    slug: 'generation-video-ia-cinematographique',
    description: 'Construit des prompts visuels haute fidélité avec mouvements de caméra, éclairage, focale, physique et ambiance.',
    category_id: 'cat-vid',
    category_name: 'Vidéo & Médias IA',
    output_format: 'markdown',
    target_provider: 'Google Gemini (Actif)',
    target_model: 'gemini-3-8-flash',
    usage_count: 18,
    variables_schema: [
      { name: 'sujet_scene', label: 'Sujet et action principale de la scène', placeholder: 'ex: Un développeur travaillant dans un studio minimaliste au lever du soleil', defaultValue: 'Présentation en gros plan d’une interface logicielle minimaliste sur un écran ultra-large dans un bureau d’architecte baigné de lumière naturelle' },
      { name: 'style_visuel', label: 'Style visuel et cinématographique', placeholder: 'ex: Cinéma 35mm, éclairage naturel doré, réaliste', defaultValue: 'Cinématographie commerciale 8K, optique 50mm f/1.8, faible profondeur de champ, colorimétrie neutre et chaleureuse' },
      { name: 'mouvement_camera', label: 'Mouvement de caméra et cadrage', placeholder: 'ex: Travelling avant lent et fluide (Dolly in)', defaultValue: 'Travelling avant lent et fluide (Slow Dolly-In) suivi d’un léger panoramique latéral stabilisé' },
      { name: 'ratio_duree', label: 'Format et durée cible', placeholder: 'ex: 16:9 paysage — 8 secondes', defaultValue: '16:9 (Paysage 1080p) — séquence continue de 8 secondes' },
    ],
    template_content: `# RÔLE ET EXPERTISE
Agis en tant que Réalisateur Publicitaire et Directeur de la Photographie spécialisé dans les modèles de génération de vidéos par IA (Google Veo 3.1, OpenAI Sora, Runway Gen-3).

# OBJECTIF
Générer un dossier de prompts vidéo ultra-précis pour produire la séquence suivante :
- **Scène & Action** : {{sujet_scene}}
- **Esthétique & Lumière** : {{style_visuel}}
- **Mouvement de caméra** : {{mouvement_camera}}
- **Format & Durée** : {{ratio_duree}}

# STRUCTURE DE SORTIE ATTENDUE
1. **Prompt Principal (Version Française détaillée)** : Description continue intégrant le sujet, l'environnement, la texture des matériaux, la dynamique physique, la trajectoire de caméra et l'éclairage.
2. **Prompt Optimisé en Anglais Technique (Prêt pour Veo / Sora / Runway)** : Version calibrée avec la terminologie exacte de cinématographie (*anamorphic lens, volumetric lighting, shallow depth of field, smooth gimbal movement*).
3. **Découpage Temporel Seconde par Seconde (0s → 8s)** : Évolution exacte du mouvement dans le cadre pour éviter toute déformation morphologique.
4. **Contraintes Négatives (Negative Prompt)** : Éléments visuels à exclure (artefacts, texte illisible, sauts de trame, distorsion des mains ou des écrans).`,
    example_output: 'Prompt FR + Prompt EN optimisé Veo/Sora + Timeline 0-8s + Negative Prompt.',
  },
  {
    id: 'tpl-vid-demo-saas',
    title: 'Script et Storyboard de vidéo de démonstration produit / SaaS',
    slug: 'script-video-demo-produit-saas',
    description: 'Structure une vidéo de présentation logicielle percutante (voix-off, captures d’écran à montrer, transitions et appel à l’action).',
    category_id: 'cat-vid',
    category_name: 'Vidéo & Médias IA',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 15,
    variables_schema: [
      { name: 'nom_logiciel', label: 'Nom du produit ou logiciel', placeholder: 'ex: PromptForge AI', defaultValue: 'PromptForge AI' },
      { name: 'probleme_resolu', label: 'Problème utilisateur résolu', placeholder: 'ex: Prompts dispersés et résultats IA imprévisibles', defaultValue: 'Perte de temps avec des prompts improvisés et absence d’historique local structuré' },
      { name: 'duree_cible', label: 'Durée totale de la vidéo', placeholder: 'ex: 90 secondes', defaultValue: '90 secondes (rythme dynamique et démonstration réelle)' },
    ],
    template_content: `# RÔLE
Réalisateur de Vidéos Produit Tech (style Linear / Raycast / Vercel) et Concepteur-Rédacteur.

# MISSION
Concevoir le script complet et le storyboard plan par plan d'une vidéo de démonstration de **{{duree_cible}}** pour **{{nom_logiciel}}**, centrée sur la résolution de : **{{probleme_resolu}}**.

# RÈGLES DE CONCEPTION
- **Zéro blabla abstrait** : Montrer l'interface réelle dès les 5 premières secondes.
- **Structure narrative** : Accroche sur la douleur (0-10s) → Bascule vers le produit (10-20s) → Démonstration de 3 mécanismes clés en action (20-75s) → Preuve de résultat et CTA final (75-90s).

# FORMAT DE SORTIE (TABLEAU SÉQUENTIEL)
Produis un tableau Markdown comprenant pour chaque séquence :
1. **Chronomètre (Timecode)**
2. **Visuel à l'écran (Action précise dans l'interface, zoom curseur, transition)**
3. **Script Voix-Off (Ton naturel, sobre, professionnel)**
4. **Texte superposé (Motion Design / Titres courts)**`,
    example_output: 'Storyboard minuté en 4 colonnes + Script voix-off + Indications de montage.',
  },
  {
    id: 'tpl-vid-short-viral',
    title: 'Script vidéo format court (YouTube Shorts, Reels, TikTok, LinkedIn Video)',
    slug: 'script-video-format-court',
    description: 'Génère un script vertical (9:16) à forte rétention avec accroche en 3 secondes, démonstration visuelle et boucle narrative.',
    category_id: 'cat-vid',
    category_name: 'Vidéo & Médias IA',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 14,
    variables_schema: [
      { name: 'sujet_video', label: 'Sujet ou astuce technique de la vidéo', placeholder: 'ex: Pourquoi 90% des prompts pour coder échouent', defaultValue: 'Comment structurer un prompt d’architecture logicielle pour Claude Code en 45 secondes' },
      { name: 'audience', label: 'Audience cible', placeholder: 'ex: Développeurs, freelances et créateurs de SaaS', defaultValue: 'Développeurs Python/React et créateurs de produits tech' },
    ],
    template_content: `# RÔLE
Expert en Contenu Vidéo Court éducatif et technique à haute rétention.

# OBJECTIF
Rédiger 3 variantes de scripts vidéo courts (45 à 60 secondes, format vertical 9:16) sur le sujet : **{{sujet_video}}** pour l'audience : **{{audience}}**.

# STRUCTURE OBLIGATOIRE DE CHAQUE SCRIPT
1. **Le Hook (0 à 3s)** : Phrase d'accroche visuelle et verbale qui stoppe le défilement sans être racoleuse.
2. **Le Constat / Erreur classique (3 à 15s)** : Ce que tout le monde fait mal aujourd'hui.
3. **La Méthode Actionnable (15 à 45s)** : Démonstration concrète en 3 étapes visuelles à l'écran.
4. **Conclusion & Call-to-Action (45 à 60s)** : Résumé percutant et invitation à tester.`,
    example_output: '3 scripts complets minutés avec hooks visuels et instructions de cadrage 9:16.',
  },

  // === LANDING PAGES & CRO (Modèles enrichis selon la Charte d'Amélioration Landing Page) ===
  {
    id: 'tpl-dev-landing-code',
    title: 'Développement complet d’une Landing Page (React + Tailwind CSS + CRO)',
    slug: 'developpement-landing-page-react-tailwind',
    description: 'Génère le code complet, responsive et accessible d’une landing page haute conversion avec Hero above-the-fold, Bento grid, preuve chiffrée, pricing, FAQ et mode clair/sombre.',
    category_id: 'cat-landing',
    category_name: 'Landing Pages & CRO',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 28,
    variables_schema: [
      { name: 'nom_produit', label: 'Nom du produit ou service', placeholder: 'ex: PromptForge AI', defaultValue: 'PromptForge AI' },
      { name: 'promesse_hero', label: 'Proposition de valeur centrale (H1 + résultat chiffré)', placeholder: 'ex: Structurer des prompts 3x plus précis dès le premier essai', defaultValue: 'Transformez vos idées brutes en prompts d’ingénierie structurés et reproductibles en 30 secondes' },
      { name: 'direction_artistique', label: 'Direction artistique et palette (60-30-10)', placeholder: 'ex: Style Linear/Raycast, sobre, indigo #5B5BD6', defaultValue: 'Minimaliste et chirurgical type Linear/Raycast, règle 60-30-10 (fond #101116 en sombre / #F7F8FA en clair, surfaces #181A20, accent unique #5B5BD6)' },
      { name: 'sections_cles', label: 'Séquence des sections à implémenter', placeholder: 'ex: Top Bar 3 zones, Hero, Bento Grid, Avant/Après, Pricing, FAQ, Lead Capture', defaultValue: '1. Top Bar 3 zones, 2. Hero Above-the-Fold avec démonstration interactive, 3. Constat Avant/Après, 4. Grille Bento asymétrique (Mécanisme -> Résultat), 5. Preuve sociale chiffrée (tabular-nums), 6. Grille Tarifaire / Offre, 7. FAQ accordéon, 8. Formulaire validé & Footer sobre' },
    ],
    template_content: `# RÔLE ET MISSION
Agis en tant qu'Architecte de Conversion (CRO), Designer UI/UX Senior et Développeur Frontend React 19 + TypeScript + Tailwind CSS. Ta mission est de concevoir et coder intégralement la Landing Page haute conversion de **{{nom_produit}}**.

# PROPOSITION DE VALEUR CENTRALE
Promesse principale (Test des 5 secondes Above-the-Fold) : **{{promesse_hero}}**.

# CHARTE D'EXCELLENCE LANDING PAGE (10 RÈGLES NON NÉGOCIABLES)
1. **Top Bar Contract (3 zones strictes)** : Zone 1 = Wordmark sur une ligne (\`whitespace-nowrap shrink-0\`, sans badge ni sous-titre accolé) ; Zone 2 = 4 à 5 liens d'ancrage concis ; Zone 3 = 1 seul bouton CTA primaire.
2. **Hero Above-the-Fold (< 5 secondes)** : H1 impactant (\`clamp(2.25rem, 4vw, 3.75rem)\`, \`text-wrap: balance\`), sous-titre explicite, 1 CTA primaire orienté résultat + réassurance sous le bouton, et aperçu interactif réel à droite.
3. **Séquence Persuasive Complète** : {{sections_cles}}.
4. **Chaîne Fonctionnalité → Mécanisme → Bénéfice Chiffré** : Utiliser une grille Bento asymétrique (\`col-span-2\` / \`col-span-1\`) ou une liste éditoriale numérotée (\`01.\`, \`02.\`, \`03.\`) sans préfixes mécaniques \`//\`.
5. **Système de Design & Règle 60-30-10** : {{direction_artistique}}. Typographie 2+1 (\`Plus Jakarta Sans\` display, \`DM Sans\` corps, \`JetBrains Mono tabular-nums\` pour tous les chiffres, prix et KPIs).
6. **Discipline Anti-Slop** : Zéro boîte dans des boîtes, zéro bordure épaisse gauche (\`border-l-4\`), zéro point vert clignotant décoratif (\`animate-pulse\`), zéro jargon creux (*boostez*, *révolutionnaire*), zéro métadonnée enfermée dans des pilules statiques (utiliser des séparateurs \`·\`).
7. **Adjacence Preuve-Promesse** : Placer les métriques vérifiables (avec unités et période) et témoignages attribués (Nom, Rôle, Entreprise, Avant → Après) directement à côté des affirmations qu'ils prouvent.
8. **Zéro Image Cassée** : Utiliser des visuels haute fidélité avec \`referrerPolicy="no-referrer"\` et conteneur fallback CSS/SVG propre (bannir les URLs externes fragiles non vérifiées).
9. **Interactivité 100 % Câblée** : Commutateur Clair/Sombre, onglets de démonstration ou comparateur interactif, accordéon FAQ, et formulaire de capture avec validation d'e-mail et état de confirmation immédiat.
10. **Responsive, Mobile Sticky Cap (≤ 15 %) & SEO** : Mise en page fluide (375px, 768px, 1440px), hauteur cumulée des barres fixes ≤ 15 % sur mobile, HTML5 sémantique, balises OpenGraph et JSON-LD Schema.org.`,
    example_output: 'Code React/TypeScript complet + Copywriting persuasif intégral + Composants interactifs câblés + Balisage SEO.',
  },
  {
    id: 'tpl-mkt-landing-saas-b2b',
    title: 'Landing Page SaaS / Produit Tech (Copywriting, Preuve & Grille Tarifaire)',
    slug: 'landing-page-saas-b2b-conversion',
    description: 'Conçoit l’architecture persuasive complète et le copywriting intégral d’une page de vente logicielle (Hero, Avant/Après, Mécanisme, Preuve chiffrée, Pricing, FAQ).',
    category_id: 'cat-landing',
    category_name: 'Landing Pages & CRO',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-3-7-sonnet',
    usage_count: 21,
    variables_schema: [
      { name: 'nom_saas', label: 'Nom du SaaS ou de l’application', placeholder: 'ex: DataPulse Analytics', defaultValue: 'ChronosDev — Automatisation de tests et déploiements' },
      { name: 'cible_principale', label: 'Persona / Cible d’acheteurs', placeholder: 'ex: CTOs, Lead Developers et équipes produit', defaultValue: 'Développeurs Full-Stack, CTOs de startups et équipes d’ingénierie' },
      { name: 'benefice_mesurable', label: 'Bénéfice chiffré ou concret', placeholder: 'ex: Diviser par 3 le temps de recette avant mise en production', defaultValue: 'Réduire de 70 % le temps passé à rédiger et maintenir les spécifications et tests' },
    ],
    template_content: `# RÔLE
Architecte de Conversion B2B SaaS, UX Writer et Product Marketer Senior.

# OBJECTIF
Concevoir l'architecture complète et rédiger l'intégralité des textes (Copywriting prêt à intégrer, zéro *Lorem Ipsum*) de la Landing Page pour **{{nom_saas}}**, destinée à **{{cible_principale}}**, avec la promesse centrale : **{{benefice_mesurable}}**.

# RÈGLES D'ÉCRITURE ET D'ARCHITECTURE CRO
- **Bannir les superlatifs vagues** : Interdiction d'utiliser des formules creuses (*"Révolutionnez votre workflow"*, *"Libérez votre potentiel"*). Chaque titre doit énoncer un mécanisme précis et un résultat vérifiable.
- **Chaîne Fonctionnalité → Mécanisme → Bénéfice Chiffré** : Expliquer comment l'outil fonctionne concrètement dans l'interface et quel gain mesurable (temps, argent, fiabilité) l'utilisateur obtient.
- **Micro-copie de réassurance** : Sous chaque CTA primaire, préciser les conditions réelles (ex: *"Installation locale en 2 min · Aucune carte requise · Données 100 % privées"*).

# LIVRABLES ATTENDUS SECTION PAR SECTION
1. **Barre de Navigation Supérieure (Top Bar 3 zones)** : Wordmark, 4 liens d'ancrage concis, et 1 bouton d'action principal orienté résultat.
2. **Hero Section (Above-the-Fold — Test des 5 secondes)** :
   - Sur-titre sobre (texte non encapsulé avec séparateur \`·\`)
   - Titre H1 percutant (\`text-wrap: balance\`) + Sous-titre explicite (15-16px, max 68ch)
   - CTA primaire orienté résultat + CTA secondaire de démonstration + Micro-copie de réassurance
   - Spécification exacte du composant visuel ou aperçu interactif affiché en regard
3. **Diagnostic du Problème (Comparatif Avant / Après)** : Tableau ou mise en regard factuelle entre la méthode manuelle habituelle et l'approche **{{nom_saas}}**.
4. **Piliers Fonctionnels (Grille Bento asymétrique ou numérotation éditoriale \`01.\`, \`02.\`, \`03.\`)** : 3 à 4 capacités clés détaillant le mécanisme et la preuve immédiate.
5. **Preuve Sociale & Métriques d'Impact (\`tabular-nums\`)** : Indicateurs chiffrés contextualisés (unités + période) et structure de 2 témoignages complets (Nom, Rôle, Entreprise, Situation initiale → Résultat chiffré).
6. **Architecture Tarifaire (Pricing Transparent)** : 3 paliers nommés par profil d'audience avec limites explicites, prix alignés et mise en avant non agressive de l'offre recommandée.
7. **Traitement des Objections (FAQ Décisive)** : 6 questions-réponses directes traitant les vrais freins techniques, sécuritaires et budgétaires.
8. **Section Finale de Conversion, Formulaire & Métadonnées SEO** : Rappel de valeur, champs du formulaire validé, balises \`<title>\`, \`meta description\` et données structurées JSON-LD.`,
    example_output: 'Wireframe textuel complet + Copywriting intégral + Matrice Avant/Après + Pricing + FAQ + SEO.',
  },
  {
    id: 'tpl-mkt-landing-audit-cro',
    title: 'Audit CRO & Refonte Complète d’une Landing Page (Avant / Après)',
    slug: 'audit-cro-landing-page',
    description: 'Analyse critique de la clarté above-the-fold, des frictions cognitives, du design anti-slop et des appels à l’action d’une page existante avec réécriture complète.',
    category_id: 'cat-landing',
    category_name: 'Landing Pages & CRO',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 16,
    variables_schema: [
      { name: 'contenu_page', label: 'Texte, prompt ou description de la Landing Page actuelle', placeholder: 'Collez les titres, sections et CTA actuels...', defaultValue: 'Hero générique "Boostez votre productivité avec l’IA", 8 cartes de fonctionnalités abstraites, bouton "En savoir plus"' },
      { name: 'objectif_conversion', label: 'Action de conversion visée', placeholder: 'ex: Téléchargement de l’application ou prise de RDV', defaultValue: 'Téléchargement immédiat de la version locale ou essai interactif' },
    ],
    template_content: `# RÔLE
Expert Senior en Optimisation du Taux de Conversion (CRO), UX Research et Direction Artistique Web.

# MISSION
Auditer sans complaisance la Landing Page (ou le prompt de Landing Page) ci-dessous dont l'objectif de conversion est : **{{objectif_conversion}}**, puis livrer sa refonte optimale.
Contenu actuel analysé :
{{contenu_page}}

# GRILLE D'AUDIT CHIRURGICAL EN 6 POINTS
1. **Test des 5 secondes (Above-the-Fold)** : Comprend-on immédiatement ce qu'est l'offre, pour qui elle est conçue, quel mécanisme la distingue et quelle action effectuer ?
2. **Diagnostic des Frictions Cognitives & du Jargon** : Repérage implacable des promesses vagues, des superlatifs creux, des murs de cartes symétriques monotones et des boutons passifs (*"Envoyer"*, *"En savoir plus"*).
3. **Audit Visuel & Anti-Slop** : Vérification du contrat Top Bar 3 zones, de la règle 60-30-10, de l'absence de pilules statiques surchargées, de l'alignement tabulaire des chiffres (\`tabular-nums\`) et du plafond de 15 % d'éléments fixes sur mobile.
4. **Adjacence Preuve-Promesse & Réassurance** : Les affirmations sont-elles immédiatement étayées par des chiffres précis, un comparatif Avant/Après et une FAQ levant les vraies objections ?
5. **Réécriture Complète (Tableau Avant / Après)** : Produis 3 nouvelles variantes de Hero (H1 + Sous-titre + CTA + Micro-copie de réassurance) ainsi que la structure complète améliorée section par section.
6. **Plan d'Action Priorisé** : Les 5 améliorations à plus fort impact sur le taux de conversion.`,
    example_output: 'Grille de diagnostic CRO en 6 points + Tableau Avant/Après + 3 variantes de Hero + Prompt refondu.',
  },
  {
    id: 'tpl-landing-master-blueprint',
    title: 'Blueprint Complet de Landing Page (Du Prompt Initial au Code & Copywriting)',
    slug: 'blueprint-complet-landing-page-conversion',
    description: 'Transforme une idée de landing page en spécification chirurgicale couvrant copywriting, direction artistique 60-30-10, sections persuasives, interactivité et SEO.',
    category_id: 'cat-landing',
    category_name: 'Landing Pages & CRO',
    output_format: 'xml',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 24,
    variables_schema: [
      { name: 'offre_et_cible', label: 'Offre et audience cible', placeholder: 'ex: Application SaaS de facturation pour freelances et TPE', defaultValue: 'Plateforme d’automatisation et de gestion locale pour développeurs et consultants' },
      { name: 'objectif_action', label: 'Action principale attendue du visiteur (CTA)', placeholder: 'ex: Démarrer l’essai gratuit ou télécharger l’installateur', defaultValue: 'Télécharger l’application locale ou tester le démonstrateur interactif en direct' },
      { name: 'preuves_cles', label: 'Arguments et preuves chiffrées clés', placeholder: 'ex: +65% de gain de temps, zéro configuration Docker, 100% hors-ligne', defaultValue: 'Gain de temps de 65 % sur la structuration, base SQLite 100 % locale, zéro abonnement imposé' },
    ],
    template_content: `<role>
Tu es un Architecte de Landing Pages à Haute Conversion (CRO), Directeur Artistique UI/UX et Ingénieur Frontend Senior (React 19, TypeScript, Tailwind CSS).
</role>

<context>
Offre et audience cible : {{offre_et_cible}}
Objectif de conversion principal (CTA) : {{objectif_action}}
Arguments et preuves chiffrées à démontrer : {{preuves_cles}}
</context>

<objective>
Concevoir et implémenter une Landing Page complète, persuasive, rapide et visuellement irréprochable qui passe le test des 5 secondes et guide méthodiquement le visiteur de la proposition de valeur jusqu'à l'action de conversion.
</objective>

<landing_page_architecture>
1. **Top Bar (Contrat strict en 3 zones)** : Wordmark propre à gauche (\`whitespace-nowrap shrink-0\`), 4 liens d'ancrage au centre, 1 seul bouton CTA primaire à droite.
2. **Hero Above-the-Fold** : H1 clair et différenciant (\`clamp(2.25rem, 4vw, 3.75rem)\`, \`text-wrap: balance\`), sous-titre concret (max 68ch), CTA primaire verbe d'action + résultat avec micro-copie de réassurance, et composant de démonstration interactif à droite.
3. **Constat Avant / Après** : Comparaison honnête et factuelle entre l'approche classique chronophage et le nouveau mécanisme proposé.
4. **Grille Bento Asymétrique des Capacités** : 3 à 4 fonctionnalités structurées selon la chaîne *Fonctionnalité → Mécanisme → Bénéfice mesurable* avec numérotation éditoriale (\`01.\`, \`02.\`, \`03.\`).
5. **Preuves Chiffrées & Témoignages Attribués** : Métriques alignées en \`font-mono tabular-nums\` avec unités et période explicites, placées directement à côté des promesses.
6. **Grille Tarifaire / Offre Claire** : Paliers transparents avec comparateur ou commutateur fonctionnel.
7. **FAQ Anti-Objections (Accordéon interactif)** : 5 à 6 réponses franches aux objections techniques, financières et de sécurité.
8. **Capture Finale Validée & Footer Sobre** : Formulaire avec validation des entrées et état de confirmation immédiat.
</landing_page_architecture>

<constraints>
- **Règle de couleur 60-30-10** : 60 % fond neutre cohérent, 30 % surfaces structurelles avec bordures fines \`1px\`, 10 % couleur d'accent réservée aux actions primaires. Contraste WCAG AA garanti en mode Clair et Sombre.
- **Anti-Slop strict** : Aucune carte imbriquée dans une carte, aucune bordure gauche épaisse (\`border-l-4\`), aucun point vert clignotant décoratif (\`animate-pulse\`), aucune métadonnée statique enfermée dans des badges pilules (utiliser des séparateurs \`·\`), aucun texte *Lorem Ipsum*.
- **Zéro bouton mort & Zéro image cassée** : Chaque contrôle interactif doit posséder un gestionnaire d'état réel ; chaque image doit avoir \`referrerPolicy="no-referrer"\` et un fallback visuel CSS/SVG élégant.
</constraints>`,
    example_output: 'Spécification XML complète et implémentation de la Landing Page haute conversion.',
  },

  // === CONCEPTION ET CRÉATION DE SITES WEB (3 nouveaux modèles) ===
  {
    id: 'tpl-dev-site-vitrine-pro',
    title: 'Création d’un Site Web Vitrine Professionnel Multi-Pages',
    slug: 'creation-site-web-vitrine-professionnel',
    description: 'Conçoit et code un site web complet (Accueil, Services, Réalisations, À propos, Contact) avec SEO, performance et design sur mesure.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Anthropic Profile',
    target_model: 'claude-code',
    usage_count: 20,
    variables_schema: [
      { name: 'activite_entreprise', label: 'Activité, marque ou entreprise', placeholder: 'ex: Cabinet de conseil en architecture logicielle & IA', defaultValue: 'Studio d’ingénierie logicielle Python/React et conseil en IA' },
      { name: 'pages_du_site', label: 'Arborescence des pages à créer', placeholder: 'ex: Accueil, Expertises, Études de cas, À propos, Contact', defaultValue: 'Accueil, Nos Expertises, Études de Cas Chiffrées, Méthodologie, Contact & Devis interactif' },
      { name: 'stack_web', label: 'Stack technique choisie', placeholder: 'ex: React + TypeScript + Tailwind CSS (ou Django Templates)', defaultValue: 'React 19 + TypeScript + Vite + Tailwind CSS' },
    ],
    template_content: `# RÔLE ET MISSION
Tu es un Architecte Web Full-Stack et Directeur Artistique Digital. Ta mission est de concevoir et d'implémenter le site web complet pour : **{{activite_entreprise}}**.

# ARBORESCENCE & PAGES À IMPLÉMENTER
Pages fonctionnelles attendues : **{{pages_du_site}}**.
Stack technique : **{{stack_web}}**.

# EXIGENCES FONCTIONNELLES ET QUALITÉ
1. **Navigation fluide** : Barre de navigation supérieure épurée, états actifs clairs, menu mobile adaptatif et pied de page complet.
2. **Contenu authentique et réaliste** : Rédige des textes métier précis, crédibles et convaincants en français (aucun texte *Lorem Ipsum*).
3. **Composants interactifs réels** :
   - Filtrage dynamique des réalisations / études de cas par domaine.
   - Calculateur ou configurateur de besoin / devis interactif.
   - Formulaire de contact complet avec validation des champs et état de confirmation.
   - Mode Clair et Mode Sombre complets.
4. **SEO & Accessibilité** : Balises sémantiques HTML5 (\`<header>\`, \`<main>\`, \`<section>\`, \`<footer>\`), contrastes WCAG AA et métadonnées OpenGraph.`,
    example_output: 'Architecture complète du site web + Code de toutes les pages et composants interactifs.',
  },
  {
    id: 'tpl-dev-site-ecommerce',
    title: 'Architecture et Développement d’un Site Web E-Commerce / Catalogue',
    slug: 'developpement-site-web-ecommerce',
    description: 'Structure une boutique en ligne ou un catalogue interactif avec fiches produits, filtres multicritères, panier persistant et tunnel de commande.',
    category_id: 'cat-dev',
    category_name: 'Développement logiciel',
    output_format: 'markdown',
    target_provider: 'Cursor IDE Profile',
    target_model: 'cursor-agent',
    usage_count: 13,
    variables_schema: [
      { name: 'type_produits', label: 'Type de produits ou catalogue vendu', placeholder: 'ex: Équipements audio studio, livres techniques, mobilier', defaultValue: 'Matériel ergonomique et stations de travail pour développeurs' },
      { name: 'fonctionnalites_boutique', label: 'Fonctionnalités clés attendues', placeholder: 'ex: Filtres dynamiques, comparateur, panier latéral, commande', defaultValue: 'Catalogue filtrable, vue détaillée produit avec spécifications techniques, tiroir panier persistant et récapitulatif de commande' },
    ],
    template_content: `# RÔLE
Ingénieur E-Commerce Full-Stack et Spécialiste UX Retail.

# OBJECTIF
Concevoir et développer un site web e-commerce complet dédié à : **{{type_produits}}**.
Fonctionnalités obligatoires : **{{fonctionnalites_boutique}}**.

# DIRECTIVES D'IMPLÉMENTATION
1. **Mise en valeur éditoriale des produits** : Grille aérée, typographie soignée, prix alignés en chiffres tabulaires (\`tabular-nums\`), étiquettes de stock claires.
2. **Moteur de recherche et de filtrage client** : Filtrage instantané par catégorie, gamme de prix et caractéristiques techniques + tri par prix/pertinence.
3. **Gestion du Panier (State & Persistance)** : Ajout/suppression d'articles, modification des quantités, calcul automatique des sous-totaux et sauvegarde dans le stockage local ou SQLite.
4. **Fiche Produit Détaillée** : Galerie visuelle, caractéristiques techniques structurées, produits complémentaires et avis vérifiables.`,
    example_output: 'Application E-Commerce complète avec catalogue, filtres, fiches produits et panier.',
  },
  {
    id: 'tpl-ana-cahier-charges-site-web',
    title: 'Cahier des charges complet et Arborescence UX de Site Web',
    slug: 'cahier-des-charges-arborescence-site-web',
    description: 'Formalise le plan complet d’un projet de création ou de refonte de site web : objectifs, arborescence, wireframes textuels et spécifications.',
    category_id: 'cat-ana',
    category_name: 'Analyse et productivité',
    output_format: 'markdown',
    target_provider: 'OpenAI Profile',
    target_model: 'gpt-4o',
    usage_count: 16,
    variables_schema: [
      { name: 'projet_web', label: 'Nature du site web à concevoir', placeholder: 'ex: Portail client et site institutionnel d’une PME', defaultValue: 'Site web vitrine et portail de ressources pour un éditeur de logiciels' },
      { name: 'objectifs_principaux', label: 'Objectifs métier prioritaires', placeholder: 'ex: Générer des demandes qualifiées et présenter les offres', defaultValue: 'Présenter clairement les solutions, démontrer l’expertise technique et convertir les visiteurs en contacts qualifiés' },
    ],
    template_content: `# RÔLE
Directeur de Projet Digital et Architecte de l'Information (UX).

# MISSION
Rédiger le cahier des charges fonctionnel, éditorial et technique complet pour le projet : **{{projet_web}}**.
Objectifs prioritaires : **{{objectifs_principaux}}**.

# STRUCTURE DU CAHIER DES CHARGES
1. **Contexte, Cibles (Personas) et Parcours Utilisateurs**.
2. **Arborescence Complète du Site (Sitemap)** représentée sous forme de schéma ASCII clair.
3. **Spécifications Détaillées Page par Page (Wireframes textuels)** : Objectif de la page, blocs de contenu dans l'ordre de lecture, et appels à l'action.
4. **Exigences Techniques & Design** : Charte graphique (clair/sombre), responsive design, temps de chargement, sécurité et hébergement/déploiement.
5. **Stratégie SEO & Mesure de la Performance** : Structure des URLs, balisage sémantique, données structurées Schema.org et critères de recette finale.`,
    example_output: 'Cahier des charges complet + Arborescence ASCII + Wireframes page par page.',
  },
];

