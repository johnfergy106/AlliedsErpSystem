$ErrorActionPreference = "Stop"

$logRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP\Logs"
$logPath = Join-Path $logRoot "installer-error-log.txt"

function Write-InstallerLog($message) {
  try {
    New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
    Add-Content -LiteralPath $logPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') BOOTSTRAP $message" -Encoding UTF8
  } catch {
    Write-Host "Unable to write bootstrap log: $($_.Exception.Message)"
  }
}

try {
  Write-InstallerLog "Starting EXE bootstrap from $PSScriptRoot"

  $package = Join-Path $PSScriptRoot "AlliedERP-Installer-1.0.0.zip"
  $extractRoot = Join-Path $env:TEMP ("AlliedERP-Installer-" + [guid]::NewGuid().ToString("N"))

  if (!(Test-Path -LiteralPath $package)) {
    throw "Installer package was not found: $package"
  }

  New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null
  Expand-Archive -LiteralPath $package -DestinationPath $extractRoot -Force
  Write-InstallerLog "Extracted installer ZIP to $extractRoot"

  $installer = Join-Path $extractRoot "Install-AlliedERP.ps1"
  if (!(Test-Path -LiteralPath $installer)) {
    throw "Installer script was not found after extraction: $installer"
  }

  Write-Host "Launching Allied ERP installer..."
  Write-Host "If Windows asks for permission, choose Yes."

  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

  if ($isAdmin) {
    Write-InstallerLog "Running installer in current elevated process."
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer
  } else {
    Write-InstallerLog "Requesting elevation for installer."
    Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$installer`"" -Verb RunAs -Wait
  }
} catch {
  Write-InstallerLog "Bootstrap failed: $($_.Exception.Message)"
  Write-Host "Allied ERP installer failed before setup could start."
  Write-Host $_.Exception.Message
  Write-Host "Log file: $logPath"
  pause
  exit 1
}
