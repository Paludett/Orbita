import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

VALID_PASSWORD = "StrongPass1"
VALID_EMAIL = "test@orbita.com"


@pytest.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    AsyncTestSession = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with AsyncTestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


async def _register(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return await client.post(
        "/auth/register", json={"email": email, "password": password}
    )


async def _login(client, email=VALID_EMAIL, password=VALID_PASSWORD):
    return await client.post(
        "/auth/login", json={"email": email, "password": password}
    )


class TestRegisterRoute:
    async def test_register_returns_201_with_user_fields(self, client):
        resp = await _register(client)

        assert resp.status_code == 201
        body = resp.json()
        assert "id" in body
        assert body["email"] == VALID_EMAIL
        assert "created_at" in body

    async def test_register_response_has_no_password_field(self, client):
        resp = await _register(client)

        body = resp.json()
        assert "password" not in body
        assert "hashed_password" not in body

    async def test_register_duplicate_email_returns_409(self, client):
        await _register(client)
        resp = await _register(client)

        assert resp.status_code == 409

    async def test_register_weak_password_no_uppercase_returns_422(self, client):
        resp = await client.post(
            "/auth/register", json={"email": VALID_EMAIL, "password": "abcdef1g"}
        )
        assert resp.status_code == 422

    async def test_register_weak_password_no_digit_returns_422(self, client):
        resp = await client.post(
            "/auth/register", json={"email": VALID_EMAIL, "password": "Abcdefgh"}
        )
        assert resp.status_code == 422


class TestLoginRoute:
    async def test_login_valid_credentials_returns_200_with_token(self, client):
        await _register(client)
        resp = await _login(client)

        assert resp.status_code == 200
        body = resp.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"

    async def test_login_wrong_password_returns_401(self, client):
        await _register(client)
        resp = await _login(client, password="WrongPass999")

        assert resp.status_code == 401

    async def test_login_nonexistent_email_returns_401(self, client):
        resp = await _login(client, email="ghost@orbita.com")

        assert resp.status_code == 401

    async def test_anti_enumeration_same_error_body(self, client):
        await _register(client)

        # wrong password for existing user
        resp_wrong = await _login(client, password="WrongPass999")
        # nonexistent email
        resp_missing = await _login(client, email="nobody@orbita.com")

        # SECURITY: response bodies must be byte-identical to prevent user enumeration
        assert resp_wrong.json() == resp_missing.json()


class TestAuthGuard:
    async def test_get_me_with_valid_token_returns_200(self, client):
        await _register(client)
        login_resp = await _login(client)
        token = login_resp.json()["access_token"]

        resp = await client.get(
            "/auth/me", headers={"Authorization": f"Bearer {token}"}
        )

        assert resp.status_code == 200
        assert resp.json()["email"] == VALID_EMAIL

    async def test_get_me_without_token_returns_401(self, client):
        resp = await client.get("/auth/me")

        assert resp.status_code == 401

    async def test_get_me_with_invalid_token_returns_401(self, client):
        resp = await client.get(
            "/auth/me", headers={"Authorization": "Bearer invalidtoken"}
        )

        assert resp.status_code == 401
