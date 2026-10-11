#!/usr/bin/env bash
# ============================================================================
# PromptForge IA — Installateur & Lanceur Automatique (macOS & Linux)
# Usage : chmod +x setup-unix.sh && ./setup-unix.sh
# ============================================================================
set -e

cd "$(dirname "$0")"

echo "============================================================================"
echo "  PROMPTFORGE IA — INSTALLATEUR AUTOMATIQUE (macOS / Linux)"
echo "============================================================================"

if [ ! -f "package.json" ]; then
  echo "[ATTENTION] Le fichier 'package.json' est introuvable dans $(pwd)."
  echo "Veuillez télécharger et extraire le 'Pack Complet (.ZIP)' depuis PromptForge IA,"
  echo "puis lancez './setup-unix.sh' à l'intérieur du dossier extrait."
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[ERREUR] Node.js n'est pas installé. Installez Node.js 22.5+ depuis https://nodejs.org/"
  exit 1
fi

echo "[OK] Node.js détecté : $(node -v)"

if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "[INFO] Fichier .env créé depuis .env.example."
  else
    printf "GEMINI_API_KEY=\nPORT=3000\n" > .env
    echo "[INFO] Fichier .env initialisé."
  fi
fi

echo "[1/2] Installation des dépendances npm..."
npm install --legacy-peer-deps --no-audit --no-fund

echo "[2/2] Compilation de l'application et du Service Worker PWA..."
npm run build

echo "============================================================================"
echo "  Démarrage de PromptForge IA sur http://localhost:3000"
echo "============================================================================"

if command -v open >/dev/null 2>&1; then
  (sleep 2 && open "http://localhost:3000") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 2 && xdg-open "http://localhost:3000") &
fi

npm run start
