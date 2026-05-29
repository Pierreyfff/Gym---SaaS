# 🏋️ GymSaaS — Plataforma de Gestión Deportiva

Sistema SaaS modular para administración de gimnasios. Gestión completa de membresías, ventas, asistencias, pagos, productos, inventario, reportes y web pública. Arquitectura monorepo con backend NestJS + frontend React, desplegable con Docker.

---

## 📦 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Recharts, Zustand, React Router v6 |
| **Backend** | NestJS, Prisma ORM, PostgreSQL, JWT (access + refresh rotation), Helmet, Throttler |
| **SDK** | Cliente API tipado con Axios e interceptors (refresh automático) |
| **Infra** | Docker Compose (multi-stage build), Nginx (proxy reverso + SPA), Turborepo |

---

## 📁 Estructura del Proyecto

```
gym-saas/
├── packages/
│   ├── backend/                # API REST (NestJS)
│   │   └── src/
│   │       ├── application/
│   │       │   └── use-cases/  # Lógica de negocio (casos de uso)
│   │       │       ├── auth/         # Login, registro, refresh
│   │       │       ├── clientes/     # CRUD, perfil completo, duplicados
│   │       │       ├── membresias/   # Asignación, renovación, cambio
│   │       │       ├── pagos/        # Registro, reembolsos
│   │       │       ├── asistencias/  # Check-in diario
│   │       │       ├── productos/    # CRUD, stock, inventario
│   │       │       ├── ventas/       # Venta de productos con envío
│   │       │       ├── planes/       # Planes de membresía
│   │       │       ├── usuarios/     # CRUD de usuarios del sistema
│   │       │       ├── dashboard/    # Reportes y estadísticas
│   │       │       ├── staff/        # Perfiles del equipo
│   │       │       ├── testimonios/  # Reseñas de clientes
│   │       │       ├── galeria/      # Galería de imágenes
│   │       │       └── horarios/     # Horarios de empleados
│   │       ├── domain/
│   │       │   ├── entities/        # Entidades de dominio (UserEntity, PerfilClienteEntity, etc.)
│   │       │   ├── repositories/    # Interfaces de repositorios
│   │       │   └── services/        # Interfaces de servicios (IJwtService, etc.)
│   │       ├── infrastructure/
│   │       │   ├── database/        # PrismaService
│   │       │   ├── repositories/    # Implementaciones Prisma
│   │       │   ├── modules/         # Módulos NestJS por feature
│   │       │   ├── guards/          # JWT guard, roles guard
│   │       │   ├── strategies/      # JWT strategy
│   │       │   ├── decorators/      # @Public, @Roles
│   │       │   └── services/        # JWT service, Email service
│   │       └── interface/
│   │           └── controllers/     # REST controllers
│   ├── web/                    # Frontend SPA (React + Vite)
│   │   └── src/
│   │       ├── pages/               # Páginas agrupadas por dominio
│   │       │   ├── auth/            # Login, registro
│   │       │   ├── public/          # Home, nosotros, planes, galería, tienda, checkout
│   │       │   ├── dashboard/       # Dashboard admin con gráficos
│   │       │   ├── clientes/        # CRUD, perfil, dashboard cliente, compras
│   │       │   ├── recepcionista/   # Dashboard recepcionista
│   │       │   ├── entrenador/      # Dashboard entrenador
│   │       │   ├── usuarios/        # Gestión de usuarios del sistema
│   │       │   ├── planes/          # Planes de membresía
│   │       │   ├── membresias/      # Membresías, renovación
│   │       │   ├── pagos/           # Pagos y reembolsos
│   │       │   ├── asistencias/     # Check-in diario
│   │       │   ├── productos/       # Productos, categorías
│   │       │   ├── ventas/          # Ventas de productos
│   │       │   ├── inscripciones/   # Wizard de inscripción
│   │       │   ├── configuracion/   # Configuración del gimnasio
│   │       │   ├── staff/           # Staff del equipo
│   │       │   ├── testimonios/     # Testimonios
│   │       │   ├── galeria/         # Galería de imágenes
│   │       │   ├── horarios/        # Horarios de empleados
│   │       │   └── ingresos/        # Reportes de ingresos
│   │       ├── components/          # Componentes reutilizables
│   │       │   ├── ui/              # shadcn/ui (botones, inputs, cards, modales, etc.)
│   │       │   ├── layouts/         # Layouts (admin, público)
│   │       │   ├── shared/          # ErrorBoundary, Toaster, etc.
│   │       │   └── auth/            # ProtectedRoute
│   │       ├── lib/
│   │       │   ├── stores/          # Zustand stores (auth, cart, theme)
│   │       │   ├── api/             # Instancia del API client
│   │       │   ├── providers/       # React Query provider
│   │       │   └── utils/           # Utilidades (cn, format, etc.)
│   │       └── hooks/               # Custom hooks (useToast, etc.)
│   ├── api-client/              # SDK tipado para consumir la API
│   │   └── src/
│   │       ├── clients/             # Client classes por dominio (auth, clientes, planes, etc.)
│   │       ├── config/              # Axios config con interceptors
│   │       └── index.ts             # GymSaasApiClient class
│   ├── shared/                  # DTOs y tipos compartidos
│   │   └── src/
│   │       ├── dtos/               # DTOs de validación (class-validator)
│   │       ├── types/              # Tipos TypeScript
│   │       └── utils/              # Utilidades compartidas
│   └── database/                # Prisma schema y migraciones
│       └── prisma/
│           ├── schema.prisma       # Modelo de datos completo
│           ├── seed.ts             # Seed con datos demo
│           └── fix-profiles.ts     # Script para reparar perfiles faltantes
├── docker/
│   ├── backend.Dockerfile      # Multi-stage build para backend
│   ├── web.Dockerfile          # Multi-stage build para frontend (Node → Nginx)
│   ├── nginx-web.conf          # Config de Nginx (SPA + proxy reverso /api/)
│   └── entrypoint.sh           # Entrypoint con migraciones + seed automáticos
├── scripts/                    # Scripts de utilidad
├── docker-compose.yml          # Orquestación completa (postgres + backend + web)
├── turbo.json                  # Configuración Turborepo
├── pnpm-workspace.yaml         # Workspace pnpm (packages/*)
└── .env.docker                 # Variables de entorno para Docker
```

