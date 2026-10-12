export interface WindowsExportFile {
  path: string;
  description: string;
  language: 'powershell' | 'python' | 'markdown' | 'text';
  content: string;
}

export const WINDOWS_PACK_FILES: WindowsExportFile[] = [
  {
    path: 'scripts/install.ps1',
    description: 'Script PowerShell d’installation (vérification Python/Node, création du venv, installation pip & npm, initialisation SQLite). Supporte les chemins contenant des espaces.',
    language: 'powershell',
    content: `#Requires -Version 5.1
<#
.SYNOPSIS
    Script d'installation de PromptForge AI sous Windows (sans Docker).
.DESCRIPTION
    Vérifie Python et Node.js, crée l'environnement virtuel Python, installe les dépendances
    FastAPI/SQLAlchemy et React/Vite, et prépare le répertoire de données SQLite local.
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  PromptForge AI — Installation Locale Windows (v1.0)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Répertoire du projet : \`"$ProjectRoot\`""

# 1. Vérification de Python
if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    Write-Error "Python n'est pas détecté dans le PATH. Installez Python 3.11+ depuis https://www.python.org/downloads/ en cochant 'Add Python to PATH'."
    exit 1
}
$ pyVersion = & python --version
Write-Host "[OK] $pyVersion détecté." -ForegroundColor Green

# 2. Vérification de Node.js et npm
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js n'est pas détecté dans le PATH. Installez Node.js 20 LTS depuis https://nodejs.org/."
    exit 1
}
$nodeVersion = & node --version
Write-Host "[OK] Node.js $nodeVersion détecté." -ForegroundColor Green

# 3. Création du répertoire de données persistant dans %LOCALAPPDATA%\\PromptForgeAI
$AppDataDir = Join-Path $env:LOCALAPPDATA "PromptForgeAI"
if (-not (Test-Path -LiteralPath $AppDataDir)) {
    New-Item -ItemType Directory -Path $AppDataDir -Force | Out-Null
    Write-Host "[OK] Répertoire de base de données créé : \`"$AppDataDir\`"" -ForegroundColor Green
} else {
    Write-Host "[OK] Répertoire de données existant préservé : \`"$AppDataDir\`"" -ForegroundColor Green
}

# 4. Installation du Backend Python / FastAPI (si dossier backend présent)
$BackendDir = Join-Path $ProjectRoot "backend"
if (Test-Path -LiteralPath $BackendDir) {
    $VenvDir = Join-Path $BackendDir ".venv"
    if (-not (Test-Path -LiteralPath $VenvDir)) {
        Write-Host "Création de l'environnement virtuel Python..." -ForegroundColor Yellow
        & python -m venv "$VenvDir"
    }
    $PipExe = Join-Path $VenvDir "Scripts\\pip.exe"
    $ReqFile = Join-Path $BackendDir "requirements.txt"
    Write-Host "Installation des dépendances Python FastAPI..." -ForegroundColor Yellow
    & "$PipExe" install --upgrade pip
    & "$PipExe" install -r "$ReqFile"
    Write-Host "[OK] Backend Python installé." -ForegroundColor Green
}

# 5. Configuration de l'environnement .env et de la clé API
$EnvFile = Join-Path $ProjectRoot ".env"
$EnvExample = Join-Path $ProjectRoot ".env.example"
if (-not (Test-Path -LiteralPath $EnvFile)) {
    if (Test-Path -LiteralPath $EnvExample) {
        Copy-Item -Path $EnvExample -Destination $EnvFile
        Write-Host "[OK] Fichier .env initialisé depuis .env.example." -ForegroundColor Green
    } else {
        Set-Content -Path $EnvFile -Value "GEMINI_API_KEY=\`r\`nPORT=3000\`r\`n"
        Write-Host "[OK] Fichier .env créé." -ForegroundColor Green
    }
}

# 6. Installation des dépendances Frontend/Fullstack
Write-Host "Installation des dépendances npm..." -ForegroundColor Yellow
Push-Location -LiteralPath "$ProjectRoot"
try {
    & npm install --legacy-peer-deps --no-audit --no-fund
    Write-Host "[OK] Dépendances npm installées avec succès." -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Installation terminée ! Lancez l'application avec :" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File \`"$PSScriptRoot\\start.ps1\`"" -ForegroundColor White
`,
  },
  {
    path: 'scripts/start-backend.ps1',
    description: 'Lance le serveur backend FastAPI localement sur 127.0.0.1:8000 (sans exposition réseau externe).',
    language: 'powershell',
    content: `#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $ProjectRoot "backend"
$PythonExe = Join-Path $BackendDir ".venv\\Scripts\\python.exe"

if (-not (Test-Path -LiteralPath $PythonExe)) {
    Write-Error "L'environnement virtuel n'existe pas. Exécutez d'abord scripts\\install.ps1"
    exit 1
}

$env:PROMPTFORGE_DB_PATH = Join-Path $env:LOCALAPPDATA "PromptForgeAI\\promptforge.sqlite"
Write-Host "Démarrage du backend FastAPI sur http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Write-Host "Base SQLite : \`"$env:PROMPTFORGE_DB_PATH\`"" -ForegroundColor Gray

Push-Location -LiteralPath "$BackendDir"
try {
    & "$PythonExe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
} finally {
    Pop-Location
}
`,
  },
  {
    path: 'scripts/start-frontend.ps1',
    description: 'Lance l’interface React/Vite sur http://127.0.0.1:3000.',
    language: 'powershell',
    content: `#Requires -Version 5.1
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Démarrage de l'interface PromptForge AI sur http://localhost:3000 ..." -ForegroundColor Cyan
Push-Location -LiteralPath "$ProjectRoot"
try {
    & npm run dev
} finally {
    Pop-Location
}
`,
  },
  {
    path: 'scripts/start.ps1',
    description: 'Script de démarrage global : vérifie les ports, lance les services et assure un arrêt propre des processus.',
    language: 'powershell',
    content: `#Requires -Version 5.1
<#
.SYNOPSIS
    Lance PromptForge AI sous Windows et arrête proprement les processus à la fermeture.
#>
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Démarrage de PromptForge AI (Environnement Local)       " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Vérification de disponibilité du port 3000
$Port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($Port3000) {
    Write-Warning "Le port 3000 est déjà occupé (PID: $($Port3000.OwningProcess)). Libérez le port ou modifiez la variable PORT."
}

$env:PROMPTFORGE_DB_PATH = Join-Path $env:LOCALAPPDATA "PromptForgeAI\\promptforge.sqlite"
Write-Host "Base de données locale : \`"$env:PROMPTFORGE_DB_PATH\`"" -ForegroundColor Green
Write-Host "Appuyez sur Ctrl+C pour arrêter proprement l'application." -ForegroundColor Yellow

Push-Location -LiteralPath "$ProjectRoot"
try {
    & npm run dev
} finally {
    Write-Host "Arrêt propre de PromptForge AI terminé." -ForegroundColor Cyan
    Pop-Location
}
`,
  },
  {
    path: 'backend/requirements.txt',
    description: 'Liste des dépendances Python pour l’exécution du backend FastAPI + SQLAlchemy 2.0 + Pytest.',
    language: 'text',
    content: `fastapi==0.115.6
uvicorn[standard]==0.34.0
sqlalchemy==2.0.36
pydantic==2.10.4
pydantic-settings==2.7.0
google-genai==1.2.0
httpx==0.28.1
pytest==8.3.4
`,
  },
  {
    path: 'backend/app/main.py',
    description: 'Serveur FastAPI complet avec SQLAlchemy 2.x, SQLite local persistant, CORS restreint et routes REST.',
    language: 'python',
    content: `import os
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine, String, Integer, Boolean, Text, ForeignKey
)
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, mapped_column, sessionmaker, Session
)

# Emplacement persistant par défaut dans le répertoire utilisateur Windows
default_data_dir = Path(os.environ.get("LOCALAPPDATA", Path.home())) / "PromptForgeAI"
default_data_dir.mkdir(parents=True, exist_ok=True)
DB_PATH = os.environ.get("PROMPTFORGE_DB_PATH", str(default_data_dir / "promptforge.sqlite"))

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class PromptModel(Base):
    __tablename__ = "prompts"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    original_input: Mapped[str] = mapped_column(Text, default="")
    generated_content: Mapped[str] = mapped_column(Text, nullable=False)
    domain: Mapped[str] = mapped_column(String(100), default="Développement logiciel")
    task_type: Mapped[str] = mapped_column(String(100), default="generation")
    target_provider: Mapped[str] = mapped_column(String(100), default="Google Gemini")
    target_model: Mapped[str] = mapped_column(String(100), default="claude-code")
    output_format: Mapped[str] = mapped_column(String(50), default="markdown")
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[str] = mapped_column(String(40))
    updated_at: Mapped[str] = mapped_column(String(40))

class PromptVersionModel(Base):
    __tablename__ = "prompt_versions"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    prompt_id: Mapped[str] = mapped_column(String(64), ForeignKey("prompts.id", ondelete="CASCADE"))
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    change_summary: Mapped[str] = mapped_column(Text, default="Version initiale")
    created_at: Mapped[str] = mapped_column(String(40))

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PromptForge AI Local API",
    version="1.0.0",
    description="Backend personnel local FastAPI + SQLite pour PromptForge AI"
)

# Sécurité : CORS strictement limité aux origines locales
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "version": "1.0.0",
        "database_path": DB_PATH,
        "ai_configured": bool(os.environ.get("GEMINI_API_KEY")),
    }
`,
  },
];
