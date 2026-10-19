# PromptForge AI — Description de l'Application

## 1. Vue d'ensemble et Positionnement

**PromptForge AI** est une application web full-stack personnelle et professionnelle, intégralement rédigée en français, dédiée à **l'ingénierie de prompts (Prompt Engineering)** pour les grands modèles de langage (LLM) et les assistants de programmation autonomes.

Conçue comme un véritable poste de travail d'ingénierie locale (dans l'esprit d'outils de précision comme Linear, Raycast ou Cursor), l'application permet de transformer une idée brute en instructions hautement structurées, d'optimiser chirurgicalement des prompts existants, de générer des spécifications logicielles complètes sans simulation, d'évaluer la qualité sur 8 dimensions, de comparer côte-à-côte les réponses de différents modèles avec un scoring automatique (0–10), et d'archiver l'ensemble des révisions dans une base de données **SQLite locale**.

---

## 2. Architecture Technique

- **Frontend** :
  - **React 19** + **TypeScript** + **Vite** + **Tailwind CSS 4**.
  - **Système de design bi-thème haute lisibilité** :
    - *Mode Clair* (`#F7F8FA` / `#FFFFFF` / Texte `#171923` / Accent `#5B5BD6`).
    - *Mode Sombre* (`#101116` / `#1B1D26` / Texte `#F3F4F6` / Accent `#9290FF`).
    - *Mode Automatique* synchronisé avec le système d'exploitation.
  - **Typographie** : `Plus Jakarta Sans` (titres), `DM Sans` (interface et lecture longue) et `JetBrains Mono` (édition de prompts, variables `{{...}}`, métriques et compteurs `tabular-nums`).
  - **Persistance d'état (`WorkspaceContext`)** : conservation intégrale des brouillons en mémoire lors de la navigation entre modules ou du changement de thème.
- **Backend & Sécurité** :
  - Serveur **Express TypeScript (`server.ts`)** exécuté sur le port `3000`.
  - Intégration serveur du SDK officiel **`@google/genai`** : toutes les requêtes vers le modèle d'IA transitent exclusivement par le backend (`/api/ai/*`). Aucune clé API n'est stockée ni exposée côté client ou dans les fichiers de sauvegarde.
  - Cloisonnement anti-injection des entrées utilisateur via balisage sémantique (`<untrusted_user_specification>`, `<original_untrusted_prompt>`) et validation stricte des schémas JSON de réponse.
- **Base de données relationnelle locale (`node:sqlite`)** :
  - Stockage persistant dans `.data/promptforge.sqlite` en mode `WAL` (*Write-Ahead Logging*) avec intégrité référentielle (`FOREIGN KEY`).
  - **7 tables relationnelles** : `prompts`, `prompt_versions`, `categories`, `tags`, `prompt_tags`, `prompt_templates` et `generation_logs` (+ `app_settings`).
- **Compatibilité Windows native sans Docker** :
  - Scripts PowerShell (`.ps1`) fournis (`scripts/install.ps1` et `scripts/start.ps1`) supportant les chemins contenant des espaces et ne requérant jamais Docker.

---

## 3. Modules Fonctionnels Principaux

### 3.1 Tableau de bord (« Votre espace de travail IA »)
- Statistiques en temps réel issues de SQLite (prompts enregistrés, favoris, versions historisées, modèles disponibles).
- Accès direct aux prompts récemment modifiés, aux favoris épinglés et aux modèles les plus utilisés.

### 3.2 Générateur de prompts structurés
- **3 modes de génération** : *Mode Rapide*, *Mode Professionnel* et *Mode Expert*.
- **6 profils de modèles et d'agents cibles** : *Claude Code (Sonnet 3.7 Agent)*, *Cursor Agent (Composer)*, *OpenCode CLI*, *Claude 3.7 Sonnet*, *GPT-4o* et *Gemini 3.8 Flash*.
- **Assistant de Clarification intelligent** : détecte les demandes vagues et génère 2 à 4 questions ciblées sans jamais redemander les informations déjà fournies, tout en documentant explicitement les hypothèses retenues en cas de génération directe.
- **Compteur de tokens et de coûts en temps réel** : affiche l'estimation BPE des tokens, le pourcentage de la fenêtre contextuelle consommée (`128K`, `200K` ou `1M`) et le coût d'entrée estimé en USD.