---

## 🗄️ Modelo de Datos (Prisma — PostgreSQL)

| Modelo | Descripción |
|--------|-------------|
| **Gimnasio** | Tenant multi-inquilino (slug único) |
| **Usuario** | Autenticación y roles: `admin`, `recepcionista`, `entrenador`, `cliente` |
| **PerfilCliente** | Datos extendidos del cliente (relación 1:1 con Usuario) |
| **Plan** | Planes de membresía (nombre, duración, precio) |
| **Membresia** | Asignación de plan a cliente (fechas, estado: activa/expirada/cancelada) |
| **Pago** | Pagos de membresías y productos (monto, método, estado, reembolso) |
| **Asistencia** | Check-in diario por cliente |
| **CategoriaProducto** | Categorías de productos del gym |
| **Producto** | Productos con control de stock mínimo |
| **VentaProducto** | Ventas de productos (con envío a domicilio o retiro en tienda) |
| **MovimientoInventario** | Historial de movimientos de inventario |
| **EntrenadorCliente** | Relación entrenador-cliente |
| **Rutina / Ejercicio** | Rutinas de entrenamiento con ejercicios |
| **ConfiguracionGimnasio** | Configuración visual, horarios, contacto, políticas |
| **Staff** | Perfiles del equipo para web pública |
| **Testimonio** | Reseñas de clientes para web pública |
| **ImagenGaleria** | Imágenes del gimnasio para web pública |
| **HorarioEmpleado** | Horarios semanales por empleado |

---

## 🧱 Arquitectura por Capas (Backend)

