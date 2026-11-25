# ONT Provisioning

API monolítica para el aprovisionamiento de ONTs GPON. Permite autenticar técnicos, consultar perfiles, descubrir ONTs y solicitar su autorización mediante una OLT simulada.

## Tecnologías

- JavaScript ES modules, Node.js 22 y Express.
- PostgreSQL 16, Drizzle ORM y `pg`.
- Zod, JWT, bcryptjs, Helmet, CORS y express-rate-limit.
- Vitest para pruebas unitarias.
- Interfaz React/PWA servida por Nginx.
- Docker Compose.

## Arquitectura

```text
src/
├── presentation/   rutas, controladores y middleware
├── application/    casos de uso y validación
├── domain/         reglas de seriales y modelo ONT
├── persistence/    base de datos, repositorios y adaptador OLT
├── app.js
└── server.js
tests/
frontend/
```

Flujo: presentación → aplicación → dominio/persistencia → PostgreSQL u OLT.

## Ejecutar con Docker

Requisitos: Docker Desktop con Docker Compose v2. Configura en el `.env` de la raíz `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET` (mínimo 32 caracteres), `CORS_ORIGINS`, `SEED_TECH_USER` y `SEED_TECH_PASSWORD`. No sobrescribas ni compartas un `.env` existente.

Desde PowerShell, en la raíz:

```powershell
docker compose up --build -d
docker compose ps
```

Aplicación: `http://localhost:8080`  
Health: `http://localhost:8080/api/health`

Para detener los servicios sin borrar la base de datos:

```powershell
docker compose down
```

## API

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/health` | Público |
| `POST` | `/api/auth/login` | Público; devuelve JWT |
| `GET` | `/api/provisioning/service-profiles` | Bearer JWT |
| `POST` | `/api/provisioning/discover` | Bearer JWT |
| `POST` | `/api/provisioning/authorize` | Bearer JWT |

Envíe el token en `Authorization: Bearer <token>`. Para probar, los seriales `HWTC1A2B3C4D` y `HWTC0F0F0F0F` simulan respectivamente una señal aceptable y una señal débil.

## Pruebas

Desde la raíz del proyecto:

```powershell
npm ci
npm test
```

Vitest ejecuta seis pruebas unitarias; no requiere PostgreSQL ni una OLT real.

## Alcance actual

La OLT es simulada. La orden de trabajo es opcional; el flujo de swap, la OT obligatoria del día y la auditoría inmutable aún no están implementados. El backend sirve la API; el frontend compilado es opcional para probarla.
