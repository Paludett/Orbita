import os

# Must be set before any app module is imported so Settings() resolves correctly
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://orbita:changeme_in_production@localhost:5432/orbita_db",
)
os.environ.setdefault(
    "SECRET_KEY", "test-secret-key-for-orbita-testing-purposes-only-32chars"
)
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "15")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
