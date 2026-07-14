$ErrorActionPreference = "Stop"

$installRoot = Join-Path $env:ProgramFiles "Allied Industrial Supplies\ERP"
$programDataRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP"
$logRoot = Join-Path $programDataRoot "Logs"
$logPath = Join-Path $logRoot "installer-error-log.txt"
$desktopShortcut = Join-Path ([Environment]::GetFolderPath("CommonDesktopDirectory")) "Allied ERP.lnk"
$startMenuShortcut = Join-Path $env:ProgramData "Microsoft\Windows\Start Menu\Programs\Allied Industrial Supplies\Allied ERP.lnk"
$uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlliedERP"

function Write-InstallerLog($message) {
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Add-Content -LiteralPath $logPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') UNINSTALL $message" -Encoding UTF8
}

function Require-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Please run uninstall as Administrator."
  }
}

try {
  Require-Administrator
  Write-InstallerLog "Starting uninstall."

  foreach ($path in @($desktopShortcut, $startMenuShortcut)) {
    if (Test-Path -LiteralPath $path) {
      Remove-Item -LiteralPath $path -Force
      Write-InstallerLog "Removed shortcut $path"
    }
  }
  if (Test-Path -LiteralPath $installRoot) {
    Remove-Item -LiteralPath $installRoot -Recurse -Force
    Write-InstallerLog "Removed install folder $installRoot"
  }
  if (Test-Path -LiteralPath $uninstallKey) {
    Remove-Item -LiteralPath $uninstallKey -Recurse -Force
    Write-InstallerLog "Removed uninstall registry key."
  }

  Write-Host "Allied ERP has been uninstalled."
  Write-Host "Config and logs remain at $programDataRoot."
  Write-InstallerLog "Uninstall completed."
} catch {
  Write-InstallerLog "Uninstall failed: $($_.Exception.Message)"
  throw
}
