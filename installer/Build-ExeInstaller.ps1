$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$zipPath = Join-Path $dist "AlliedERP-Installer-1.0.0.zip"
$bootstrap = Join-Path $PSScriptRoot "Bootstrap-Installer.ps1"
$exePath = Join-Path $dist "AlliedERP-Setup-1.0.0.exe"
$sedPath = Join-Path $dist "AlliedERP-Setup-1.0.0.sed"
$iexpress = Join-Path $env:SystemRoot "System32\iexpress.exe"

if (!(Test-Path -LiteralPath $zipPath)) {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "Build-Installer.ps1")
}

if (!(Test-Path -LiteralPath $zipPath)) {
  throw "Installer ZIP was not found: $zipPath"
}
if (!(Test-Path -LiteralPath $bootstrap)) {
  throw "Bootstrap installer was not found: $bootstrap"
}
if (!(Test-Path -LiteralPath $iexpress)) {
  throw "IExpress was not found on this Windows computer."
}

if (Test-Path -LiteralPath $exePath) {
  Remove-Item -LiteralPath $exePath -Force
}

$sed = @"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=1
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=This will install Allied ERP on this computer. Administrator permission may be required.
DisplayLicense=
FinishMessage=Allied ERP installer has finished.
TargetName=$exePath
FriendlyName=Allied ERP Setup 1.0.0
AppLaunched=powershell.exe -NoProfile -ExecutionPolicy Bypass -File Bootstrap-Installer.ps1
PostInstallCmd=<None>
AdminQuietInstCmd=powershell.exe -NoProfile -ExecutionPolicy Bypass -File Bootstrap-Installer.ps1
UserQuietInstCmd=powershell.exe -NoProfile -ExecutionPolicy Bypass -File Bootstrap-Installer.ps1
FILE0=Bootstrap-Installer.ps1
FILE1=AlliedERP-Installer-1.0.0.zip
[SourceFiles]
SourceFiles0=$PSScriptRoot\
SourceFiles1=$dist\
[SourceFiles0]
%FILE0%=
[SourceFiles1]
%FILE1%=
"@

Set-Content -LiteralPath $sedPath -Value $sed -Encoding ASCII

& $iexpress /N /Q $sedPath

for ($attempt = 0; $attempt -lt 20 -and !(Test-Path -LiteralPath $exePath); $attempt++) {
  Start-Sleep -Milliseconds 250
}

if (!(Test-Path -LiteralPath $exePath)) {
  throw "IExpress did not create the expected EXE: $exePath"
}

Write-Host "EXE installer created:"
Write-Host $exePath
