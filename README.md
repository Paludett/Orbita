# Orbita

Open-source personal organizer — tasks, notes, and areas of focus in one place.

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS          |
| Backend  | FastAPI · Python 3.12 · SQLAlchemy 2 · Alembic  |
| Database | PostgreSQL 16                                   |
| Runtime  | Docker Compose                                  |

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 with Compose v2
- [Node.js](https://nodejs.org/) ≥ 20 (for local frontend dev)
- [Python](https://python.org/) ≥ 3.12 + [Poetry](https://python-poetry.org/) ≥ 1.8 (for local backend dev)

## Running with Docker Compose

```bash
cp .env.example .env
# Edit .env — at minimum set a strong SECRET_KEY (see comment inside)

docker compose up --build
```

Services:
- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API docs → http://localhost:8000/docs

## Running the backend locally (without Docker)

```bash
cd backend
poetry install
cp ../.env.example .env   # adjust DATABASE_URL to point to your local Postgres
uvicorn app.main:app --reload
```

## Running tests

```bash
cd backend
poetry run pytest --cov=app
```

## Running database migrations

```bash
# Inside the backend container or locally with Poetry
alembic upgrade head
```

## Project structure

```
orbita/
├── frontend/          # Next.js 14 app
├── backend/
│   ├── app/
│   │   ├── core/      # config, security helpers
│   │   ├── db/        # SQLAlchemy engine, session, Base
│   │   ├── models/    # ORM models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── routers/   # FastAPI routers
│   │   └── tests/
│   └── alembic/       # migration scripts
├── docker-compose.yml
└── .env.example
```

## License

[MIT](LICENSE)
