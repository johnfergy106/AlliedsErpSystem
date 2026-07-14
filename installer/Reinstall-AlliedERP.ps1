$ErrorActionPreference = "Stop"

$installer = Join-Path $PSScriptRoot "Install-AlliedERP.ps1"
$cleanUninstall = Join-Path $PSScriptRoot "Clean-Uninstall-AlliedERP.ps1"
$logRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP\Logs"
$logPath = Join-Path $logRoot "installer-error-log.txt"

New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
Add-Content -LiteralPath $logPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') REINSTALL Starting reinstall." -Encoding UTF8

if (!(Test-Path -LiteralPath $installer)) { throw "Installer not found: $installer" }
if (!(Test-Path -LiteralPath $cleanUninstall)) { throw "Clean uninstall script not found: $cleanUninstall" }

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $cleanUninstall
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer
