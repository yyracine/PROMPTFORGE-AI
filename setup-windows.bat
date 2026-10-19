@echo off
chcp 65001 >nul
cd /d "%~dp0"
title PromptForge IA - Installateur et Lanceur Local
color 0B

echo ============================================================================
echo   PROMPTFORGE IA - INSTALLATEUR AUTOMATIQUE WINDOWS (PWA ^& SERVEUR LOCAL)
echo ============================================================================
echo.

REM 0. Verification que le script est bien dans le dossier complet du projet
if not exist "package.json" (
    color 0E
    echo [ATTENTION] Le fichier "package.json" est introuvable dans ce dossier :
    echo   %CD%
    echo.
    echo POURQUOI CE MESSAGE ?
    echo Vous avez lance le fichier .bat seul ^(par exemple depuis "Telechargements"^),
    echo sans les fichiers sources de l'application PromptForge IA.
    echo.
    echo COMMENT CORRIGER EN 30 SECONDES :
    echo   1. Dans PromptForge IA ^(bouton "Installer l'app"^), cliquez sur :
    echo      "Telecharger le Pack Complet (.ZIP)"
    echo   2. Faites un clic droit sur le fichier ZIP telecharge -^> "Extraire tout..."
    echo   3. Ouvrez le dossier extrait et double-cliquez sur "setup-windows.bat" !
    echo.
    echo Alternative rapide : utilisez l'installation PWA en 1 clic dans votre
    echo navigateur ^(aucun fichier ni serveur local requis^).
    echo.
    pause
    exit /b 1
)

REM 1. Verification de Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
    echo Veuillez telecharger et installer Node.js 22 LTS depuis : https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo [OK] Node.js detecte : %NODE_VER%

REM 2. Configuration du fichier .env et de la cle API Gemini
set "CURRENT_API_KEY="
if exist ".env" (
    for /f "tokens=1,* delims==" %%A in (.env) do (
        if "%%A"=="GEMINI_API_KEY" set "CURRENT_API_KEY=%%B"
    )
)

if not defined CURRENT_API_KEY (
    echo.
    echo ============================================================================
    echo   CONFIGURATION DE LA CLE API GOOGLE GEMINI (OPTIONNELLE MAIS RECOMMANDEE)
    echo ============================================================================
    echo Pour generer des prompts avec l'IA cote serveur, PromptForge IA utilise une cle
    echo API Google Gemini gratuite. (L'application reste utilisable hors-ligne sans cle).
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$key = Read-Host '>> Collez votre cle GEMINI_API_KEY (ou appuyez sur ENTREE pour ignorer)'; if ($key -and $key.Trim()) { Set-Content -LiteralPath '.env' -Value ('GEMINI_API_KEY=' + $key.Trim() + \"`r`nPORT=3000`r`n\") -Encoding UTF8; Write-Host '[OK] Cle API Gemini configuree avec succes dans .env.' -ForegroundColor Green } else { if (-not (Test-Path -LiteralPath '.env')) { Set-Content -LiteralPath '.env' -Value \"GEMINI_API_KEY=`r`nPORT=3000`r`n\" -Encoding UTF8; Write-Host '[INFO] Fichier .env initialise (mode local sans cle).' -ForegroundColor Cyan } }"
) else (
    echo [OK] Cle API Gemini deja presente dans le fichier .env.
)

REM 3. Installation des dependances npm (verifie node_modules et vite)
if not exist "node_modules\vite\package.json" (
    set NEED_INSTALL=1
)
if defined NEED_INSTALL (
    echo.
    echo [ETAPE 1/3] Installation des dependances de PromptForge IA...
    echo Cette operation peut prendre 30 a 60 secondes la premiere fois...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo [INFO] Nouvelle tentative d'installation avec --legacy-peer-deps...
        call npm install --legacy-peer-deps --no-audit --no-fund
    )
    if not exist "node_modules\vite\package.json" (
        color 0C
        echo.
        echo [ERREUR] L'installation des dependances npm a echoue.
        echo Verifiez votre connexion Internet et que vous avez les droits d'ecriture dans ce dossier.
        echo.
        echo Appuyez sur une touche pour quitter...
        pause
        exit /b 1
    )
    echo [OK] Dependances npm installees avec succes.
) else (
    echo [OK] Dependances npm deja installees.
)

REM 4. Creation d'un raccourci sur le Bureau Windows (compatible OneDrive & dossiers standards)
echo.
echo [ETAPE 2/3] Creation du raccourci "PromptForge IA" sur votre Bureau...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $Desktop = [Environment]::GetFolderPath('Desktop'); if (-not $Desktop -or -not (Test-Path -LiteralPath $Desktop)) { $Desktop = Join-Path $env:USERPROFILE 'Desktop' }; if (Test-Path -LiteralPath $Desktop) { $UrlFile = Join-Path $Desktop 'PromptForge IA.url'; Set-Content -LiteralPath $UrlFile -Value \"[InternetShortcut]`r`nURL=http://localhost:3000`r`n\" -Encoding ASCII; Write-Host '[OK] Raccourci PromptForge IA cree sur le Bureau Windows.' -ForegroundColor Green } else { Write-Host '[INFO] Dossier Bureau non standard, raccourci ignore.' -ForegroundColor Yellow }"

echo.
echo ============================================================================
echo   [ETAPE 3/3] DEMARRAGE DE PROMPTFORGE IA SUR HTTP://LOCALHOST:3000
echo   Astuce : Dans Chrome ou Edge, cliquez sur l'icone "Installer PromptForge IA"
echo   dans la barre d'adresse pour l'installer comme application de bureau !
echo ============================================================================
echo.

start "" "http://localhost:3000"
echo [SERVEUR] Lancement du serveur backend et de l'interface sur le port 3000...
echo (Ne fermez pas cette fenetre tant que vous utilisez PromptForge IA)
echo.

where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call npx tsx server.ts
) else (
    call npm run dev
)

if errorlevel 1 (
    color 0C
    echo.
    echo ============================================================================
    echo [ERREUR] Le serveur n'a pas pu demarrer ou s'est arrete avec une erreur.
    echo Verifiez que le port 3000 n'est pas utilise par un autre programme.
    echo ============================================================================
    echo.
    pause
)
pause
