#Requires -Version 5.1
<#
.SYNOPSIS
    Script d'installation de PromptForge AI sous Windows (sans Docker).
#>
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Installation de PromptForge AI dans `"$ProjectRoot`"..." -ForegroundColor Cyan

if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js 20+ est requis. Téléchargez-le sur https://nodejs.org/"
    exit 1
}

$AppDataDir = Join-Path $env:LOCALAPPDATA "PromptForgeAI"
if (-not (Test-Path -LiteralPath $AppDataDir)) {
    New-Item -ItemType Directory -Path $AppDataDir -Force | Out-Null
}

Push-Location -LiteralPath "$ProjectRoot"
try {
    & npm install
    Write-Host "[OK] Dépendances installées avec succès." -ForegroundColor Green
} finally {
    Pop-Location
}
