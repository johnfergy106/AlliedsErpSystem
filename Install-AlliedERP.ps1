$ErrorActionPreference = "Stop"

$appName = "Allied ERP"
$publisher = "Allied Industrial Supplies, Inc."
$version = "1.0.0"
$installRoot = Join-Path $env:ProgramFiles "Allied Industrial Supplies\ERP"
$programDataRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP"
$logRoot = Join-Path $programDataRoot "Logs"
$installerLog = Join-Path $logRoot "installer-error-log.txt"
$payload = Join-Path $PSScriptRoot "App"

function Write-InstallerLog($message) {
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Add-Content -LiteralPath $installerLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message" -Encoding UTF8
}

function Fail-Install($message) {
  Write-InstallerLog "ERROR: $message"
  Write-Host ""
  Write-Host "Allied ERP installer failed:"
  Write-Host $message
  Write-Host "Log file: $installerLog"
  pause
  exit 1
}

function Require-Administrator {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  if (!$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Fail-Install "Please run this installer as Administrator so it can install into Program Files and create shortcuts."
  }
}

function Read-Default($prompt, $default) {
  try {
    $value = Read-Host "$prompt [$default]"
    if ([string]::IsNullOrWhiteSpace($value)) { return $default }
    return $value
  } catch {
    Write-InstallerLog "Prompt '$prompt' could not be shown. Using default '$default'."
    return $default
  }
}

function New-Shortcut($path, $target, $arguments, $workingDirectory) {
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $target
  $shortcut.Arguments = $arguments
  $shortcut.WorkingDirectory = $workingDirectory
  $shortcut.IconLocation = "$target,0"
  $shortcut.Save()
}

try {
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Write-InstallerLog "Starting Allied ERP installer version $version from $PSScriptRoot"

  Require-Administrator

  if (!(Test-Path -LiteralPath $payload)) {
    Fail-Install "Installer payload folder was not found: $payload"
  }

  $dependencyScript = Join-Path $PSScriptRoot "Check-Dependencies.ps1"
  if (Test-Path -LiteralPath $dependencyScript) {
    Write-InstallerLog "Running dependency checker."
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $dependencyScript | Out-String | ForEach-Object { Write-InstallerLog $_ }
    if ($LASTEXITCODE -ne 0) { Fail-Install "Dependency check failed. See $installerLog." }
  } else {
    Write-InstallerLog "Dependency checker missing from installer package."
  }

  Write-Host "Allied ERP installer"
  Write-Host "App files: $installRoot"
  Write-Host "Config and logs: $programDataRoot"

  $companyName = Read-Default "Company name" "Allied Industrial Supplies, Inc."
  $website = Read-Default "Company website" "Alliedsupplies.net"
  $environmentName = Read-Default "Environment name" "Production"
  $portText = Read-Default "Local app port" "4173"
  $bindHost = Read-Default "Network bind host" "0.0.0.0"
  $publicHost = Read-Default "Network address employees will use" "10.41.25.188"
  $supportEmail = Read-Default "Support email" ""

  $port = 4173
  if (![int]::TryParse($portText, [ref]$port)) {
    Fail-Install "Local app port must be a number. Received '$portText'."
  }
  if ($port -lt 1024 -or $port -gt 65535) {
    Fail-Install "Local app port must be between 1024 and 65535. Received '$port'."
  }

  $portUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($portUse) {
    Fail-Install "Port $port is already in use. Re-run the installer and choose a different port."
  }

  New-Item -ItemType Directory -Path $installRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $programDataRoot -Force | Out-Null
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Write-InstallerLog "Created required folders."

  Copy-Item -Path (Join-Path $payload "*") -Destination $installRoot -Recurse -Force
  Write-InstallerLog "Copied app files to $installRoot"

  $config = [ordered]@{
    companyName = $companyName
    website = $website
    supportEmail = $supportEmail
    environmentName = $environmentName
    apiBaseUrl = ""
    requireHttps = $false
    localPort = $port
    bindHost = $bindHost
    publicHost = $publicHost
    allowFirewallRule = $true
  }
  $configJson = $config | ConvertTo-Json -Depth 4
  $machineConfig = Join-Path $programDataRoot "config.json"
  Set-Content -LiteralPath $machineConfig -Value $configJson -Encoding UTF8
  Write-InstallerLog "Saved machine config to $machineConfig"

  $currentUserAppData = Join-Path $env:LOCALAPPDATA "Allied Industrial Supplies\ERP"
  New-Item -ItemType Directory -Path $currentUserAppData -Force | Out-Null
  Set-Content -LiteralPath (Join-Path $currentUserAppData "config.json") -Value $configJson -Encoding UTF8
  Write-InstallerLog "Saved current-user config to $currentUserAppData"

  $validateConfig = Join-Path $PSScriptRoot "Validate-Config.ps1"
  if (Test-Path -LiteralPath $validateConfig) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $validateConfig -ConfigPath $machineConfig | Out-String | ForEach-Object { Write-InstallerLog $_ }
    if ($LASTEXITCODE -ne 0) { Fail-Install "Config validation failed. See $installerLog." }
  }

  try {
    $ruleName = "Allied ERP Local Web App"
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if (!$existingRule) {
      New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port -Profile Private | Out-Null
      Write-InstallerLog "Created Windows Firewall rule '$ruleName' for TCP port $port."
    } else {
      Write-InstallerLog "Windows Firewall rule '$ruleName' already exists."
    }
  } catch {
    Write-InstallerLog "Firewall rule warning: $($_.Exception.Message)"
    Write-Host "Warning: Could not create Windows Firewall rule. Other computers may be blocked until port $port is allowed."
  }

  $launcher = @"
