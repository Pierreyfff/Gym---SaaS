param(
    [Parameter(Mandatory = $true)]
    [string]$BackupPath,
    
    [Parameter(Mandatory = $false)]
    [string]$ContainerName = "gym-saas-db",
    
    [Parameter(Mandatory = $false)]
    [string]$DbUser = "gymsaas",
    
    [Parameter(Mandatory = $false)]
    [string]$DbName = "gym_saas",
    
    [Parameter(Mandatory = $false)]
    [switch]$DropExisting
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  GymSaaS - Restauración de Base de Datos" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $BackupPath)) {
    Write-Host "❌ El archivo de backup no existe: $BackupPath" -ForegroundColor Red
    exit 1
}

$container = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if (-not $container) {
    Write-Host "❌ El contenedor '$ContainerName' no está corriendo" -ForegroundColor Red
    exit 1
}

if ($DropExisting) {
    Write-Host "⚠️  ATENCIÓN: Se eliminarán todos los datos existentes en $DbName" -ForegroundColor Red
    Write-Host "   Presiona Ctrl+C para cancelar o espera 5 segundos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "⏳ Eliminando datos existentes..." -ForegroundColor Yellow
    docker exec $ContainerName psql -U $DbUser -d $DbName -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;" 2>$null
}

$ext = [System.IO.Path]::GetExtension($BackupPath).ToLower()

Write-Host "⏳ Copiando backup al contenedor..." -ForegroundColor Yellow
$remotePath = "/tmp/restore_backup$ext"
docker cp $BackupPath "$ContainerName$remotePath"

if ($ext -eq ".dump" -or $ext -eq ".custom") {
    Write-Host "⏳ Restaurando desde dump custom..." -ForegroundColor Yellow
    docker exec $ContainerName pg_restore -U $DbUser -d $DbName --clean --if-exists -j 4 "$remotePath"
} elseif ($ext -eq ".sql") {
    Write-Host "⏳ Restaurando desde SQL..." -ForegroundColor Yellow
    docker exec -i $ContainerName psql -U $DbUser -d $DbName -f "$remotePath"
} else {
    Write-Host "❌ Formato de backup no soportado: $ext" -ForegroundColor Red
    Write-Host "   Usa: .dump, .custom, o .sql" -ForegroundColor Yellow
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos restaurada exitosamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al restaurar la base de datos" -ForegroundColor Red
}

docker exec $ContainerName rm -f "$remotePath" 2>$null
