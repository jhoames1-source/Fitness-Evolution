<#
  Google Drive (H:\Mi unidad) no soporta node_modules ni enlaces simbólicos.
  El código fuente canónico vive en la carpeta de Drive; este script lo refleja a una
  carpeta local NTFS donde se instalan dependencias y se ejecuta/compila.

  Uso (desde la carpeta del proyecto en Drive):
    powershell -ExecutionPolicy Bypass -File scripts\sync-local.ps1            # solo sincroniza
    powershell -ExecutionPolicy Bypass -File scripts\sync-local.ps1 -Run dev   # sincroniza y ejecuta npm run dev
    powershell -ExecutionPolicy Bypass -File scripts\sync-local.ps1 -Run test
#>
param(
  [string]$Dest = "C:\dev\fitness-evolution",
  [string]$Run = ""
)
$Src = Split-Path -Parent $PSScriptRoot
robocopy $Src $Dest /MIR /NFL /NDL /NJH /NJS /NP /XD node_modules dist .git "$Src\android\app\build" "$Src\android\.gradle" | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Error "robocopy falló ($LASTEXITCODE)"; exit 1 }
Write-Host "Sincronizado: $Src -> $Dest"

Push-Location $Dest
try {
  if (-not (Test-Path "node_modules")) { npm install --no-audit --no-fund }
  if ($Run) { npm run $Run }
} finally { Pop-Location }
