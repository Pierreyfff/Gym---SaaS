#!/bin/bash
set -e

echo "============================================"
echo "  GymSaaS - Backend Entrypoint"
echo "============================================"

echo "⏳ Esperando a PostgreSQL..."
until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$POSTGRES_USER"; do
  sleep 2
done
echo "✅ PostgreSQL está listo"

cd /app/packages/database

echo "📦 Aplicando migraciones de Prisma..."
npx prisma migrate deploy 2>/dev/null && echo "✅ Migraciones aplicadas" || echo "⚠️ No hay migraciones pendientes, sincronizando schema..."

echo "🔄 Sincronizando schema con base de datos..."
npx prisma db push --accept-data-loss
echo "✅ Schema sincronizado"

echo "🏋️ Verificando datos iniciales..."
GIMNASIO_COUNT=$(psql "$DATABASE_URL" -t -A -c "SELECT count(*) FROM gimnasios;" 2>/dev/null || echo "0")

if [ "$GIMNASIO_COUNT" = "0" ]; then
  echo "⚠️ Base de datos vacía - ejecutando init + seed..."
  cd /app/packages/database
  tsx prisma/init.ts && echo "✅ Init completado" || echo "⚠️ Error en init"
  tsx prisma/seed.ts && echo "✅ Seed completado" || echo "⚠️ Error en seed"
  cd /app
else
  echo "✅ La base de datos ya contiene datos, se omite seed"
fi

cd /app

echo "============================================"
echo "  🚀 Iniciando backend..."
echo "============================================"

exec "$@"
