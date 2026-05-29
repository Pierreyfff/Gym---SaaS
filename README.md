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
├── docker/               # Dockerfiles (multi-stage build) y config de infra
├── scripts/              # Scripts de utilidad
├── docker-compose.yml    # Orquestación completa
└── turbo.json            # Configuración Turborepo
```

## Stack Tecnológico

| Capa        | Tecnología                                                  |
|-------------|-------------------------------------------------------------|
| Frontend    | React 19, Vite, TypeScript, TailwindCSS, Recharts, Zustand  |
| Backend     | NestJS, Prisma ORM, PostgreSQL, JWT, Helmet, Throttler      |
| Infra       | Docker Compose (multi-stage build), Nginx, Turborepo        |
| SDK         | Cliente API tipado auto-generado con Axios                  |

## Modelo de Datos

- **Usuarios** — autenticación y roles (admin, recepcionista, entrenador, cliente)
- **Clientes** — perfil, datos personales, historial
- **Planes** — precios, duración, características
- **Membresías** — asignación de plan a cliente con control de vigencia
- **Pagos** — registro, métodos de pago y reembolsos
- **Asistencias** — check-in diario por cliente
- **Productos** — inventario con control de stock mínimo
- **Ventas** — venta de productos con items y cálculo automático, con opciones de **envío a domicilio** (tracking de estado: pendiente → preparando → enviado → entregado / cancelado) y **retiro en tienda**
- **Reportes** — ingresos detallados, diarios, productos más vendidos
- **Staff** — perfiles del equipo para web pública
- **Testimonios** — reseñas de clientes para web pública
- **Galería** — imágenes del gimnasio para web pública
- **Horarios de Empleados** — gestión de horarios semanales por empleado (admin/recepcionista)

## Seguridad

- **Helmet** — headers de seguridad HTTP (CSP, XSS, clickjacking, etc.)
- **Rate limiting** — 60 requests/minuto por IP vía `@nestjs/throttler`
- **JWT con refresh token rotation** — access token 15min, refresh token 7d con rotación
- **Roles y guards** — control de acceso por rol (admin, recepcionista, entrenador, cliente)
- **Self-data isolation** — clientes solo ven sus propios datos (perfil, compras)
- **CORS restrictivo** — solo orígenes permitidos explícitamente
- **Validación global** — DTOs validados con whitelist y transform
- **Secrets no trackeados** — `.env.*` en `.gitignore`

## Roles y Accesos

| Rol            | Credenciales                     |
|----------------|----------------------------------|
| Administrador  | `admin@gymdemo.com` / `admin123` |

**Frontend público** (tienda, planes, registro): accesible sin autenticación.  
**Dashboard admin**: gestión completa de clientes, membresías, pagos, productos, usuarios, asistencias, reportes, configuración, galería, testimonios, staff y horarios de empleados.  
**Perfil cliente autoservicio**: ver/editar perfil, historial de compras, membresía activa.

## Funcionalidades Principales

- Autenticación JWT con refresh token rotation
- Dashboard ejecutivo con gráficos (ingresos, asistencias, distribución de membresías, top productos)
- CRUD completo de clientes, planes, membresías, productos, categorías, usuarios, staff, testimonios, galería
- Inscripción wizard (cliente + membresía + pago en un flujo)
- Tienda pública con carrito lateral (Sheet) y lista de favoritos, persistencia con Zustand
- Checkout de productos integrado con el carrito
- Control de stock con alertas visuales (sin stock / stock bajo)
- Reembolso de pagos con motivo y registro
- Cambio y renovación de membresías
- Envío a domicilio con tracking de estados (pendiente → preparando → enviado → entregado / cancelado)
- Retiro en tienda como opción de entrega sin costo
- Gestión de horarios semanales por empleado
- Sincronización de sesión entre pestañas
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
docker compose up -d --build
```

Esto construye imágenes (multi-stage build) y levanta:
- **PostgreSQL** en `localhost:5432`
- **Backend API** en `http://localhost:3000`
- **Frontend Web** en `http://localhost:80`

La primera ejecución ejecuta migraciones y seed automáticamente (poblado con datos demo).

### 4. Acceder

| Servicio  | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost              |
| API       | http://localhost:3000/api    |
| Admin     | admin@gymdemo.com / admin123 |

## Comandos Docker

```bash
# Construir imágenes y levantar
docker compose up -d --build

# Iniciar servicios existentes
docker compose up -d

# Reconstruir solo un servicio
docker compose build backend
docker compose build web

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Eliminar volúmenes (borra BD, respaldar primero)
docker compose down -v

# Ver tamaño de imágenes
docker image ls gym-saas-*
```

## Desarrollo

```bash
# Sin Docker (requiere Node 22+, PostgreSQL local)
pnpm install
pnpm dev
```

## Docker - Multi-stage Build

Las imágenes usan multi-stage build para minimizar tamaño:

| Servicio | Base image | Tiempo compilación | Producción |
|----------|-----------|-------------------|------------|
| Backend  | `node:22-slim` | Compila TS → `dist/` | Solo runtime + prod deps |
| Web      | `node:22-alpine` (build) → `nginx:1.27-alpine` | Build Vite | Static files via Nginx |

## Notas Técnicas

- El seed incluye datos demo: gimnasio, administrador, plan básico, clientes de prueba.
- Las migraciones se ejecutan automáticamente en el entrypoint del contenedor backend.
- El frontend sirve build estático via Nginx con proxy reverso `/api/` al backend.
- El SDK `api-client` se comparte entre frontend y backend.
- Los precios se muestran en Soles (S/) con formato `es-PE` y fallback a `es-US`.
- Compatible con Node 22+ y pnpm 10+.