`$ErrorActionPreference = "Stop"
Set-Location "$installRoot"
& "$installRoot\start-allied-erp.ps1"
"@
  Set-Content -LiteralPath (Join-Path $installRoot "Launch-AlliedERP.ps1") -Value $launcher -Encoding UTF8

  foreach ($scriptName in @("Uninstall-AlliedERP.ps1", "Clean-Uninstall-AlliedERP.ps1", "Reinstall-AlliedERP.ps1", "Check-Dependencies.ps1", "Validate-Config.ps1")) {
    $source = Join-Path $PSScriptRoot $scriptName
    if (Test-Path -LiteralPath $source) {
      Copy-Item -LiteralPath $source -Destination (Join-Path $installRoot $scriptName) -Force
    }
  }
  Write-InstallerLog "Copied maintenance scripts."

  $desktopShortcut = Join-Path ([Environment]::GetFolderPath("CommonDesktopDirectory")) "Allied ERP.lnk"
  $startMenuDir = Join-Path $env:ProgramData "Microsoft\Windows\Start Menu\Programs\Allied Industrial Supplies"
  New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
  $startMenuShortcut = Join-Path $startMenuDir "Allied ERP.lnk"
  $target = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
  $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$installRoot\Launch-AlliedERP.ps1`""

  New-Shortcut $desktopShortcut $target $arguments $installRoot
  New-Shortcut $startMenuShortcut $target $arguments $installRoot
  Write-InstallerLog "Created desktop and start menu shortcuts."

  $uninstallKey = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\AlliedERP"
  New-Item -Path $uninstallKey -Force | Out-Null
  Set-ItemProperty -Path $uninstallKey -Name "DisplayName" -Value $appName
  Set-ItemProperty -Path $uninstallKey -Name "Publisher" -Value $publisher
  Set-ItemProperty -Path $uninstallKey -Name "DisplayVersion" -Value $version
  Set-ItemProperty -Path $uninstallKey -Name "InstallLocation" -Value $installRoot
  Set-ItemProperty -Path $uninstallKey -Name "UninstallString" -Value "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$installRoot\Uninstall-AlliedERP.ps1`""
  Write-InstallerLog "Registered uninstall entry."

  Write-InstallerLog "Install completed successfully. Starting app."
  Write-Host "Install complete. Starting Allied ERP..."
  Start-Process $target -ArgumentList $arguments -WorkingDirectory $installRoot
  Write-Host "Allied ERP installed successfully."
  Write-Host "Network URL: http://$publicHost`:$port"
  Write-Host "Installer log: $installerLog"
} catch {
  Fail-Install $_.Exception.Message
}
