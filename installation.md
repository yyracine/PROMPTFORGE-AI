# Procédure d'Installation et de Déploiement — PromptForge AI

Ce document détaille les étapes nécessaires pour installer, configurer, lancer et maintenir **PromptForge AI** sur votre poste de travail local (**Windows 10/11 via PowerShell**, **macOS** ou **Linux**), ainsi qu'en mode serveur de production.

---

## 1. Prérequis Système

Avant de procéder à l'installation, assurez-vous que votre environnement dispose des éléments suivants :

1. **Node.js (version 22.5.0 ou supérieure recommandée)** :
   - *Important* : **PromptForge AI** utilise le module natif **`node:sqlite` (`DatabaseSync`)** intégré directement dans Node.js (à partir de Node.js `v22.5+`). Ce choix architectural élimine toute dépendance C++ externe (`node-gyp`, Visual Studio Build Tools ou Python) et garantit une installation rapide et sans erreur de compilation sous Windows, macOS et Linux.
   - Vérifiez votre version installée :
     ```bash
     node --version
     ```
   - Si votre version est inférieure à `v22.5.0`, téléchargez la dernière version LTS sur [https://nodejs.org](https://nodejs.org).

2. **Gestionnaire de paquets `npm`** (inclus automatiquement avec Node.js) :
   ```bash
   npm --version
   ```

3. **Clé API pour le moteur d'IA (Optionnelle au démarrage, requise pour la génération IA)** :
   - Une clé **`GEMINI_API_KEY`** pour activer la génération, l'optimisation, l'assistant de clarification, l'audit 8D par IA et la comparaison automatique des modèles.
   - *Note* : Même sans clé API configurée, l'application démarre normalement et donne accès à la bibliothèque SQLite, aux 18 modèles réutilisables, à l'évaluation structurelle locale 8D, au scoring automatique local `0-10`, au compteur de tokens temps réel et aux exports `.JSON`, `.CSV`, `.PDF`, `.MD` et `.TXT`.

---

## 2. Installation Pas à Pas

### Étape 1 : Récupérer le code source
Placez-vous dans le dossier contenant les fichiers du projet (ou clonez votre dépôt dans votre répertoire de développement) :

```powershell
# Exemple de chemin d'installation recommandé sous Windows (sans espace) :
cd "C:\Users\HP\Documents\Dev\VibeCoding\PromptForge_AI"
```

### Étape 2 : Installer les dépendances
Installez l'ensemble des dépendances front-end (React 19, Tailwind CSS v4, Lucide Icons, jsPDF) et back-end (Express, `@google/genai`, `tsx`, TypeScript) avec la commande suivante :

```bash
npm install --legacy-peer-deps
```

### Étape 3 : Configurer les variables d'environnement (`.env`)
Copiez le fichier modèle `.env.example` vers un nouveau fichier nommé `.env` à la racine du projet :

- **Sous Windows (PowerShell)** :
  ```powershell
  Copy-Item .env.example .env
  ```
- **Sous macOS / Linux (Bash / Zsh)** :
  ```bash
  cp .env.example .env
  ```

Ouvrez ensuite le fichier `.env` dans votre éditeur de texte et renseignez votre clé API côté serveur :

```env
# Clé API utilisée exclusivement côté serveur Express (jamais exposée au navigateur)
GEMINI_API_KEY="VOTRE_CLE_API_ICI"

# URL locale de l'application (optionnel)
APP_URL="http://localhost:3000"
```

> **Sécurité des clés API** : La clé configurée dans `.env` est lue uniquement par le serveur Node.js (`server.ts`). Elle n'est jamais transmise au code client ni stockée dans le `localStorage` du navigateur.

---

## 3. Initialisation Automatique de la Base de Données SQLite

Aucune commande de migration manuelle n'est requise :
- Au premier lancement du serveur, **PromptForge AI** crée automatiquement le dossier `./data/` à la racine du projet ainsi que le fichier de base de données **`./data/promptforge.sqlite`** configuré en mode **`WAL` (Write-Ahead Logging)**.
- Les **7 tables relationnelles** (`prompts`, `prompt_versions`, `templates`, `categories`, `ai_execution_logs`, `workspace_preferences`, `software_use_cases`) sont créées automatiquement.
- La base est pré-remplie dès le premier démarrage avec :
  - **7 catégories métiers**,
  - **18 modèles réutilisables** à variables dynamiques `{{variable}}` (incluant la génération de vidéos IA, les Landing Pages et l'architecture de sites web),
  - **5 prompts complets de démonstration** avec leur historique initial (`v1`).

---

## 4. Lancement de l'Application

### Option A : Lancement rapide sous Windows (Scripts PowerShell fournis)
L'application intègre 4 scripts PowerShell prêts à l'emploi (également téléchargeables depuis l'interface dans **Paramètres → Scripts Windows PowerShell**) :

1. **Installation & Préparation initiale (`install.ps1`)** :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\install.ps1
   ```
   *Vérifie Node.js, crée le dossier `./data`, initialise `.env` s'il est absent et exécute `npm install`.*

2. **Démarrage de l'application (`start.ps1`)** :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\start.ps1
   ```
   *Démarre le serveur full-stack sur le port `3000`.*

3. **Vérification de l'état de santé (`check-health.ps1`)** :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\check-health.ps1
   ```
   *Interroge `http://localhost:3000/api/health` et affiche l'état de la base SQLite et des fournisseurs IA.*

4. **Arrêt propre du serveur (`stop.ps1`)** :
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\stop.ps1
   ```
   *Identifie et arrête proprement le processus écoutant sur le port `3000`.*

---

### Option B : Lancement en mode Développement (Windows, macOS, Linux)
Pour lancer le serveur Express couplé au middleware Vite en mode développement :

```bash
npm run dev
```

Ouvrez ensuite votre navigateur à l'adresse :
**[http://localhost:3000](http://localhost:3000)**

---

### Option C : Compilation et Lancement en mode Production
Pour compiler les ressources front-end optimisées dans le dossier `dist/` et exécuter l'application en mode production :

1. **Vérifier le typage TypeScript (optionnel)** :
   ```bash
   npm run lint
   ```
2. **Compiler l'application front-end** :
   ```bash
   npm run build
   ```
3. **Démarrer le serveur de production sur le port 3000** :
   ```bash
   NODE_ENV=production npm run start
   ```
   *(Sous Windows PowerShell : `$env:NODE_ENV="production"; npm run start`)*

---

## 5. Vérification du Bon Fonctionnement

Une fois le serveur démarré sur `http://localhost:3000` :

1. **Contrôle via l'interface** :
   - Ouvrez **Paramètres** dans la barre latérale gauche.
   - Dans la section **« Fournisseurs d’IA & Diagnostic de connexion (Serveur uniquement) »**, cliquez sur le bouton **« Tester la connexion »** en face de **Google Gemini (Principal)**.
   - Un message de confirmation indiquera la latence en millisecondes et la disponibilité du modèle.

2. **Contrôle via l'API de santé (`/api/health`)** :
   ```bash
   curl http://localhost:3000/api/health
   ```
   Réponse attendue :
   ```json
   {
     "status": "ok",
     "database": "connected",
     "sqliteMode": "WAL",
     "providers": {
       "gemini": true,
       "openai": false,
       "anthropic": false,
       "ollama": true
     }
   }
   ```

---

## 6. Sauvegarde, Restauration et Mise à Jour

### Sauvegarder vos données
Vous disposez de deux méthodes complémentaires pour sauvegarder l'intégralité de votre travail :
1. **Depuis l'interface web** :
   - Dans la **Bibliothèque personnelle**, cliquez sur **« Exporter la bibliothèque (.JSON) »** pour télécharger un fichier `.json` portable contenant tous vos prompts, leurs catégories et l'intégralité de leurs historiques de versions (`v1`, `v2`, `v3`…).
   - Ou rendez-vous dans **Paramètres → Sauvegarde, Importation et Restauration** pour exporter une sauvegarde complète de l'instance.
2. **Au niveau du système de fichiers** :
   - Copiez simplement le dossier `./data/` (contenant `promptforge.sqlite`).

### Importer ou partager vers une nouvelle installation
- Sur la nouvelle instance installée, ouvrez la **Bibliothèque personnelle**, cliquez sur **« Importer JSON »**, sélectionnez votre fichier `.json` exporté, vérifiez le rapport d'inspection préalable et choisissez la stratégie de gestion des doublons souhaitée (*Conserver les deux*, *Ignorer les doublons* ou *Mettre à jour avec création d'une nouvelle version*).

---

## 7. Dépannage Courant (Troubleshooting)

| Symptôme | Cause probable | Solution |
| :--- | :--- | :--- |
| **`Error: Cannot find module 'node:sqlite'`** | Version de Node.js trop ancienne (`< 22.5.0`). | Mettez à jour Node.js vers la version **22.5.0+** (idéalement Node 22 LTS) puis relancez `npm run dev`. |
| **Le port `3000` est déjà utilisé (`EADDRINUSE`)** | Une instance précédente du serveur tourne encore en arrière-plan. | Sous Windows, exécutez `.\stop.ps1` ou fermez le terminal actif. Sous macOS/Linux, exécutez `lsof -ti:3000 \| xargs kill -9`. |
| **Avertissement lors de la génération IA** | La variable `GEMINI_API_KEY` est absente ou invalide dans `.env`. | Vérifiez que le fichier `.env` à la racine contient `GEMINI_API_KEY="votre_cle"`, puis redémarrez le serveur (`npm run dev`). |
| **Erreur d'exécution des scripts `.ps1` sous Windows** | Politique d'exécution PowerShell restreinte par défaut sur Windows. | Lancez le script avec l'argument `-ExecutionPolicy Bypass` : `powershell -ExecutionPolicy Bypass -File .\start.ps1`. |
