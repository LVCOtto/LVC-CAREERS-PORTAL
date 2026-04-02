param(
  [string]$NeonUrl = $env:NEON_DATABASE_URL,
  [string]$DumpPath,
  [string]$EnvPath = ".env"
)

$ErrorActionPreference = "Stop"

function Get-PostgresToolPath {
  param([string]$ToolName)

  $cmd = Get-Command $ToolName -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  $fallback = Join-Path "C:\Program Files\PostgreSQL\17\bin" "$ToolName.exe"
  if (Test-Path $fallback) {
    return $fallback
  }

  throw "$ToolName was not found. Install PostgreSQL client tools first."
}

function Resolve-DumpPath {
  param(
    [string]$RepoRoot,
    [string]$RequestedPath
  )

  $candidates = @()

  if ($RequestedPath) {
    if ([System.IO.Path]::IsPathRooted($RequestedPath)) {
      $candidates += $RequestedPath
    } else {
      $candidates += (Join-Path $RepoRoot $RequestedPath)
    }
  }

  $candidates += (Join-Path $RepoRoot "attached_assets/backup.dump")
  $candidates += (Join-Path $RepoRoot "backup.dump")
  $candidates += (Join-Path $env:USERPROFILE "Downloads/backup.dump")

  foreach ($candidate in $candidates | Select-Object -Unique) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  $searched = ($candidates | Select-Object -Unique) -join ", "
  throw "Dump file not found. Searched: $searched"
}

function Invoke-NativeCommand {
  param(
    [string]$Executable,
    [string[]]$Arguments,
    [string]$FailureMessage
  )

  & $Executable @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$FailureMessage Exit code: $LASTEXITCODE"
  }
}

$repoRoot = Get-Location

if (-not $NeonUrl) {
  throw "NeonUrl is required. Pass -NeonUrl or set the NEON_DATABASE_URL environment variable."
}

$resolvedDumpPath = Resolve-DumpPath -RepoRoot $repoRoot -RequestedPath $DumpPath

$pgRestorePath = Get-PostgresToolPath -ToolName "pg_restore"
$psqlPath = Get-PostgresToolPath -ToolName "psql"

if ($NeonUrl -notmatch "sslmode=") {
  if ($NeonUrl.Contains("?")) {
    $NeonUrl = "$NeonUrl&sslmode=require"
  } else {
    $NeonUrl = "$NeonUrl?sslmode=require"
  }
}

Write-Host "Restoring dump into Neon..."
Invoke-NativeCommand -Executable $pgRestorePath -Arguments @(
  "--clean",
  "--if-exists",
  "--no-owner",
  "--no-privileges",
  "--verbose",
  "--dbname",
  $NeonUrl,
  $resolvedDumpPath
) -FailureMessage "pg_restore failed."

Write-Host "Validating connection..."
Invoke-NativeCommand -Executable $psqlPath -Arguments @(
  $NeonUrl,
  "-c",
  "SELECT NOW() AS connected_at;"
) -FailureMessage "psql validation failed."

Write-Host "Updating .env DATABASE_URL..."
$envFullPath = Join-Path $repoRoot $EnvPath
if (Test-Path $envFullPath) {
  $envText = Get-Content $envFullPath -Raw
  if ($envText -match "(?m)^DATABASE_URL=") {
    $envText = [regex]::Replace($envText, "(?m)^DATABASE_URL=.*$", "DATABASE_URL=$NeonUrl")
  } else {
    if ($envText.Length -gt 0 -and -not $envText.EndsWith("`n")) {
      $envText += "`n"
    }
    $envText += "DATABASE_URL=$NeonUrl`n"
  }
  Set-Content -Path $envFullPath -Value $envText -NoNewline
} else {
  Set-Content -Path $envFullPath -Value "DATABASE_URL=$NeonUrl`n" -NoNewline
}

Write-Host "Done. Neon import completed and .env configured."
