# scripts/project.ps1
# Run pnpm with repository-scoped storage; restore the caller environment on exit.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$PnpmArgs)

$root = Split-Path -Parent $PSScriptRoot
$cacheRoot = Join-Path $root ".cache"
$playwrightPath = Join-Path $cacheRoot "ms-playwright"
$tmpPath = Join-Path $cacheRoot "tmp"
$npmCachePath = Join-Path $cacheRoot "npm"
$pnpmStatePath = Join-Path $cacheRoot "pnpm-state"

# Ensure directories exist (no deletion, no persistent settings change)
$dirs = @($playwrightPath, $tmpPath, $npmCachePath, $pnpmStatePath)
foreach ($d in $dirs) {
    if (-not (Test-Path -LiteralPath $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# Pre-resolve pnpm command
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmCmd) {
    Write-Error "pnpm not found in PATH."
    exit 1
}

# Save current process environment values for restoration
$savedEnv = @{}
$envKeys = @("PLAYWRIGHT_BROWSERS_PATH", "TEMP", "TMP", "npm_config_cache", "PNPM_CONFIG_STATE_DIR")
foreach ($k in $envKeys) {
    $savedEnv[$k] = [Environment]::GetEnvironmentVariable($k, "Process")
}

$exitCode = 1
$locationPushed = $false
try {
    Push-Location -LiteralPath $root -ErrorAction Stop
    $locationPushed = $true
    [Environment]::SetEnvironmentVariable("PLAYWRIGHT_BROWSERS_PATH", $playwrightPath, "Process")
    [Environment]::SetEnvironmentVariable("TEMP", $tmpPath, "Process")
    [Environment]::SetEnvironmentVariable("TMP", $tmpPath, "Process")
    [Environment]::SetEnvironmentVariable("npm_config_cache", $npmCachePath, "Process")
    [Environment]::SetEnvironmentVariable("PNPM_CONFIG_STATE_DIR", $pnpmStatePath, "Process")
    [string[]]$argsToUse = if ($PnpmArgs.Count -eq 0) { @("dev") } else { $PnpmArgs }
    & $pnpmCmd.Source @argsToUse
    $exitCode = $LASTEXITCODE
}
finally {
    if ($locationPushed) { Pop-Location }
    # Restore environment variables
    foreach ($k in $envKeys) {
        $val = $savedEnv[$k]
        if ($null -eq $val) {
            Remove-Item -LiteralPath ("Env:\" + $k) -ErrorAction SilentlyContinue
        } else {
            [Environment]::SetEnvironmentVariable($k, $val, "Process")
        }
    }
}
exit $exitCode
