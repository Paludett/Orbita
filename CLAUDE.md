# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Behavior

### Think Before Coding

Before implementing, state assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask. Push back when a simpler approach exists.

### Simplicity First

Minimum code that solves the problem. No features beyond what was asked, no abstractions for single-use code, no error handling for impossible scenarios. Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### Surgical Changes

Touch only what the request requires. Don't improve adjacent code or formatting. Match existing style. If your changes create orphaned imports/variables/functions, remove them — but don't clean up pre-existing dead code unless asked.

### Goal-Driven Execution

Transform tasks into verifiable goals. For multi-step tasks, state a brief plan with verification steps before starting:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

---

## Stack

- **Backend**: FastAPI + Python 3.12, SQLAlchemy 2 (async), Alembic, PostgreSQL 16
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand, Axios
- **Runtime**: Docker Compose (postgres on 5433, backend on 8000, frontend on 3000)

## Commands

### Backend (run from `backend/`)

```bash
poetry install                        # install deps
uvicorn app.main:app --reload         # dev server (needs .env)
poetry run pytest                     # all tests
poetry run pytest app/tests/test_auth_routes.py  # single test file
poetry run pytest -k "test_name"      # single test by name
poetry run pytest --cov=app           # with coverage
alembic upgrade head                  # run migrations
alembic revision --autogenerate -m "description"  # new migration
```

### Frontend (run from `frontend/`)

```bash
npm run dev          # dev server
npm run build        # production build
npm run type-check   # tsc --noEmit
```

### Lint / Format (from repo root)

```bash
make lint            # ruff + eslint + tsc
make lint-backend    # ruff check .
make format-backend  # ruff format .
make format          # prettier
```

### Docker

```bash
cp .env.example .env   # first time only — set SECRET_KEY
docker compose up --build
```

## Architecture

### Backend layout

```
backend/app/
├── core/       config.py (pydantic-settings from .env), security.py (JWT + bcrypt), deps.py (get_current_user)
├── db/         base.py (DeclarativeBase), session.py (async engine + get_db)
├── models/     SQLAlchemy ORM models (User, Area)
├── schemas/    Pydantic I/O schemas
├── routers/    Thin FastAPI routers — delegate all logic to services
├── services/   Business logic (auth_service, area_service)
└── tests/      pytest-asyncio; route tests use SQLite in-memory via dependency override
```

**Request flow**: router → service → db. Routers only handle HTTP concerns (status codes, schema validation). Services own all logic and raise `HTTPException` directly.

**Auth flow**: `POST /auth/register` → bcrypt hash → store. `POST /auth/login` → verify → `create_access_token` (HS256 JWT, 15 min default). All protected routes use `Depends(get_current_user)` which decodes the Bearer token and fetches the user from DB.

**IDOR prevention**: every service query filters on both `resource_id` AND `user_id`. Never fetch a resource by ID alone.

### Frontend layout

```
frontend/src/    # Next.js app router
```

State: Zustand for client state, TanStack Query for server state. HTTP via Axios.

> **Note**: Read `node_modules/next/dist/docs/` before writing Next.js code — this version may have breaking changes from training data (per `frontend/AGENTS.md`).

### Database

- All PKs are `String` UUIDs generated in Python (`uuid4()`), not DB-generated serials.
- `areas.user_id` FK → `users.id` with `CASCADE` delete.
- Migrations live in `backend/alembic/versions/`. Always use `alembic revision --autogenerate` then review before applying.

### Testing pattern

Route tests spin up an in-memory SQLite DB and override `get_db` via `app.dependency_overrides`. No mocking of services — tests hit real async SQLAlchemy. `asyncio_mode = "auto"` is set globally so no `@pytest.mark.asyncio` needed.

## Environment

Required `.env` vars (see `.env.example`):

| Var | Notes |
|-----|-------|
| `DATABASE_URL` | `postgresql+asyncpg://...` |
| `SECRET_KEY` | min 32 chars |
| `POSTGRES_USER/PASSWORD/DB` | for docker-compose |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | default 15 |
| `FRONTEND_URL` | CORS origin, default `http://localhost:3000` |
