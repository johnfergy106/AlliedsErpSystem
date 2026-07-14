param(
  [string]$ConfigPath
)

$ErrorActionPreference = "Stop"

if (!$ConfigPath) {
  $ConfigPath = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP\config.json"
}

if (!(Test-Path -LiteralPath $ConfigPath -PathType Leaf)) {
  throw "Config file was not found: $ConfigPath"
}

$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$errors = @()

if (!$config.companyName) { $errors += "companyName is required." }
if (!$config.environmentName) { $errors += "environmentName is required." }
if (!$config.bindHost) { $errors += "bindHost is required. Use 0.0.0.0 for network access." }
if ($config.localPort) {
  $port = [int]$config.localPort
  if ($port -lt 1024 -or $port -gt 65535) { $errors += "localPort must be between 1024 and 65535." }
}

if ($errors.Count) {
  throw ($errors -join " ")
}

Write-Host "Config is valid: $ConfigPath"
