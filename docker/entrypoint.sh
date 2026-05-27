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

echo "📦 Ejecutando migraciones de Prisma..."
npx prisma migrate deploy
echo "✅ Migraciones aplicadas"

echo "🏋️ Verificando datos iniciales..."
GIMNASIO_COUNT=$(psql "$DATABASE_URL" -t -A -c "SELECT count(*) FROM gimnasios;" 2>/dev/null || echo "0")

if [ "$GIMNASIO_COUNT" = "0" ]; then
  echo "🌱 Inicializando gimnasio y admin por defecto..."
  cd /app/packages/database
  pnpm exec ts-node prisma/init.ts
  echo "✅ Datos iniciales creados"

  echo "🌱 Ejecutando seed de demostración..."
  pnpm exec ts-node prisma/seed.ts
  echo "✅ Seed completado"
else
  echo "✅ La base de datos ya contiene datos, se omite seed"
fi

cd /app

echo "============================================"
echo "  🚀 Iniciando backend..."
echo "============================================"

exec "$@"