```
┌─────────────────────────────────────────────────────────┐
│                    Controllers (REST)                    │
│   Reciben requests, delegan a Use Cases                 │
├─────────────────────────────────────────────────────────┤
│                   Use Cases (Application)                │
│   Lógica de negocio, orquestación, validaciones         │
├─────────────────────────────────────────────────────────┤
│              Domain Entities & Interfaces                │
│   Entidades puras, interfaces de repositorios/servicios │
├─────────────────────────────────────────────────────────┤
│        Infrastructure (Prisma, Guards, JWT, etc.)       │
│   Implementaciones concretas, DB, auth, email           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Seguridad

| Medida | Detalle |
|--------|---------|
| **Helmet** | Headers de seguridad HTTP (CSP, XSS, clickjacking, etc.) |
| **Rate Limiting** | 60 requests/minuto por IP vía `@nestjs/throttler` |
| **JWT con refresh rotation** | Access token 15min, refresh token 7d con rotación automática |
| **Roles y Guards** | `@Roles('admin', 'recepcionista')` — control granular por endpoint |
| **Self-data isolation** | Clientes solo ven sus propios datos (perfil, compras, membresía) |
| **CORS restrictivo** | Solo orígenes permitidos explícitamente |
| **Validación global** | DTOs con class-validator, whitelist, transform |
| **Secrets** | `.env.*` en `.gitignore`, no trackeados |
| **Contraseñas** | Hash con bcryptjs (10 rondas) |
| **Cross-tab logout** | Sincronización de sesión entre pestañas via `storage` event |

---

## 👥 Roles y Accesos

| Rol | Rutas | Credenciales Demo |
|-----|-------|-------------------|
| **Administrador** | Todo el sistema | `admin@gymdemo.com` / `admin123` |
| **Recepcionista** | Clientes, membresías, pagos, asistencias, productos, ventas | — |
| **Entrenador** | Clientes (vista), asistencias | — |
| **Cliente** | Dashboard propio, perfil, compras, membresía | Registro público |

---

## ✨ Funcionalidades Principales

### Gestión
- Autenticación JWT con refresh token rotation y sincronización entre pestañas
- Dashboard ejecutivo con gráficos (ingresos, asistencias, distribución membresías, top productos)
- CRUD completo de clientes, planes, membresías, productos, categorías, usuarios, staff
- Inscripción wizard (cliente + membresía + pago en un solo flujo)
- Control de stock con alertas visuales (sin stock / stock bajo)
- Reembolso de pagos con motivo y registro
- Cambio y renovación de membresías
- Detección de posibles clientes duplicados (mismo nombre+apellido+teléfono)
- Auto-creación de perfiles de cliente faltantes (transaccional y consistente)
- Validación de email único por gimnasio

### Ventas y Productos
- Tienda pública con carrito lateral (Sheet) y lista de favoritos
- Checkout de productos integrado con el carrito
- Envío a domicilio con tracking de estados (pendiente → preparando → enviado → entregado / cancelado)
- Retiro en tienda como opción de entrega sin costo
- Historial de compras del cliente

### Web Pública
- Página de inicio (hero, carrusel, planes, testimonios, galería)
- Páginas: Nosotros, Planes, Galería, Tienda, Contacto
- SEO-friendly (meta description, Open Graph)
- Staff del equipo con redes sociales

### Reportes
- Ingresos detallados con filtros por rango de fechas
- Productos más vendidos
- Exportación a Excel y PDF
- Asistencias mensuales (gráfico últimos 6 meses)

### Extras
- Modo oscuro / claro con persistencia en localStorage
- Tema visual configurable desde panel de administración (colores primario/secundario)
- Precios en Soles (S/) con formato localizado
- Gestión de horarios semanales por empleado
- Galería de imágenes con orden personalizado
- Testimonios con calificación de estrellas

---

## 🚀 Inicio Rápido (Docker)

### Prerrequisitos
- Docker Desktop (Windows/Mac) o Docker Engine + Compose (Linux)
- Git

### 1. Clonar
```bash
git clone https://github.com/Pierreyfff/Gym---SaaS.git
cd Gym---SaaS
```

### 2. Iniciar
```bash
docker compose up -d --build
```

Esto construye las imágenes y levanta:
| Servicio | URL | Puerto |
|----------|-----|--------|
| **PostgreSQL** | `localhost:5432` | `gymsaas` / `gymsaas_secret_2024` |
| **Backend API** | `http://localhost:3000/api` | 3000 |
| **Frontend Web** | `http://localhost` | 80 |

La primera ejecución ejecuta migraciones y seed automáticamente (poblado con datos demo).

### 3. Acceder
- **Frontend:** http://localhost
- **Admin:** `admin@gymdemo.com` / `admin123`
- **API:** http://localhost:3000/api (o via proxy: http://localhost/api)

---

## 🔧 Comandos Docker

```bash
# Construir imágenes y levantar
docker compose up -d --build

# Iniciar servicios existentes
docker compose up -d

# Reconstruir solo un servicio
docker compose build backend
docker compose build web

# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs backend -f --tail 50

# Detener servicios
docker compose down

# Detener y eliminar volúmenes (borra BD)
docker compose down -v

# Ver tamaño de imágenes
docker image ls gym-saas-*
```

---

## 💻 Desarrollo Local (sin Docker)

### Prerrequisitos
- Node.js 22+
- pnpm 9+ (`npm install -g pnpm@9`)
- PostgreSQL 16+ corriendo localmente

### Configurar

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.docker .env
# Editar DATABASE_URL para tu PostgreSQL local

# 3. Generar Prisma Client
pnpm --filter @gym-saas/database generate

# 4. Ejecutar migraciones y seed
pnpm --filter @gym-saas/database push
pnpm --filter @gym-saas/database seed

