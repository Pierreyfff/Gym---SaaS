param(
    [Parameter(Mandatory = $true)]
    [string]$NeonDbUrl,
    
    [Parameter(Mandatory = $false)]
    [string]$ContainerName = "gym-saas-db",
    
    [Parameter(Mandatory = $false)]
    [string]$LocalDbUser = "gymsaas",
    
    [Parameter(Mandatory = $false)]
    [string]$LocalDbName = "gym_saas"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  GymSaaS - Migración desde NeonDB" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  Este script migrará datos desde NeonDB a tu PostgreSQL local en Docker"
Write-Host ""

$container = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if (-not $container) {
    Write-Host "❌ El contenedor '$ContainerName' no está corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "⏳ Conectando a NeonDB para exportar..." -ForegroundColor Yellow
Write-Host "   (Esto puede tomar unos segundos)" -ForegroundColor Gray

$dumpFile = "neondb_export_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"

# Usar pg_dump dentro del contenedor postgres para hacer el dump remoto
docker exec $ContainerName pg_dump "$NeonDbUrl" --format=custom --no-owner --no-acl -f "/tmp/$dumpFile"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al conectar con NeonDB" -ForegroundColor Red
    Write-Host "   Verifica que la URL sea correcta y que tengas acceso" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Exportación desde NeonDB completada" -ForegroundColor Green

Write-Host "⏳ Restaurando en PostgreSQL local..." -ForegroundColor Yellow

# Restaurar en la base local
docker exec $ContainerName pg_restore -U $LocalDbUser -d $LocalDbName --clean --if-exists "/tmp/$dumpFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migración completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resumen:" -ForegroundColor Cyan
    docker exec $ContainerName psql -U $LocalDbUser -d $LocalDbName -c "
        SELECT 'gimnasios' as tabla, count(*) as registros FROM gimnasios
        UNION ALL SELECT 'usuarios', count(*) FROM usuarios
        UNION ALL SELECT 'planes', count(*) FROM planes
        UNION ALL SELECT 'membresias', count(*) FROM membresias
        UNION ALL SELECT 'pagos', count(*) FROM pagos
        UNION ALL SELECT 'asistencias', count(*) FROM asistencias
        UNION ALL SELECT 'productos', count(*) FROM productos
        UNION ALL SELECT 'ventas_productos', count(*) FROM ventas_productos;
    "
} else {
    Write-Host "❌ Error al restaurar en PostgreSQL local" -ForegroundColor Red
}

# Limpiar
docker exec $ContainerName rm -f "/tmp/$dumpFile" 2>$null
