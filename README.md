<div align="center">

# ⚡ PromptForge IA

**L'atelier personnel d'ingénierie de prompts professionnels pour développeurs, équipes produit & créateurs.**

[![Node.js Version](https://img.shields.io/badge/Node.js-v20%20%7C%20v22%20LTS-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Storage-SQLite%20(node%3Asqlite)-003B57?logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

*Structurez, optimisez, évaluez, comparez et archivez vos prompts d'ingénierie avec persistance locale 100% souveraine et intégration directe des modèles d'élite.*

[Fonctionnalités](#-fonctionnalités-clés) • [Méthodologie C-T-C-D / P-R-I-E-F-V](#-méthodologie-délite-intégrée) • [Installation Rapide](#-installation-rapide) • [Architecture](#-architecture-technique) • [Documentation](#-documentation)

---

</div>

## 📌 Présentation

**PromptForge IA** est une suite logicielle complète conçue pour élever vos interactions avec les grands modèles de langage (LLM) et assistants de programmation autonomes (Claude Code, Cursor Composer, OpenCode, Gemini 3.8 Flash / 1.5 Pro, GPT-4o).

Finis les prompts amateurs et les résultats approximatifs : PromptForge transforme vos besoins bruts en **contrats d'ingénierie stricts, hiérarchisés et vérifiables**, tout en conservant l'intégralité de vos données, historiques et templates dans une **base locale SQLite (WAL)** sans abonnement cloud imposé.

---

## 🚀 Fonctionnalités Clés

### 1. 🛠️ Générateur de Prompts Structurés (`GeneratorView`)
- **Assistant de Clarification proactif :** Analyse le besoin avant génération et pose entre 2 et 4 questions ciblées pour combler les angles morts.
- **Auto-complétion contextuelle :** Suggestions en temps réel de mots-clés métiers selon le domaine sélectionné.
- **3 Modes de Génération :**
  - *Rapide :* Synthétique, direct et immédiatement opérationnel.
  - *Professionnel :* Structure méthodique complète (Rôle, Contexte, Objectif, Contraintes, Format).
  - *Expert :* Gestion des cas limites, garde-fous anti-hallucination, checklist d'auto-évaluation cochée.
- **Calculateur de Tokens en Temps Réel :** Jauge dynamique BPE/SentencePiece pour les modèles Gemini standards (**Gemini 3.8 Flash**, **Gemini 1.5 Flash**, **Gemini 1.5 Pro**), calcul d'occupation de la fenêtre contextuelle (1M à 2M tokens) et estimation du coût en USD.

### 2. 🔬 Module d'Optimisation Chirurgicale (`OptimizerView`)
- Opérations spécialisées au choix :
  - *Élimination des ambiguïtés & buzzwords.*
  - *Renforcement des contraintes négatives (interdits explicites).*
  - *Injecter le raisonnement en chaîne (Chain-of-Thought).*
  - *Structuration en blocs contractuels P-R-I-E-F-V.*
  - *Ajout de tests unitaires et critères d'acceptation vérifiables.*
- **Diff temps réel & Bilan chirurgical :** Visualisation des éléments clarifiés, des contradictions corrigées et des hypothèses introduites.

### 3. 🎯 Générateur Spécialisé Landing Pages & CRO (Conversion)
- Intégration native des **10 règles d'ingénierie CRO** :
  - *Test des 5 secondes Above-the-Fold (Hero).*
  - *Top Bar contractuelle en 3 zones.*
  - *Séquence persuasive : Avant/Après ➔ Bento Grid (Mécanisme -> Bénéfice chiffré) ➔ Preuves en tabular-nums ➔ Pricing ➔ FAQ anti-objections ➔ Capture validée.*
  - *Système de design 60-30-10 et discipline Anti-Slop.*

### 4. 📊 Évaluateur Qualité 8 Dimensions & Comparateur de Modèles (`EvaluatorView`)
- **Audit approfondi sur 8 dimensions standardisées :** Clarté, Précision, Contexte, Cohérence, Contraintes, Résultat attendu, Format de sortie et Vérifiabilité (Score sur 100).
- **Mode Dual :** Analyse heuristique déterministe locale instantanée + Audit IA approfondi.
- **Comparateur de modèles côte-à-côte :** Évaluation comparative avec scoring objectif (0 à 10) et recommandation de modèle.

### 5. 🗄️ Bibliothèque Locale & Versionnement SQLite (`LibraryView`)
- **Persistance native avec `node:sqlite` :** Aucune dépendance C++ lourde (`node-gyp`), fonctionne nativement sous Windows, macOS et Linux.
- **Historique complet des versions :** Chaque modification ou régénération crée une version restaurable en 1 clic sans écraser le passé.
- **Recherche plein texte instantanée :** Filtrage insensible à la casse et aux accents sur le titre, le contenu, les tags ou les dossiers.
- **Organisation par dossiers métiers & tags :** Classement flexible et personnalisable.
- **Exports universels :** Export de la bibliothèque (complète ou filtrée) vers **.JSON** et **.CSV** (compatible Excel / Google Sheets), ainsi qu'en **.PDF**, **.MD** et **.TXT**.

### 6. 🌓 TopBar & Expérience Utilisateur
- **Bouton de basculement de thème (Dark / Light) :** Mémorisation automatique dans le `localStorage` et synchronisation sur l'élément racine (`html.dark`).
- **PWA (Progressive Web App) :** Installable en 1 clic sur Chrome, Edge, Safari ou mobile, utilisable comme une application native de bureau.

---

## 🧠 Méthodologie d'Élite Intégrée

PromptForge IA applique les méthodologies de prompt engineering issues des meilleures pratiques du secteur :

```
┌────────────────────────────────────────────────────────────────────────┐
│                      STRUCTURE CONTRACTUELLE P-R-I-E-F-V               │
├────────────────────────────────────────────────────────────────────────┤
│ [P · PERSONA]     → Métier + niveau d'expérience + ancrage géographique│
│ [R · BUT/RÔLE]    → Objectif mesurable et action concrète attendue     │
│ [I · INSTRUCTIONS]→ Sous-blocs : Ton / Structure / Interdits / Longueur│
│ [E · EXEMPLES]    → 1 bon exemple + 1 anti-exemple + Faits obligatoires│
│ [F · FORMAT]      → Livrable pré-fonctionnel (Markdown, JSON, tableaux)│
│ [V · VÉRIFICATION]→ Checklist d'auto-évaluation cochée par l'IA        │
└────────────────────────────────────────────────────────────────────────┘
```

- **Cadre C-T-C-D :** Contexte, Tâche, Contraintes, Données (réduit le taux d'hallucination de 50 à 70 %).
- **Règle Anti-Hallucination :** Tout fait ou chiffre non fourni dans la base source est formellement interdit d'invention et marqué par le symbole contractuel `[?]`.
- **Dosage B2B Équilibré :** 20% de surprise cadrée (chiffre terrain en accroche et question tranchante en chute) et 80% de cohérence stricte et prévisible dans le corps du texte.

---

## 💻 Installation Rapide

### Prérequis
- **Node.js** version `20.x` ou `22.x LTS` ([Télécharger Node.js](https://nodejs.org/))
- **Git**

### Cloner et installer sous Windows, macOS ou Linux

```bash
# 1. Cloner le dépôt
git clone https://github.com/yyracine/PROMPTFORGE-AI.git PromptForge_AI
cd PromptForge_AI

# 2. Installer les dépendances
npm install

# 3. Lancer l'application
npm run dev
```

L'application démarre immédiatement sur :  
👉 **`http://localhost:3000`**

---

## 🪟 Lancement Simplifié sous Windows

Pour les utilisateurs sous Windows, des scripts autonomes préconfigurés sont disponibles à la racine du projet :

- **`lancer-windows.bat` (Recommandé) :**  
  Double-cliquez dessus. Il vérifie et installe automatiquement les dépendances si nécessaire, prépare le fichier `.env`, lance le serveur et ouvre votre navigateur par défaut sans aucune manipulation technique.
- **`setup-windows.bat` :**  
  Assistant d'installation guidé avec création optionnelle d'un raccourci sur votre Bureau Windows.

---

## 🔑 Configuration de la Clé API Gemini

PromptForge IA est immédiatement utilisable en mode heuristique local sans clé. Pour activer la génération neuronale et l'audit approfondi par IA :

1. Obtenez une clé API gratuite sur [Google AI Studio](https://aistudio.google.com/).
2. Ouvrez l'application ➔ rendez-vous dans **Paramètres** (ou section 2 Fournisseurs IA).
3. Collez votre clé `AIzaSy...` et cliquez sur **« Enregistrer & Activer »**.  
   *(La clé est immédiatement sauvegardée localement dans votre fichier `.env` sécurisé).*

---

## 🏗️ Architecture Technique

```
PromptForge_AI/
├── .data/                      # Base de données locale SQLite (WAL mode)
│   └── promptforge.sqlite
├── docs/                       # Base de connaissances d'ingénierie de prompts
│   └── knowledge_base_prompt_engineering.md
├── public/                     # Assets statiques, manifest PWA et archive téléchargeable
├── scripts/                    # Scripts d'automatisation PowerShell / Bash
├── src/
│   ├── components/
│   │   ├── common/             # TokenCounterBar, PWA Manager, Toasts
│   │   ├── layout/             # TopBar (Thème clair/sombre, recherche), Sidebar
│   │   └── views/              # GeneratorView, OptimizerView, EvaluatorView,
│   │                           # LibraryView, SoftwareDevView, SettingsView
│   ├── context/                # WorkspaceContext (Gestion centralisée réactive)
│   ├── lib/                    # TokenEstimator, ReportExporter (CSV/PDF), Autocomplete
│   ├── types/                  # Définitions TypeScript strictes
│   ├── App.tsx                 # Racine React avec Error Boundary
│   ├── main.tsx                # Point d'entrée DOM
│   └── index.css               # Design tokens Tailwind CSS v4
├── server.ts                   # Serveur Express Full-Stack + SQLite + API Gemini
├── vite.config.ts              # Configuration Vite + PWA + Tailwind
├── lancer-windows.bat          # Lanceur Windows 1-clic direct
├── package.json
└── README.md
```

---

## 📦 Scripts Disponibles

| Commande | Action |
| :--- | :--- |
| `npm run dev` | Lance le serveur Express et l'interface Vite en mode développement |
| `npm run build` | Compile l'application React et génère le service worker PWA dans `dist/` |
| `npm run start` | Démarre le serveur en mode production |
| `npm run lint` | Valide les types TypeScript sans émission de fichiers |

---

## 🔒 Confidentialité & Souveraineté

- **100% Local par défaut :** Vos prompts, versions, tags, statistiques et métriques sont stockés dans votre base SQLite locale (`.data/promptforge.sqlite`).
- **Pas de télémétrie cachée :** Vos textes ne sont transmis aux serveurs de Google que lors des actions explicites de génération ou d'audit que vous déclenchez.
- **Portabilité complète :** Exportez ou restaurez vos données à tout moment via les formats universels `.json` et `.csv`.

---

## 📄 Licence

Ce projet est sous licence **Apache 2.0** — voir le fichier [LICENSE](LICENSE) pour plus de détails.
