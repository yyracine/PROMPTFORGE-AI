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

if [ ! -f ".env" ] || ! grep -q "^GEMINI_API_KEY=" .env || grep -q "^GEMINI_API_KEY=$" .env; then
  echo ""
  echo "============================================================================"
  echo "  CONFIGURATION DE LA CLÉ API GEMINI (OPTIONNELLE MAIS RECOMMANDÉE)"
  echo "============================================================================"
  echo "Pour activer la génération de prompts par IA, entrez votre clé GEMINI_API_KEY."
  read -r -p ">> Collez votre clé API Gemini (ou appuyez sur Entrée pour passer) : " USER_KEY
  if [ -n "$USER_KEY" ]; then
    printf "GEMINI_API_KEY=%s\nPORT=3000\n" "$USER_KEY" > .env
    echo "[OK] Clé API Gemini configurée dans .env."
  else
    if [ ! -f ".env" ]; then
      cp .env.example .env 2>/dev/null || printf "GEMINI_API_KEY=\nPORT=3000\n" > .env
      echo "[INFO] Fichier .env initialisé sans clé (mode local actif)."
    fi
  fi
else
  echo "[OK] Clé API Gemini déjà configurée dans .env."
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
