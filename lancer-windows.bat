@echo off
chcp 65001 >nul
cd /d "%~dp0"
title PromptForge IA - Lancement Direct
color 0A

echo ============================================================================
echo   PROMPTFORGE IA - DEMARRAGE DIRECT (PORT 3000)
echo ============================================================================
echo.

REM 1. Verifier si les dependances (node_modules) sont installees
if not exist "node_modules\tsx\dist\cli.mjs" (
    color 0E
    echo [INFO] Premiere execution : installation des dependances en cours...
    echo Cette operation prend environ 30 a 60 secondes...
    echo.
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [INFO] Nouvelle tentative avec --legacy-peer-deps...
        call npm install --legacy-peer-deps --no-audit --no-fund
    )
    if not exist "node_modules\tsx\dist\cli.mjs" (
        color 0C
        echo.
        echo [ERREUR] Impossible d'installer les dependances npm.
        echo Verifiez que votre connexion Internet est active.
        echo.
        pause
        exit /b 1
    )
    echo [OK] Dependances installees avec succes !
    echo.
    color 0A
)

REM 2. Verifier si .env existe, sinon le creer proprement
if not exist ".env" (
    echo [INFO] Creation du fichier .env par defaut...
    (
        echo PORT=3000
        echo GEMINI_API_KEY=
    ) > .env
)

REM 3. Lancer l'ouverture du navigateur avec une tempo de 3 secondes pour laisser Vite compiler
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

echo [OK] Demarrage du serveur PromptForge IA sur le port 3000...
echo (Ne fermez PAS cette fenetre noire pendant que vous utilisez l'application)
echo.

REM 4. Lancer le serveur Node avec tsx
echo [OK] Serveur en cours d'execution sur http://localhost:3000
echo Ouvrez votre navigateur sur : http://localhost:3000
echo.

call npm run dev
if errorlevel 1 (
    call npx tsx server.ts
)
if errorlevel 1 (
    node "node_modules\tsx\dist\cli.mjs" server.ts
)

echo.
echo ============================================================================
echo [ATTENTION] Le serveur s'est arrete.
echo Verifiez si le port 3000 n'est pas deja utilise par une autre application.
echo ============================================================================
pause
