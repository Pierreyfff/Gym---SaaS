param(
    [Parameter(Mandatory = $false)]
    [string]$TaskName = "GymSaaS-DailyBackup",
    
    [Parameter(Mandatory = $false)]
    [string]$Time = "03:00",
    
    [Parameter(Mandatory = $false)]
    [string]$ScriptPath = ".\scripts\backup-db.ps1"
)

$scriptFullPath = Join-Path (Get-Location) $ScriptPath
$taskPath = "\GymSaaS\"
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptFullPath`""

$trigger = New-ScheduledTaskTrigger -Daily -At $Time

$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

$task = New-ScheduledTask -Action $action -Principal $principal -Trigger $trigger -Settings $settings

try {
    $null = Get-ScheduledTask -TaskPath $taskPath -TaskName $TaskName -ErrorAction Stop
    Write-Host "Updating existing scheduled task..."
    Set-ScheduledTask -TaskPath $taskPath -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings
} catch {
    Write-Host "Creating new scheduled task..."
    Register-ScheduledTask -TaskName $TaskName -TaskPath $taskPath -Action $action -Trigger $trigger -Principal $principal -Settings $settings
}

Write-Host "Scheduled task '$TaskName' registered daily at $Time"
Write-Host "Backup script: $scriptFullPath"
Write-Host "To disable: Unregister-ScheduledTask -TaskPath '$taskPath' -TaskName '$TaskName' -Confirm:`$false"
