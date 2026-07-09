$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$appDataRoot = Join-Path $env:LOCALAPPDATA "Allied Industrial Supplies\ERP"
$programDataRoot = Join-Path $env:ProgramData "Allied Industrial Supplies\ERP"
$startupLog = Join-Path $appDataRoot "app-startup-log.txt"
try { Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue } catch {}

function Write-AppLog($message) {
  try {
    New-Item -ItemType Directory -Path $appDataRoot -Force | Out-Null
    $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message"
    Add-Content -LiteralPath $startupLog -Value $line -Encoding UTF8
  } catch {
    Write-Host "Unable to write startup log: $($_.Exception.Message)"
  }
}

function Get-FirstExistingPath($paths) {
  foreach ($candidate in $paths) {
    if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) { return $candidate }
  }
  return $null
}

function Load-Config {
  New-Item -ItemType Directory -Path $appDataRoot -Force | Out-Null
  $userConfig = Join-Path $appDataRoot "config.json"
  $machineConfig = Join-Path $programDataRoot "config.json"
  $installedConfig = Join-Path $PSScriptRoot "config.json"

  if (!(Test-Path -LiteralPath $userConfig) -and (Test-Path -LiteralPath $machineConfig)) {
    Copy-Item -LiteralPath $machineConfig -Destination $userConfig -Force
    Write-AppLog "Copied machine config to user AppData."
  }

  $configPath = Get-FirstExistingPath @($userConfig, $machineConfig, $installedConfig)
  if (!$configPath) { return [pscustomobject]@{ localPort = 4173; bindHost = "0.0.0.0"; publicHost = "" } }

  Write-AppLog "Using config file: $configPath"
  return Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

try {
  Write-AppLog "Starting Allied ERP launcher from $PSScriptRoot"
  $config = Load-Config
  $port = 4173
  $bindHost = "0.0.0.0"
  $publicHost = ""
  if ($config.localPort) { $port = [int]$config.localPort }
  if ($config.bindHost) { $bindHost = [string]$config.bindHost }
  if ($config.publicHost) { $publicHost = [string]$config.publicHost }
  if ($env:ALLIED_ERP_PORT) { $port = [int]$env:ALLIED_ERP_PORT }
  if ($env:ALLIED_ERP_HOST) { $bindHost = [string]$env:ALLIED_ERP_HOST }
  if ($env:ALLIED_ERP_PUBLIC_HOST) { $publicHost = [string]$env:ALLIED_ERP_PUBLIC_HOST }
  if ($port -lt 1024 -or $port -gt 65535) { throw "Invalid localPort '$port'. Use a port between 1024 and 65535." }

  $existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($existing) {
    $message = "Port $port is already in use. Close the other app or change localPort in $appDataRoot\config.json."
    Write-AppLog $message
    try { [System.Windows.Forms.MessageBox]::Show($message, "Allied ERP Startup Error", "OK", "Error") | Out-Null } catch {}
    throw $message
  }

  $ipAddress = [System.Net.IPAddress]::Any
  if ($bindHost -and $bindHost -ne "0.0.0.0" -and $bindHost -ne "*") {
    $ipAddress = [System.Net.IPAddress]::Parse($bindHost)
  }
  if (!$publicHost) {
    $publicHost = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
      Select-Object -First 1 -ExpandProperty IPAddress)
  }
  if (!$publicHost) { $publicHost = "localhost" }
  $appUrl = "http://$publicHost`:$port"

  $listener = [System.Net.Sockets.TcpListener]::new($ipAddress, $port)
  $listener.Start()
  Write-AppLog "Server listening on $bindHost`:$port. Network URL: $appUrl"

  Write-Host "Starting Allied ERP at $appUrl"
  Write-Host "Network users can open $appUrl from another computer on the same network."
  Write-Host "Startup log: $startupLog"
  Write-Host "Leave this window open while using the application."
  Write-Host "Press Ctrl+C to stop the ERP."
  Start-Process $appUrl

  $contentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".js" = "text/javascript; charset=utf-8"
    ".css" = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg" = "image/svg+xml"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".png" = "image/png"
    ".txt" = "text/plain; charset=utf-8"
  }

  try {
    while ($true) {
      $client = $listener.AcceptTcpClient()
      try {
        $stream = $client.GetStream()
        $stream.ReadTimeout = 3000
        $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
        $requestLine = $reader.ReadLine()
        while ($true) {
          $headerLine = $reader.ReadLine()
          if ($null -eq $headerLine -or $headerLine -eq "") { break }
        }

        $target = "/index.html"
        if ($requestLine -match "^[A-Z]+ ([^ ]+) HTTP/") {
          $target = [System.Uri]::UnescapeDataString($matches[1].Split("?")[0])
          if ($target -eq "/") { $target = "/index.html" }
        }

        $servedExternalConfig = $false
        if ($target -eq "/config.json") {
          $configPath = Get-FirstExistingPath @((Join-Path $appDataRoot "config.json"), (Join-Path $programDataRoot "config.json"), (Join-Path $PSScriptRoot "config.json"))
          if ($configPath) {
            $path = $configPath
            $servedExternalConfig = $true
          }
        }

        if (!$servedExternalConfig) {
          $relative = $target.TrimStart("/") -replace "/", [System.IO.Path]::DirectorySeparatorChar
          $path = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot $relative))
          $root = [System.IO.Path]::GetFullPath($PSScriptRoot)
        }

        if (!$servedExternalConfig -and !$path.StartsWith($root)) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
          $header = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        } elseif (!(Test-Path -LiteralPath $path -PathType Leaf)) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
          $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        } else {
          $body = [System.IO.File]::ReadAllBytes($path)
          $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
          $type = $contentTypes[$extension]
          if (!$type) { $type = "application/octet-stream" }
          $header = "HTTP/1.1 200 OK`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
        }

        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
      } catch {
        Write-AppLog "Request handling warning: $($_.Exception.Message)"
      } finally {
        $client.Close()
      }
    }
  } finally {
    $listener.Stop()
    Write-AppLog "Local server stopped."
  }
} catch {
  Write-AppLog "Startup failed: $($_.Exception.Message)"
  Write-Host "Allied ERP failed to start: $($_.Exception.Message)"
  Write-Host "Startup log: $startupLog"
  pause
  exit 1
}
