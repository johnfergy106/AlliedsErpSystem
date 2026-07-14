$ErrorActionPreference = "Stop"

$logRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP\Logs"
$logPath = Join-Path $logRoot "installer-error-log.txt"

function Write-InstallerLog($message) {
  New-Item -ItemType Directory -Path $logRoot -Force | Out-Null
  Add-Content -LiteralPath $logPath -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message" -Encoding UTF8
}

$result = [ordered]@{
  ok = $true
  errors = @()
  warnings = @()
  powershellVersion = $PSVersionTable.PSVersion.ToString()
  browserFound = $false
  browser = ""
}

try {
  Write-InstallerLog "Checking dependencies."

  if ($PSVersionTable.PSVersion.Major -lt 5) {
    $result.ok = $false
    $result.errors += "PowerShell 5.1 or newer is required."
  }

  $edgePaths = @(
    "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
  )
  $chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles (x86)\Google\Chrome\Application\chrome.exe"
  )
  $browser = @($edgePaths + $chromePaths) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
  if ($browser) {
    $result.browserFound = $true
    $result.browser = $browser
  } else {
    $result.warnings += "Microsoft Edge or Google Chrome was not found in the standard install folders."
  }

  try {
    $testPath = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP\Logs\write-test.tmp"
    New-Item -ItemType Directory -Path (Split-Path -Parent $testPath) -Force | Out-Null
    Set-Content -LiteralPath $testPath -Value "ok" -Encoding UTF8
    Remove-Item -LiteralPath $testPath -Force
  } catch {
    $result.ok = $false
    $result.errors += "Cannot write to ProgramData log folder: $($_.Exception.Message)"
  }

  Write-InstallerLog "Dependency check result: ok=$($result.ok); browser=$($result.browser)"
  $result | ConvertTo-Json -Depth 4
  if (!$result.ok) { exit 1 }
} catch {
  Write-InstallerLog "Dependency check failed: $($_.Exception.Message)"
  throw
}
