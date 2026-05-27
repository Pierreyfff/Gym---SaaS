param(
    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "./backups",
    
    [Parameter(Mandatory = $false)]
    [string]$ContainerName = "gym-saas-db",
    
    [Parameter(Mandatory = $false)]
    [string]$DbUser = "gymsaas",
    
    [Parameter(Mandatory = $false)]
    [string]$DbName = "gym_saas"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = Join-Path -Path $OutputDir -ChildPath $timestamp

New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$dumpFile = Join-Path -Path $backupDir -ChildPath "gym_saas_backup.sql"
$dataFile = Join-Path -Path $backupDir -ChildPath "gym_saas_data_only.sql"
$schemaFile = Join-Path -Path $backupDir -ChildPath "gym_saas_schema_only.sql"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  GymSaaS - Backup de Base de Datos" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Directorio de backup: $backupDir" -ForegroundColor Yellow
Write-Host ""

# Verificar que el contenedor esté corriendo
$container = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if (-not $container) {
    Write-Host "❌ El contenedor '$ContainerName' no está corriendo" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar 'docker compose up -d' primero" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Exportando dump completo..." -ForegroundColor Yellow
docker exec $ContainerName pg_dump -U $DbUser -d $DbName --format=custom -f "/tmp/gym_saas_backup.dump"
if ($LASTEXITCODE -eq 0) {
    docker cp "$ContainerName:/tmp/gym_saas_backup.dump" "$backupDir/gym_saas_backup.dump"
    Write-Host "✅ Dump completo: $backupDir/gym_saas_backup.dump" -ForegroundColor Green
} else {
    Write-Host "❌ Error al crear dump completo" -ForegroundColor Red
}

Write-Host "⏳ Exportando schema solamente..." -ForegroundColor Yellow
docker exec $ContainerName pg_dump -U $DbUser -d $DbName --schema-only -f "/tmp/gym_saas_schema.sql"
if ($LASTEXITCODE -eq 0) {
    docker cp "$ContainerName:/tmp/gym_saas_schema.sql" $schemaFile
    Write-Host "✅ Schema exportado: $schemaFile" -ForegroundColor Green
} else {
    Write-Host "❌ Error al exportar schema" -ForegroundColor Red
}

Write-Host "⏳ Exportando datos solamente..." -ForegroundColor Yellow
docker exec $ContainerName pg_dump -U $DbUser -d $DbName --data-only --format=custom -f "/tmp/gym_saas_data.dump"
if ($LASTEXITCODE -eq 0) {
    docker cp "$ContainerName:/tmp/gym_saas_data.dump" "$backupDir/gym_saas_data.dump"
    Write-Host "✅ Datos exportados: $backupDir/gym_saas_data.dump" -ForegroundColor Green
} else {
    Write-Host "❌ Error al exportar datos" -ForegroundColor Red
}

# Limpiar archivos temporales en el contenedor
docker exec $ContainerName rm -f /tmp/gym_saas_backup.dump /tmp/gym_saas_schema.sql /tmp/gym_saas_data.dump 2>$null

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ✅ Backup completado exitosamente" -ForegroundColor Green
Write-Host "  📂 $backupDir" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para restaurar este backup, ejecuta:" -ForegroundColor White
Write-Host "  .\scripts\restore-db.ps1 -BackupPath '$backupDir\gym_saas_backup.dump'" -ForegroundColor Gray