### 3.3 Optimiseur de prompts côte-à-côte
- **13 opérations d'optimisation combinables** : *Correction et clarification, Optimisation professionnelle, Version experte, Version concise, Enrichissement du contexte, Réorganisation logique, Détection des ambiguïtés, Détection des contradictions, Amélioration des contraintes, Amélioration des critères de sortie, Transformation en prompt système, Transformation en prompt pour agent de programmation, Adaptation au modèle cible*.
- Comparaison côte-à-côte préservant toujours le prompt original intact, avec affichage du **delta de tokens (`+/- tok` et `%`)** et d'un **résumé structuré des modifications en 5 catégories**.

### 3.4 Atelier spécialisé en Développement Logiciel
- Couvre **16 cas d'usage d'ingénierie logicielle** (*Application Django, API REST, MVP complet, Full-Stack Web, Mobile, Architecture SaaS, Analyse de dépôt, Correction de bug, Refactorisation, Tests automatisés, Audit de sécurité, Documentation technique, Déploiement Windows sans Docker, Cahier des charges, Architecture & ADR, Diagnostic d'erreur de build*).
- Injecte les **10 règles d'or pour assistants de programmation** (inspection préalable du dépôt, interdiction des simulations et des boutons factices, exécution des tests, compatibilité Windows PowerShell sans Docker).

### 3.5 Bibliothèque personnelle, Recherche multicritère & Export JSON
- **Recherche intégrale insensible aux accents** (titre, description, contenu, domaine, catégorie, modèle cible, tags).
- **Double filtrage par Catégorie et par Modèle cible** (menus déroulants avec compteurs + barres de filtres rapides + filtrage par `#tag`).
- **Gestion de versions intégrée** dans chaque fiche de prompt : consultation de la chronologie des modifications (`v1`, `v2`…), comparaison côte-à-côte avec la version actuelle et restauration non destructive.
- **Export / Import JSON portable** : export d'un prompt sélectionné (avec ses versions), d'une sélection filtrée ou de l'intégralité de la bibliothèque au format `.JSON`, `.MD` ou `.TXT`, et import avec détection préalable des doublons.

### 3.6 Bibliothèque de modèles réutilisables (32 modèles préchargés)
- **32 modèles professionnels** répartis en **5 catégories** :
  1. *Développement logiciel* (8 modèles)
  2. *Conception de produits et MVP* — incluant les modèles de **Landing pages** et de **Sites web complets** (9 modèles)
  3. *Marketing, contenu et entrepreneuriat* (6 modèles)
  4. *Analyse et productivité* (6 modèles)
  5. *Vidéo & Médias IA* — incluant la **génération de vidéos IA (Sora, Runway, Veo)**, les scripts/storyboards et les vidéos de démonstration produit (3 modèles)
- Interpolation dynamique en temps réel des variables `{{variable}}` et édition locale persistante dans SQLite.

### 3.7 Évaluateur de qualité (8 dimensions) & Vue Comparaison de modèles (Scoring 0–10)
- **Analyse structurelle heuristique locale** + **Audit sémantique par IA** sur les 8 dimensions officielles (*Clarté, Précision, Contexte, Cohérence, Qualité des contraintes, Définition du résultat attendu, Pertinence du format de sortie, Vérifiabilité*).
- **Vue Comparaison côte-à-côte (ex: Claude 3.7 Sonnet vs GPT-4o)** : teste simultanément deux profils de modèles sur un même prompt et attribue un **score automatique de 0 à 10** selon 5 métriques pondérées :
  - *Pertinence & Couverture (25 %)*
  - *Respect des contraintes (25 %)*
  - *Concision & Densité (20 %)*
  - *Clarté & Structure (15 %)*
  - *Exploitabilité directe (15 %)*

---

## 4. Synthèse des Points Forts

1. **Zéro donnée volatile** : persistance SQLite locale complète et fonctionnelle hors connexion pour la consultation, l'édition, le filtrage, l'évaluation structurelle et le scoring automatique.
2. **Traçabilité et réversibilité totales** : chaque modification ou optimisation crée une version numérotée et horodatée ; restaurer une version antérieure crée une nouvelle révision au sommet sans jamais détruire l'historique.
3. **Sécurité par conception** : aucune clé secrète côté client ni dans les sauvegardes exportées, requêtes SQL paramétrées et protection contre l'injection de prompts.
