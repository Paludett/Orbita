.PHONY: lint lint-frontend lint-backend type-check format format-backend

lint-frontend:
	cd frontend && npm run lint

lint-backend:
	cd backend && ruff check .

type-check:
	cd frontend && npm run type-check

lint: lint-frontend lint-backend type-check

format:
	cd frontend && npm run format

format-backend:
	cd backend && ruff format .
