# GymSaaS — Plataforma de Gestión Deportiva

Sistema SaaS modular para administración de gimnasios: membresías, ventas, asistencias, pagos y reportes. Arquitectura monorepo con microservicios backend y frontend React, desplegable con Docker.

---

## Arquitectura

```
gym-saas/
├── packages/
│   ├── backend/          # API REST (NestJS + PostgreSQL via Prisma)
│   ├── web/              # Frontend SPA (React + Vite + Tailwind)
│   ├── api-client/       # SDK tipado para consumir la API
│   ├── shared/           # DTOs y tipos compartidos (backend ↔ frontend)
│   └── database/         # Schema Prisma, migraciones y seed
├── docker/               # Dockerfiles y config de infra
├── scripts/              # Scripts de utilidad
├── docker-compose.yml    # Orquestación completa
└── turbo.json            # Configuración Turborepo
```

## Stack Tecnológico

| Capa        | Tecnología                                                  |
|-------------|-------------------------------------------------------------|
| Frontend    | React 19, Vite, TypeScript, TailwindCSS, Recharts, Zustand  |
| Backend     | NestJS, Prisma ORM, PostgreSQL, JWT, class-validator        |
| Infra       | Docker Compose, Nginx (en producción), Turborepo            |
| SDK         | Cliente API tipado auto-generado con Axios                  |

## Modelo de Datos

- **Usuarios** — autenticación y roles (admin, recepcionista, entrenador)
- **Clientes** — perfil, datos personales, historial
- **Planes** — precios, duración, características
- **Membresías** — asignación de plan a cliente con control de vigencia
- **Pagos** — registro, métodos de pago y reembolsos
- **Asistencias** — check-in diario por cliente
- **Productos** — inventario con control de stock mínimo
- **Ventas** — venta de productos con items y cálculo automático
- **Reportes** — ingresos detallados, diarios, productos más vendidos

## Roles y Accesos

| Rol            | Credenciales                     |
|----------------|----------------------------------|
| Administrador  | `admin@gymdemo.com` / `admin123` |

**Frontend público** (tienda, planes, registro): accesible sin autenticación.  
**Dashboard admin**: gestión completa de clientes, membresías, pagos, productos, usuarios, asistencias, reportes, configuración, galería, testimonios y staff.  
**Perfil cliente autoservicio**: ver/editar perfil, historial de compras, membresía activa.

## Funcionalidades Principales

- Autenticación JWT con refresh token y "Recordar sesión"
- Dashboard ejecutivo con gráficos (ingresos, asistencias, distribución de membresías, top productos)
- CRUD completo de clientes, planes, membresías, productos, categorías, usuarios, staff, testimonios, galería
- Inscripción wizard (cliente + membresía + pago en un flujo)
- Tienda pública con carrito lateral (Sheet) y lista de favoritos, persistencia con Zustand
- Checkout de productos integrado con el carrito
- Control de stock con alertas visuales (sin stock / stock bajo)
- Reembolso de pagos con motivo y registro
- Cambio y renovación de membresías
- Exportación de pagos a Excel y PDF
- Modo oscuro / claro con persistencia
- Tema visual configurable desde panel de administración
- Precios en Soles (PEN) con formato localizado

## Inicio Rápido

### Prerrequisitos

- Docker Desktop (Windows) o Docker Engine + Compose (Linux/Mac)
- Git

### 1. Clonar y entrar

```bash
git clone https://github.com/Pierreyfff/Gym---SaaS.git
cd Gym---SaaS
```

### 2. Variables de Entorno

El proyecto utiliza valores por defecto funcionales. Para personalizar, copie y edite:

```bash
cp .env.docker .env
# Edite según necesidad (puertos, contraseñas, etc.)
```

### 3. Iniciar

```bash
docker compose up -d
```

Esto construye imágenes (si es primera vez) y levanta:
- **PostgreSQL** en `localhost:5432`
- **Backend API** en `http://localhost:3001`
- **Frontend Web** en `http://localhost:5173`

La primera ejecución ejecuta migraciones y seed automáticamente (poblado con datos demo).

### 4. Acceder

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| API       | http://localhost:3001/api    |
| Admin     | admin@gymdemo.com / admin123 |

## Comandos Docker

```bash
# Iniciar servicios (usa imágenes existentes, sin rebuild)
docker compose up -d

# Reconstruir imágenes y reiniciar
docker compose up -d --build

# Reconstruir solo backend o web
docker compose build backend
docker compose build web

# Ver logs
docker compose logs -f

# Detener y limpiar
docker compose down

# Eliminar volúmenes (borra BD, respaldar primero)
docker compose down -v
```
## Desarrollo

```bash
# Sin Docker (requiere Node 22+, PostgreSQL local)
pnpm install
pnpm dev
```

## Notas Técnicas

- El seed incluye datos demo: gimnasio, administrador, plan básico, clientes de prueba.
- Las migraciones se ejecutan automáticamente en el entrypoint del contenedor backend.
- El frontend usa Vite con proxy a `http://backend:3001` en desarrollo.
- El SDK `api-client` se comparte entre frontend y tests.
- Los precios se muestran en Soles (S/) con formato `es-PE` y fallback a `es-US`.
- Compatible con Node 22+ y pnpm 10+.
