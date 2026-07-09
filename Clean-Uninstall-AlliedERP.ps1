$ErrorActionPreference = "Stop"

$installRoot = Join-Path $env:ProgramFiles "Allied Industrial Supplies\ERP"
$programDataRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP"
$logRoot = Join-Path $programDataRoot "Logs"
$logPath = Join-Path $logRoot "installer-error-log.txt"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("CommonDesktopDirectory")) "Allied ERP.lnk"
$startMenuShortcut = Join-Path $env:ProgramData "Microsoft\Windows\Start Menu\Programs\Allied Industrial Supplies\Allied ERP.lnk"
$uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlliedERP"

function Require-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Please run clean uninstall as Administrator."
  }
}

function Write-InstallerLog($message) {
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Add-Content -LiteralPath $logPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') CLEAN-UNINSTALL $message" -Encoding UTF8
}

Require-Administrator
Write-InstallerLog "Starting clean uninstall."

foreach ($path in @($desktopShortcut, $startMenuShortcut)) {
  if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
}
if (Test-Path -LiteralPath $installRoot) { Remove-Item -LiteralPath $installRoot -Recurse -Force }
if (Test-Path -LiteralPath $programDataRoot) { Remove-Item -LiteralPath $programDataRoot -Recurse -Force }
if (Test-Path -LiteralPath $uninstallKey) { Remove-Item -LiteralPath $uninstallKey -Recurse -Force }

Write-Host "Clean uninstall complete."
Write-InstallerLog "Clean uninstall complete."
