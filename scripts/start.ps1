#Requires -Version 5.1
<#
.SYNOPSIS
    Lance PromptForge AI sous Windows (Frontend + Backend SQLite local) sur le port 3000.
#>
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Démarrage de PromptForge AI sur http://localhost:3000 ..." -ForegroundColor Cyan
Push-Location -LiteralPath "$ProjectRoot"
try {
    & npm run dev
} finally {
    Pop-Location
}
