# Guide d'Utilisation Complet — PromptForge IA (v1.5)

Bienvenue dans **PromptForge IA**, l'atelier d'ingénierie de prompts, de structuration d'applications full-stack et d'architecture de Landing Pages à haute conversion (CRO).

Ce guide détaille l'ensemble des fonctionnalités de l'application, son installation sur votre machine ou serveur, ainsi que les bonnes pratiques pour tirer le maximum de chaque module.

---

## Table des matières

1. [Présentation Générale](#1-présentation-générale)
2. [Installation & Démarrage Rapide](#2-installation--démarrage-rapide)
   - [Prérequis](#prérequis)
   - [Installation sur Windows](#installation-sur-windows)
   - [Installation sur macOS / Linux](#installation-sur-macos--linux)
   - [Configuration des Clés API](#configuration-des-clés-api)
3. [Architecture des 4 Modules Principaux](#3-architecture-des-4-modules-principaux)
   - [Module 1 : Tableau de Bord (Dashboard)](#module-1--tableau-de-bord-dashboard)
   - [Module 2 : Générateur d'Applications (App Builder)](#module-2--générateur-dapplications-app-builder)
   - [Module 3 : Générateur de Landing Pages (CRO Builder)](#module-3--générateur-de-landing-pages-cro-builder)
   - [Module 4 : Bibliothèque & Historique des Prompts](#module-4--bibliothèque--historique-des-prompts)
4. [Fonctionnalités Avancées](#4-fonctionnalités-avancées)
   - [Importation & Extraction de Dépôt GitHub](#importation--extraction-de-dépôt-github)
   - [Analyse de Document & Cahier des Charges (.txt, .md)](#analyse-de-document--cahier-des-charges)
   - [Moteur d'Auto-Critique IA & Score de Qualité (/100)](#moteur-dauto-critique-ia--score-de-qualité-100)
   - [Mode Hors-Ligne (Fallback Intelligent)](#mode-hors-ligne-fallback-intelligent)
   - [Installation en tant qu'Application Bureau / Mobile (PWA)](#installation-en-tant-quapplication-bureau--mobile-pwa)
5. [Référence de l'API Backend & Base de Données](#5-référence-de-lapi-backend--base-de-données)
6. [Dépannage (Troubleshooting)](#6-dépannage-troubleshooting)

---

## 1. Présentation Générale

**PromptForge IA** transforme une idée brute, un dépôt GitHub existant ou un cahier des charges en un **Méga-Prompt d'ingénierie ultra-structuré**, directement exploitable dans des outils de génération de code (Cursor, Windsurf, Bolt.new, v0, Claude Code, Lovable, AI Studio) ou par des équipes de développement.

### Points forts :
- **Génération Full-Stack (6 étapes guidées)** : Définition du projet, stack technique, design system, fonctionnalités, sécurité et déploiement.
- **Constructeur de Landing Pages CRO (5 étapes)** : Basé sur des frameworks de copywriting éprouvés (*PAS, AIDA, StoryBrand, BAB*) et des inspirations visuelles (*Stripe, Linear, Apple, Vercel*).
- **Auto-Critique IA interactive** : Évalue la complétude de votre prompt sur 100 points, détecte les angles morts techniques et applique les correctifs en un clic.
- **Persistance locale SQLite** : Toutes vos générations et préférences sont sauvegardées localement dans `prompts.db` via `better-sqlite3`.

---

## 2. Installation & Démarrage Rapide

### Prérequis
- **Node.js** : Version 18.x ou supérieure recommandée ([Télécharger Node.js](https://nodejs.org/))
- **Git** : Pour cloner le dépôt ([Télécharger Git](https://git-scm.com/))

```bash
git clone https://github.com/yyracine/PROMPTFORGE-AI.git
cd PROMPTFORGE-AI
```

### Installation sur Windows
Double-cliquez simplement sur les scripts fournis à la racine du projet :
1. **`install.bat`** : Installe toutes les dépendances npm et crée automatiquement votre fichier `.env` s'il n'existe pas.
2. **`start.bat`** : Démarre le serveur Express + Vite sur `http://localhost:3000` et ouvre votre navigateur.

### Installation sur macOS / Linux
Depuis votre terminal :
```bash
chmod +x install.sh start.sh
./install.sh
./start.sh
```

Vous pouvez également utiliser les commandes npm classiques :
```bash
npm install
npm run dev
```

### Configuration des Clés API
Ouvrez le fichier `.env` à la racine du projet ou passez par l'interface graphique (**Paramètres ⚙️** en bas de la barre latérale gauche) :
- **Clé API Gemini (`GEMINI_API_KEY`)** : Permet d'utiliser les modèles `gemini-2.5-flash` et `gemini-2.5-pro` pour l'auto-complétion des formulaires, la génération de méga-prompts et l'audit qualité.
- **Fournisseur IA alternatif** : Vous pouvez configurer un endpoint compatible OpenAI, Anthropic ou un modèle local (Ollama / LM Studio) depuis la modale **Paramètres IA**.

---

## 3. Architecture des 4 Modules Principaux

### Module 1 : Tableau de Bord (Dashboard)
Accessible dès l'ouverture de l'application, le tableau de bord offre une vue analytique complète sur votre activité :
- **Indicateurs Clés (KPIs)** : Nombre total de prompts forgés, répartition Applications vs Landing Pages, et activité des 7 derniers jours.
- **Graphiques Interactifs** :
  - *Activité des 7 derniers jours* (Graphique d'aires dynamique).
  - *Répartition par Type de Projet* (Donut chart : SaaS, E-commerce, Mobile, API, etc.).
  - *Styles de Design Préférés* (Graphique en barres horizontales).
- **Actions Rapides** : Accès direct au générateur d'applications, au constructeur de Landing Pages ou à vos dernières créations.

---

### Module 2 : Générateur d'Applications (App Builder)
Le cœur de PromptForge IA vous guide à travers **6 étapes structurées** :

1. **Étape 1 — Identité & Vision du Projet**
   - Nom de l'application, type (Web App SaaS, Application Mobile, API Backend, Dashboard, etc.), description détaillée et public cible.
   - *Astuce* : Utilisez le bouton **« Remplissage Magique IA »** en haut à droite après avoir saisi une simple phrase d'intention pour pré-remplir automatiquement les 6 étapes !
2. **Étape 2 — Stack Technique & Architecture**
   - Choix du Frontend (React, Next.js, Vue, Svelte, Flutter...), Backend (Node.js/Express, Python/FastAPI, Go, Supabase...), Base de données (PostgreSQL, SQLite, MongoDB, Firebase) et Architecture (Monolithe modulaire, Microservices, Serverless).
3. **Étape 3 — Fonctionnalités & Modules Clés**
   - Sélection rapide de briques fonctionnelles (Authentification OAuth/JWT, Paiements Stripe, Temps réel WebSockets, Export PDF/CSV, RBAC multi-rôles, etc.) et ajout de fonctionnalités sur mesure.
4. **Étape 4 — Design System & Expérience Utilisateur (UX)**
   - Style visuel (Minimaliste Moderne, Brutaliste, Glassmorphism, Cyberpunk, Corporate...), palette de couleurs, mode sombre/clair et exigences d'accessibilité/responsive.
5. **Étape 5 — Contraintes, Sécurité & Qualité**
   - Niveau de sécurité (OWASP, RGPD, chiffrement), stratégie de tests (Unitaires Vitest/Jest, E2E Playwright) et exigences de performance.
6. **Étape 6 — Livrables & Format du Prompt**
   - Choix de la langue de sortie, du niveau de détail et lancement de la génération du **Méga-Prompt**.

---

### Module 3 : Générateur de Landing Pages (CRO Builder)
Conçu spécifiquement pour les marketeurs, fondateurs de SaaS et designers souhaitant générer une page de vente à très fort taux de conversion :

1. **Produit & Proposition de Valeur** : Nom de l'offre, promesse principale (Unique Value Proposition) et audience cible.
2. **Objectif de Conversion & CTA** : Inscription Waitlist, Essai Gratuit SaaS, Achat Direct, Prise de RDV (Calendly) ou Téléchargement de Lead Magnet.
3. **Framework de Copywriting** :
   - **PAS** (*Problem - Agitate - Solution*) : Idéal pour adresser une douleur client urgente.
   - **AIDA** (*Attention - Interest - Desire - Action*) : Classique universel pour pages de vente.
   - **StoryBrand** : Place l'utilisateur en héros et votre produit en guide.
   - **BAB** (*Before - After - Bridge*) : Met en avant la transformation concrète.
4. **Direction Artistique & Inspirations** : Style visuel inspiré de *Stripe, Linear, Apple, Vercel* ou *Raycast*, choix de la typographie et palette chromatique.
5. **Architecture des Sections & Preuve Sociale** : Sélection et ordonnancement des blocs (Hero avec mockup interactif, barre de logos, grille Bento, comparatif Avant/Après, témoignages, tarification à 3 niveaux, FAQ accordéon).

---

### Module 4 : Bibliothèque & Historique des Prompts
Retrouvez l'intégralité de vos prompts générés :
- **Recherche instantanée & Filtres** : Filtrez par type (Application vs Landing Page) ou recherchez par mot-clé dans le titre ou le contenu.
- **Prévisualisation Markdown & Copie** : Consultez chaque prompt avec coloration syntaxique, copiez-le en un clic dans le presse-papiers ou téléchargez-le au format `.md`.
- **Rechargement dans l'Éditeur** : Cliquez sur un prompt existant pour recharger ses paramètres dans le générateur et créer une nouvelle variante.
- **Suppression** : Nettoyez vos anciens essais d'un simple clic.

---

## 4. Fonctionnalités Avancées

### Importation & Extraction de Dépôt GitHub
Dans l'étape 1 du Générateur d'Applications, collez l'URL d'un dépôt GitHub public (ex: `https://github.com/utilisateur/projet`) :
- PromptForge IA inspecte automatiquement l'arborescence, le `package.json` et le `README.md` via son proxy backend (`/api/github/extract`).
- Les champs du formulaire (Stack technique, description, fonctionnalités existantes) sont automatiquement pré-remplis pour vous permettre de générer un prompt de refactoring, de migration ou d'ajout de fonctionnalités.

### Analyse de Document & Cahier des Charges
Vous disposez déjà d'un brief client ou d'un cahier des charges en `.txt` ou `.md` ?
- Importez votre fichier directement à l'étape 1.
- L'IA extrait les spécifications essentielles et configure les 6 étapes du générateur en quelques secondes.

### Moteur d'Auto-Critique IA & Score de Qualité (/100)
Une fois votre Méga-Prompt généré, cliquez sur **« Analyser & Améliorer le Prompt (Auto-Critique IA) »** :
- **Score sur 100** : Évaluation objective de la clarté, de la cohérence architecturale et de la précision technique.
- **Points Forts & Angles Morts** : Liste détaillée des éléments bien spécifiés et des oublis potentiels (ex: gestion des erreurs, états vides, sécurité API, responsive mobile).
- **Application en 1 clic** : Cliquez sur **« Appliquer les améliorations »** pour régénérer une version enrichie et corrigée de votre prompt.

### Mode Hors-Ligne (Fallback Intelligent)
Si vous n'avez pas configuré de clé API ou si vous travaillez hors connexion :
- PromptForge IA bascule automatiquement sur son **moteur de compilation déterministe local**.
- Vos réponses aux étapes du formulaire sont assemblées selon des templates d'ingénierie experts (Architecture, Spécifications UI/UX, Plan d'implémentation étape par étape), garantissant que l'outil reste 100% fonctionnel en toute circonstance.

### Installation en tant qu'Application Bureau / Mobile (PWA)
PromptForge IA intègre un manifeste PWA complet et des icônes vectorielles dédiées :
- Depuis Chrome, Edge ou Brave, cliquez sur l'icône **« Installer PromptForge IA »** dans la barre d'adresse (ou sur le bouton d'installation dans la barre latérale) pour l'utiliser comme une véritable application native dans sa propre fenêtre.

---

## 5. Référence de l'API Backend & Base de Données

Le serveur Express (`server.ts`) expose les routes REST suivantes sur le port `3000` :

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/prompts` | Récupère l'historique complet des prompts sauvegardés (triés du plus récent au plus ancien). |
| `POST` | `/api/prompts` | Sauvegarde un nouveau prompt (`title`, `type`, `content`, `form_data`). |
| `DELETE` | `/api/prompts/:id` | Supprime un prompt de la base SQLite locale. |
| `GET` | `/api/settings` | Récupère la configuration IA enregistrée dans la table `settings`. |
| `POST` | `/api/settings` | Met à jour les paramètres du fournisseur IA (`provider`, `model`, `apiKey`, `baseUrl`). |
| `POST` | `/api/ai/generate` | Proxy sécurisé pour l'exécution de requêtes vers Gemini, OpenAI ou Anthropic. |
| `POST` | `/api/github/extract` | Extrait les métadonnées (`README`, `package.json`, langages) d'un dépôt GitHub public. |

Toutes les données sont stockées dans le fichier **`prompts.db`** à la racine du projet. Pour sauvegarder vos données, il vous suffit de copier ce fichier `prompts.db`.

---

## 6. Dépannage (Troubleshooting)

- **Le port 3000 est déjà utilisé :**
  Fermez l'autre instance Node.js en cours d'exécution ou modifiez la variable `PORT` dans `server.ts`.
- **Erreur lors de l'installation de `better-sqlite3` sur Windows :**
  Assurez-vous d'utiliser une version LTS récente de Node.js (v18, v20 ou v22) qui télécharge automatiquement les binaires précompilés sans nécessiter Visual Studio Build Tools.
- **L'IA indique une erreur de clé API :**
  Vérifiez dans le menu **Paramètres IA** (en bas à gauche) que votre clé API Gemini ou OpenAI ne contient pas d'espace superflu au début ou à la fin, ou laissez le champ vide pour utiliser la clé définie dans `.env`.

---

*Conçu avec précision pour accélérer la création logicielle assistée par IA.*
