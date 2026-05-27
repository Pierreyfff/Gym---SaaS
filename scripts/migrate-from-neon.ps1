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
Write-Host "  GymSaaS - Migracion desde NeonDB" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTA: Este script migrara datos desde NeonDB a tu PostgreSQL local en Docker"
Write-Host ""

$container = docker ps --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if (-not $container) {
    Write-Host "ERROR: El contenedor '$ContainerName' no esta corriendo" -ForegroundColor Red
    Write-Host "   Ejecuta primero: docker compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "Conectando a NeonDB para exportar..." -ForegroundColor Yellow
Write-Host "  (Usando PostgreSQL 17 para compatibilidad)" -ForegroundColor Gray

Write-Host "Exportando desde NeonDB y restaurando en local..." -ForegroundColor Yellow
docker run --rm --network gym-saas-network postgres:17-alpine pg_dump "$NeonDbUrl" --data-only --no-owner --no-acl | docker exec -i gym-saas-db psql -U $LocalDbUser -d $LocalDbName

if ($LASTEXITCODE -eq 0) {
    Write-Host "Migracion completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resumen:" -ForegroundColor Cyan
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
    Write-Host "Error al restaurar en PostgreSQL local" -ForegroundColor Red
}
