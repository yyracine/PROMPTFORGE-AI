# Guide d'utilisation — PromptForge AI

Bienvenue dans **PromptForge AI**, votre environnement de travail personnel pour la conception, l'optimisation, l'évaluation comparative, le versionnage et la gestion de prompts destinés aux grands modèles d'intelligence artificielle et aux assistants de programmation.

Ce guide détaille pas à pas le fonctionnement de chaque module de l'application afin de vous permettre d'en tirer le meilleur parti au quotidien.

---

## Sommaire

1. [Présentation générale de l'espace de travail](#1-présentation-générale-de-lespace-de-travail)
2. [Tableau de bord (« Votre espace de travail IA »)](#2-tableau-de-bord--votre-espace-de-travail-ia-)
3. [Générateur de prompts structurés](#3-générateur-de-prompts-structurés)
4. [Optimiseur de prompts côte-à-côte](#4-optimiseur-de-prompts-côte-à-côte)
5. [Atelier spécialisé en Développement Logiciel](#5-atelier-spécialisé-en-développement-logiciel)
6. [Bibliothèque personnelle & Gestion des versions](#6-bibliothèque-personnelle--gestion-des-versions)
7. [Bibliothèque de modèles réutilisables (32 modèles)](#7-bibliothèque-de-modèles-réutilisables-32-modèles)
8. [Historique et comparateur de versions](#8-historique-et-comparateur-de-versions)
9. [Module d'Évaluation (8 dimensions) & Comparaison de modèles (Scoring 0–10)](#9-module-dévaluation-8-dimensions--comparaison-de-modèles-scoring-010)
10. [Paramètres, Sauvegarde SQLite & Exécution locale sous Windows](#10-paramètres-sauvegarde-sqlite--exécution-locale-sous-windows)
11. [Estimation des tokens, coûts et limites contextuelles](#11-estimation-des-tokens-coûts-et-limites-contextuelles)

---

## 1. Présentation générale de l'espace de travail

L'interface de **PromptForge AI** est organisée en trois zones complémentaires :

- **La barre latérale gauche (rétractable)** :
  - Contient le bouton d'action rapide **« + Nouveau prompt »** qui ouvre un brouillon vierge dans le Générateur.
  - Permet de naviguer entre les 9 modules de l'application (*Tableau de bord, Générateur, Optimiseur, Développement logiciel, Bibliothèque, Modèles, Historique, Évaluateur 8D, Paramètres*).
  - Intègre en bas le **sélecteur de thème à 3 états** (**Clair**, **Sombre**, **Auto**) ainsi que l'indicateur de disponibilité du moteur d'IA.
- **La barre supérieure (`TopBar`)** :
  - Affiche le fil d'Ariane de votre position actuelle.
  - Propose une **recherche globale instantanée** permettant de retrouver n'importe quel prompt enregistré ou modèle réutilisable depuis n'importe quel écran.
  - Offre un bouton d'accès direct aux modèles réutilisables.
- **La zone de travail centrale** :
  - Conserve automatiquement **tous vos brouillons en cours** lorsque vous passez d'un onglet à un autre ou lorsque vous changez de thème visuel (aucune perte de saisie).

---

## 2. Tableau de bord (« Votre espace de travail IA »)

Le **Tableau de bord** vous donne une vue immédiate sur votre activité :
- **Indicateurs réels issus de la base SQLite** : nombre total de prompts enregistrés, nombre de favoris, total des versions historisées et nombre de modèles réutilisables disponibles.
- **Prompts récemment modifiés** : accédez en un clic à vos derniers travaux pour les copier, consulter leur historique de versions ou les ouvrir dans l'Optimiseur.
- **Prompts favoris** : retrouvez vos prompts épinglés (marqués d'une étoile) pour un usage quotidien immédiat.
- **Modèles fréquemment utilisés** : lancez rapidement un modèle préconfiguré comme point de départ.

---

## 3. Générateur de prompts structurés

Le **Générateur** transforme une idée — même formulée en une seule phrase — en un prompt professionnel structuré en français.

### Étape 1 : Choisir le mode de génération
En haut à droite du module, sélectionnez l'un des trois modes :
- **Mode Rapide** : génère un prompt concis, direct et immédiatement opérationnel.
- **Mode Professionnel** : structure le prompt avec les sections fondamentales (*Rôle, Contexte, Objectif, Instructions, Contraintes, Format de sortie*).
- **Mode Expert** : produit une ingénierie de prompt approfondie incluant la gestion des cas limites, une méthodologie pas à pas, des garde-fous anti-hallucinations et des critères de validation vérifiables.

### Étape 2 : Renseigner votre besoin
1. **Description du besoin (obligatoire)** : décrivez ce que vous souhaitez obtenir.
2. **Domaine professionnel** : choisissez parmi *Développement logiciel, Django & Python, Architecture logicielle, Conception MVP & SaaS, Analyse & Rédaction, Entrepreneuriat & Marché, Marketing & Copywriting, Automatisation & Scripts, Recherche & Synthèse*.
3. **Modèle / Agent cible** : sélectionnez le destinataire du prompt (*Claude Code, Cursor Agent, OpenCode CLI, Claude 3.7 Sonnet, GPT-4o, Gemini 3.8 Flash*). La structure et le balisage du prompt s'adaptent automatiquement aux conventions du profil choisi.
4. **Niveau de détail & Format de structuration** : choisissez entre *Concis, Standard, Exhaustif* et le format (*Markdown structuré, Balises XML, Spécification JSON, Texte continu*).
5. **Paramètres avancés (dépliables)** : précisez si nécessaire l'objectif exact, le contexte technique ou métier, les contraintes non négociables, les critères de réussite et le ton souhaité.

### Étape 3 : Utiliser l'Assistant de Clarification (facultatif)
- Cliquez sur **« Clarifier le besoin »** si votre demande initiale est générale.
- Le moteur analyse votre saisie et vous pose **2 à 4 questions courtes et ciblées** (sans jamais redemander une information déjà présente dans le formulaire).
- Vous pouvez répondre à ces questions pour affiner la génération, ou cliquer directement sur **« Générer le prompt »** : dans ce cas, le moteur affiche clairement les **hypothèses explicites retenues** sous l'éditeur.

### Étape 4 : Éditer, exploiter et enregistrer
Dans le panneau de droite :
- Modifiez librement le titre et le contenu du prompt généré.
- Vérifiez en temps réel le **compteur de tokens, l'occupation de la fenêtre contextuelle et le coût estimé**.
- Cliquez sur **« Copier »**, **« Créer une variante »**, **« Optimiser »**, **« Évaluer »**, exportez en **`.MD` / `.TXT` / `.JSON`** ou cliquez sur **« Enregistrer en bibliothèque »** en lui associant une catégorie et des tags.

---

## 4. Optimiseur de prompts côte-à-côte

L'**Optimiseur** permet d'améliorer un prompt existant sans jamais écraser votre texte original.

### Comment l'utiliser :
1. **Collez votre prompt initial** dans le panneau de gauche (*Prompt original*) ou envoyez-le depuis la Bibliothèque / le Générateur.
2. **Sélectionnez le modèle cible** en haut à droite (*Claude Code, Cursor, Claude 3.7 Sonnet, GPT-4o, Gemini 3.8 Flash*).
3. **Cochez une ou plusieurs des 13 opérations d'optimisation** :
   - *Correction et clarification*
   - *Optimisation professionnelle*
   - *Version experte*
   - *Version concise*
   - *Enrichissement du contexte*
   - *Réorganisation logique des instructions*
   - *Détection des ambiguïtés*
   - *Détection des contradictions*
   - *Amélioration des contraintes*
   - *Amélioration des critères de sortie*
   - *Transformation en prompt système*
   - *Transformation en prompt pour agent de programmation*
   - *Adaptation au modèle cible*
4. Ajoutez éventuellement une consigne spécifique dans le champ dédié, puis cliquez sur **« Lancer l'optimisation »**.
5. **Comparez côte-à-côte** :
   - Le panneau de droite affiche la version optimisée ainsi que **l'écart exact en nombre de tokens et en pourcentage** (`+X tok` ou `-X tok`) par rapport à l'original.
   - En bas de page, consultez le **Résumé structuré des changements** réparti en 5 blocs : *Éléments clarifiés, Informations ajoutées, Contradictions corrigées, Contraintes améliorées, Hypothèses introduites*.
   - Cliquez sur **« Utiliser comme base »** uniquement si vous souhaitez remplacer le texte de gauche par la nouvelle version pour enchaîner un second cycle.

---

## 5. Atelier spécialisé en Développement Logiciel

Ce module est conçu pour générer des spécifications techniques rigoureuses destinées aux agents de programmation (**Claude Code**, **Cursor**, **OpenCode**).

### Fonctionnement :
1. **Choisissez l'un des 16 cas d'usage logiciels** en haut de l'écran :
   - *Application Django complète, API RESTful & Backend, Création de MVP complet, Application Web Full-Stack, Application Mobile, Architecture SaaS Multi-tenant, Analyse préalable d'un dépôt, Diagnostic et correction de bug, Refactorisation sans régression, Génération de tests automatisés, Audit de sécurité applicative, Documentation technique, Déploiement local Windows sans Docker, Cahier des charges & Spécifications, Architecture logicielle & ADR, Diagnostic d'erreur de build/exécution*.
2. **Complétez la fiche d'architecture** :
   - Nom du projet, assistant cible, objectif technique détaillé, stack technique (aucune technologie non demandée n'est imposée sans justification), fonctionnalités obligatoires, modèle de données, endpoints API, sécurité et stratégie de tests.
3. **Activez ou désactivez les options d'ingénierie** :
   - **Compatibilité Windows native sans Docker** : exige des scripts PowerShell `.ps1` gérant les chemins avec espaces et interdit toute dépendance à Docker.
   - **10 règles strictes pour assistants de programmation** : impose à l'agent d'examiner le dépôt avant d'agir, d'implémenter de bout en bout sans aucune simulation ni bouton factice, et d'exécuter les vérifications.
4. Cliquez sur **« Générer le prompt pour l'agent de codage »**, puis copiez ou enregistrez la spécification obtenue.

---

## 6. Bibliothèque personnelle & Gestion des versions

La **Bibliothèque personnelle** centralise tous vos prompts dans la base SQLite locale.

### Recherche et filtrage multicritère
- **Barre de recherche intégrale** : recherchez un terme (insensible aux accents et aux majuscules) dans le titre, la description, le contenu, le domaine, la catégorie, le modèle ou les tags.
- **Filtres par Catégorie, Modèle cible, Domaine et Tags** : utilisez soit les menus déroulants (avec compteurs), soit les barres d'onglets rapides pour isoler immédiatement vos prompts par catégorie ou par modèle (*Claude Code, GPT-4o, Cursor*, etc.).
- **Clic direct sur les métadonnées** : cliquez sur le nom de la catégorie ou du modèle sous n'importe quel prompt de la liste pour filtrer instantanément la bibliothèque.

### Gestion intégrée des versions d'un prompt
Lorsque vous sélectionnez un prompt dans la bibliothèque, le panneau de droite affiche sa fiche complète ainsi que la section **« Historique des modifications »** :
- Consultez toutes les révisions successives (`v1`, `v2`, `v3`…) avec leur date, leur auteur/mode (*Édition manuelle, Mode professionnel, Restauration*) et leur note de modification.
- **Cliquez sur une version antérieure** pour inspecter son texte ou cliquez sur **« Comparer avec vN »** pour afficher l'ancienne version et la version actuelle côte-à-côte.
- Cliquez sur **« Restaurer »** en face d'une version antérieure pour la rétablir au sommet de l'historique (`vN+1`) **sans jamais écraser ni supprimer les versions précédentes**.
- Cliquez sur **« Modifier »** ou **« Nouvelle révision »** pour éditer le contenu, le titre, la catégorie ou le modèle cible en renseignant une note de version.

### Exportation et Importation JSON
- **Exporter un prompt sélectionné (`.JSON`, `.MD`, `.TXT`)** : cliquez sur **« Exporter JSON »** en haut de la fiche d'un prompt (ou sur l'icône JSON dans la liste) pour télécharger un fichier `.json` portable contenant le prompt et tout son historique de versions.
- **Exporter toute la bibliothèque (`.JSON`)** : cliquez sur **« Exporter toute la bibliothèque (.JSON) »** en haut de la page pour sauvegarder l'intégralité de vos prompts, versions, catégories, tags et modèles. Si un filtre est actif, le bouton **« Exporter la sélection (N) »** vous permet d'exporter uniquement les éléments filtrés.
- **Importer JSON** : cliquez sur **« Importer JSON »** pour charger un prompt partagé ou une bibliothèque externe, avec détection préalable des doublons.

---

## 7. Bibliothèque de modèles réutilisables (32 modèles)

Ce module met à votre disposition **32 modèles professionnels préchargés** répartis en **5 catégories** :
1. **Développement logiciel** (*Application Django, API REST, Refactorisation, Correction de bug, Tests automatisés, Audit de sécurité, Documentation, Architecture SaaS…*).
2. **Conception de produits et MVP** (*Cadrage MVP, Spécifications fonctionnelles, Architecture produit, Feuille de route, Landing page SaaS à haute conversion, Site web complet multi-pages, Refonte UI/UX…*).
3. **Marketing, contenu et entrepreneuriat** (*Étude de marché, Proposition de valeur, Séquences d'emails, Stratégie éditoriale, Copywriting…*).
4. **Analyse et productivité** (*Synthèse exécutive, Plan d'action, Extraction structurée JSON/Markdown, Automatisation Windows/Python…*).
5. **Vidéo & Médias IA** (*Prompt de génération de vidéo IA cinématographique pour Sora/Runway/Veo, Script & Storyboard vidéo complet, Vidéo promotionnelle produit & Démo SaaS*).

### Utilisation des variables dynamiques :
1. Sélectionnez un modèle dans la liste de gauche.
2. Remplissez les **variables personnalisables** (`{{nom_variable}}`) dans le panneau de droite : elles sont injectées **en temps réel** dans l'aperçu du prompt.
3. Cliquez sur **« Copier le prompt compilé »**, **« Envoyer dans l'Optimiseur »** ou **« Utiliser comme point de départ »** (pour l'ouvrir dans le Générateur).
4. Vous pouvez également cliquer sur **« Modifier la trame »** pour adapter et sauvegarder durablement le modèle dans votre base SQLite locale.

---

## 8. Historique et comparateur de versions

Ce module dédié offre une vue plein écran sur le cycle de vie d'un prompt :
1. Sélectionnez le prompt à inspecter dans le menu déroulant en haut à droite.
2. Parcourez la **chronologie complète des versions** dans la colonne de gauche.
3. Assignez n'importe quelle révision au **Panneau A** et au **Panneau B** pour comparer deux états côte-à-côte.
4. Cliquez sur **« Restaurer »** sur n'importe quelle version pour créer une nouvelle révision active sans perte d'historique.

---

## 9. Module d'Évaluation (8 dimensions) & Comparaison de modèles (Scoring 0–10)

Le module d'évaluation propose **trois modes complémentaires** clairement distingués :

### Mode 1 : Analyse structurelle (Locale & Instantanée)
- Évalue de manière déterministe et instantanée votre prompt sur les **8 dimensions officielles** (notées sur 100) :
  1. *Clarté*
  2. *Précision*
  3. *Contexte*
  4. *Cohérence*
  5. *Qualité des contraintes*
  6. *Définition du résultat attendu*
  7. *Pertinence du format de sortie*
  8. *Vérifiabilité*
- Affiche la méthode de calcul, les constats factuels, les recommandations par dimension ainsi que les points forts et priorités d'amélioration.

### Mode 2 : Évaluation approfondie par modèle d'IA (8 dimensions)
- En cliquant sur **« Audit IA 8 dimensions »**, le moteur examine la cohérence logique et sémantique profonde du prompt sur ces mêmes 8 critères.

### Mode 3 : Comparaison de modèles côte-à-côte & Scoring automatique (0–10)
Permet de tester un même prompt sur deux profils de modèles différents (par exemple **Claude 3.7 Sonnet** vs **GPT-4o**) :
1. Sélectionnez le **Modèle A** (panneau gauche) et le **Modèle B** (panneau droit).
2. Cliquez sur **« Générer et comparer les 2 réponses »** pour exécuter simultanément le prompt selon les deux profils et obtenir leurs réponses côte-à-côte (vous pouvez aussi coller manuellement deux réponses existantes et cliquer sur **« Arbitrer par IA »**).
3. Consultez le **Tableau de scoring automatique sur l'échelle 0–10** selon **5 métriques prédéfinies** :
   - **Pertinence & Couverture (25 %)**
   - **Respect des contraintes (25 %)**
   - **Concision & Densité (20 %)**
   - **Clarté & Structure (15 %)**
   - **Exploitabilité directe (15 %)**
4. Basculez librement entre les **Métriques Auto (0–10)** (calcul déterministe instantané) et l'**Arbitrage IA (0–10)** (verdict détaillé, forces de chaque modèle et conseil d'amélioration du prompt).

---

## 10. Paramètres, Sauvegarde SQLite & Exécution locale sous Windows

Le module **Paramètres** regroupe cinq sections d'administration locale :
1. **Apparence et Thème** : bascule immédiate entre *Mode Clair*, *Mode Sombre* et *Mode Automatique*.
2. **Fournisseurs d'IA et Sécurité** : bouton **« Tester la connexion au fournisseur »** vérifiant la disponibilité et la latence du moteur Gemini côté serveur (aucune clé API n'est jamais exposée dans le navigateur ni dans les exports).
3. **Préférences de génération par défaut** : définissez votre mode, niveau de détail, modèle cible et format préférés.
4. **Base de données locale SQLite, Sauvegarde et Restauration** :
   - Consultez le chemin et la taille de votre fichier `.data/promptforge.sqlite`.
   - Exportez une sauvegarde JSON complète ou restaurez une archive avec gestion explicite des doublons (*Conserver les deux*, *Ignorer les doublons*, *Mettre à jour*).
5. **Scripts d'installation et de lancement Windows (Sans Docker)** :
   - Prévisualisez, copiez ou téléchargez en un clic les scripts PowerShell natifs (`scripts/install.ps1`, `scripts/start.ps1`) et le code de référence du backend local.

---

## 11. Estimation des tokens, coûts et limites contextuelles

Dans le **Générateur** et l'**Optimiseur**, chaque zone de texte intègre une barre de métriques temps réel (`TokenCounterBar`) :
- **Nombre de tokens (`~N tokens`)**, nombre de mots et de caractères.
- **Jauge de fenêtre contextuelle** adaptée au modèle cible sélectionné (`200K` pour Claude 3.7 Sonnet / Claude Code, `128K` pour GPT-4o / Cursor / OpenCode, `1M` pour Gemini 3.8 Flash).
- **Coût d'entrée estimé en USD** basé sur la tarification officielle par million de tokens du modèle cible.
- **Écart de tokens dans l'Optimiseur** : affiche la réduction ou l'augmentation en tokens et en pourcentage entre votre prompt original et sa version optimisée.
