$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outputs = Join-Path $root "outputs"
$dist = Join-Path $root "dist"
$packageRoot = Join-Path $dist "AlliedERP-Installer"
$appPayload = Join-Path $packageRoot "App"
$zipPath = Join-Path $dist "AlliedERP-Installer-1.0.0.zip"

if (Test-Path -LiteralPath $packageRoot) {
  Remove-Item -LiteralPath $packageRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $appPayload -Force | Out-Null

$requiredFiles = @(
  "index.html",
  "styles.css",
  "app.js",
  "manifest.json",
  "config.json",
  "version.json",
  "allied-logo.jpg",
  "service-worker.js",
  "start-allied-erp.bat",
  "start-allied-erp.ps1",
  "README.txt"
)

foreach ($file in $requiredFiles) {
  $source = Join-Path $outputs $file
  if (!(Test-Path -LiteralPath $source)) {
    throw "Missing required app file: $source"
  }
  Copy-Item -LiteralPath $source -Destination $appPayload -Force
}

Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Install-AlliedERP.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Uninstall-AlliedERP.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Clean-Uninstall-AlliedERP.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Reinstall-AlliedERP.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Check-Dependencies.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot "Validate-Config.ps1") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "README_INSTALL.md") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "README_UPDATE.md") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "TROUBLESHOOTING.md") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "README_TROUBLESHOOT_INSTALL.md") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "DEPLOY_HTTPS.md") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "installer-error-log.txt") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "app-startup-log.txt") -Destination $packageRoot -Force
Copy-Item -LiteralPath (Join-Path $root "deployment") -Destination $packageRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $root "database") -Destination $packageRoot -Recurse -Force

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}
Compress-Archive -Path (Join-Path $packageRoot "*") -DestinationPath $zipPath -Force

$iscc = Get-Command "iscc.exe" -ErrorAction SilentlyContinue
if ($iscc) {
  & $iscc.Source (Join-Path $PSScriptRoot "AlliedERP.iss")
} else {
  Write-Host "Inno Setup is not installed. ZIP installer package created instead."
}

Write-Host "Installer package created:"
Write-Host $zipPath