# 5. Iniciar en modo desarrollo
pnpm dev
```

Esto inicia:
- **Backend** en http://localhost:3000 (hot-reload con NestJS watch)
- **Frontend** en http://localhost:5173 (hot-reload con Vite)

Si el frontend no conecta, asegurate que `packages/web/.env.local` tenga:
```
VITE_API_URL=http://localhost:3000/api
```

---

## 🐳 Multi-stage Build

Las imágenes Docker usan multi-stage build para optimizar tamaño:

| Servicio | Build | Producción | Tamaño aprox |
|----------|-------|------------|-------------|
| **Backend** | `node:22-slim` → compila TS → `dist/` | Solo runtime + prod deps | ~400 MB |
| **Web** | `node:22-alpine` → `vite build` | `nginx:1.27-alpine` con static files | ~30 MB |

---

## 📦 Paquetes del Monorepo

| Paquete | Path | Descripción |
|---------|------|-------------|
| `@gym-saas/backend` | `packages/backend` | API REST NestJS |
| `web` | `packages/web` | Frontend React SPA |
| `@gym-saas/api-client` | `packages/api-client` | SDK cliente API |
| `@gym-saas/shared` | `packages/shared` | DTOs y tipos compartidos |
| `@gym-saas/database` | `packages/database` | Prisma client + schema |

---

## 🧪 Scripts Útiles

```bash
# Migraciones (Prisma)
pnpm --filter @gym-saas/database generate   # Regenerar Prisma Client
pnpm --filter @gym-saas/database push       # Sincronizar schema con BD
pnpm --filter @gym-saas/database seed       # Poblar datos demo
pnpm --filter @gym-saas/database studio     # Abrir Prisma Studio (GUI BD)

# Fix de perfiles faltantes
pnpm --filter @gym-saas/database fix-profiles

# Compilar TypeScript
pnpm --filter @gym-saas/shared build
pnpm --filter @gym-saas/api-client build
pnpm --filter @gym-saas/backend build
pnpm --filter web build

# Lint
pnpm lint
```

---

## 🛣️ API Endpoints Principales

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registro de cliente (autoservicio) |
| POST | `/api/auth/refresh` | Refrescar tokens |
| GET | `/api/auth/me` | Obtener usuario actual |
| PATCH | `/api/auth/change-password` | Cambiar contraseña |

### Clientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/clientes` | Listar clientes (admin/recep/entrenador) |
| GET | `/api/clientes/:id` | Obtener cliente |
| GET | `/api/clientes/:id/perfil-completo` | Perfil completo + membresías + pagos + asistencias + compras |
| POST | `/api/clientes` | Crear cliente (admin/recep) |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente (admin) |

### Públicas (sin autenticación)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/public/configuracion` | Configuración del gimnasio |
| GET | `/api/public/planes` | Planes disponibles |
| GET | `/api/public/productos` | Productos en tienda |
| GET | `/api/public/staff` | Equipo del gimnasio |
| GET | `/api/public/testimonios` | Testimonios |
| GET | `/api/public/galeria` | Galería de imágenes |

---

## 📋 Modelo de Permisos (Roles)

| Recurso | admin | recepcionista | entrenador | cliente |
|---------|-------|---------------|------------|---------|
| Usuarios | CRUD | - | - | - |
| Clientes | CRUD | CRUD | Lectura | Solo propio |
| Planes | CRUD | - | - | - |
| Membresías | CRUD | CRUD | - | Solo propia |
| Pagos | CRUD | CRUD | - | Solo propios |
| Asistencias | CRUD | CRUD | CRUD | Solo propias |
| Productos | CRUD | CRUD | - | - |
| Ventas | CRUD | CRUD | - | Solo propias |
| Dashboard | Full | - | - | Cliente |
| Configuración | CRUD | - | - | - |
| Staff | CRUD | - | - | - |
| Testimonios | CRUD | - | - | - |
| Galería | CRUD | - | - | - |
| Horarios | CRUD | - | - | - |

---

## 📝 Notas Técnicas

- El seed incluye datos demo: gimnasio, administrador, planes, clientes de prueba con membresías, pagos y asistencias
- Las migraciones se ejecutan automáticamente en el entrypoint del contenedor backend (`prisma db push`)
- El frontend sirve build estático via Nginx con proxy reverso `/api/` al backend (evita CORS)
- El SDK `api-client` se comparte entre frontend y backend (mismos tipos)
- Los precios se muestran en Soles (S/) con formato `es-PE` y fallback a `es-US`
- Compatible con Node 22+ y pnpm 9+
- Perfiles de cliente se crean automáticamente si faltan (repositorio transaccional)
- Las sesiones persisten en localStorage bajo la clave `gym-saas-auth`
