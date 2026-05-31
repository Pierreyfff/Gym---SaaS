# 🏋️ GymSaaS — Plataforma de Gestión Deportiva

<img width="800" height="599" alt="image" src="https://github.com/user-attachments/assets/8106885c-e5d3-470a-b026-71106f7ebdcf" />

SaaS completo para gestión de un gym, con múltiples roles, funciones por cargo y marketplace.

---

## 📦 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS (dark mode), shadcn/ui, Recharts, Zustand, React Router v6 |
| **Backend** | NestJS, Prisma ORM, PostgreSQL, JWT (access + refresh rotation), Helmet, Throttler |
| **SDK** | Cliente API tipado con Axios e interceptors (refresh automático) |
| **Infra** | Docker Compose (multi-stage build), Nginx (proxy reverso + SPA), Turborepo |

---

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone <repo-url>
cd gym-saas

# Copiar y configurar variables de entorno
cp .env.example .env

# Iniciar con Docker
docker compose up -d

# La aplicación estará disponible en:
# - Frontend: http://localhost
# - Backend API: http://localhost:3000/api
```

## 🔑 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|-----------|
| **Administrador** | admin@gymdemo.com | admin123 |
| **Recepcionista** | recepcionista@gymdemo.com | recepcionista123 |
| **Entrenador** | entrenador@gymdemo.com | entrenador123 |
| **Cliente** | cliente@gymdemo.com | cliente123 |

## Características

- Gestión de usuarios, roles y permisos
- Dashboard administrativo con estadísticas y gráficos
- Gestión de membresías, pagos y asistencias
- Marketplace / tienda de productos deportivos
- Web pública con planes, galería, testimonios y contacto
- Modo oscuro nativo
- Dockerizado con persistencia de datos y backups automáticos

## Roles y permisos

- **Administrador**: Gestión total de la plataforma.

  <img width="800" height="599" alt="image" src="https://github.com/user-attachments/assets/c8a114f5-a16b-4bb8-8898-cce87dab7b7e" />

- **Recepcionista**: Registro de clientes, asistencias, pagos y ventas.
- **Entrenador**: Gestión de clientes y seguimiento de asistencias.
- **Cliente**: Acceso a su perfil, membresía y compras en el marketplace.

## Marketplace

Plataforma para la compra y venta de productos relacionados con el deporte y el fitness.

<img width="800" height="599" alt="marketplace" src="https://github.com/user-attachments/assets/936c2c87-a460-4d0f-9e23-343db5c92ec6" />

## Tecnologías

- TypeScript
- React 19 + Vite + TailwindCSS
- NestJS + Prisma ORM
- PostgreSQL
- Docker

## Estructura del proyecto

```
gym-saas/
├── packages/
│   ├── backend/       # API REST (NestJS)
│   ├── web/           # Frontend (React + Vite)
│   ├── shared/        # Tipos y DTOs compartidos
│   ├── api-client/    # SDK cliente tipado
│   └── database/      # Schema de Prisma
├── docker/            # Dockerfiles y configs
├── scripts/           # Scripts de backup y utilidades
└── docker-compose.yml
```

## Contacto

Para más información, contacta a pierreborjas7@gmail.com