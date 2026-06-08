import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

VALID_PASSWORD = "StrongPass1"
EMAIL_A = "user_a@orbita.com"
EMAIL_B = "user_b@orbita.com"

VALID_AREA = {"name": "Work", "color": "#6C63FF", "icon": "briefcase", "order": 0}


@pytest.fixture
async def client():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_test_session = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with async_test_session() as session:
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


async def _register(client, email=EMAIL_A, password=VALID_PASSWORD):
    return await client.post(
        "/auth/register", json={"email": email, "password": password}
    )


async def _login(client, email=EMAIL_A, password=VALID_PASSWORD):
    resp = await client.post("/auth/login", json={"email": email, "password": password})
    return resp.json()["access_token"]


async def _auth_headers(client, email=EMAIL_A):
    await _register(client, email=email)
    token = await _login(client, email=email)
    return {"Authorization": f"Bearer {token}"}


class TestAreasAuth:
    async def test_list_areas_without_token_returns_401(self, client):
        resp = await client.get("/areas")
        assert resp.status_code == 401

    async def test_create_area_without_token_returns_401(self, client):
        resp = await client.post("/areas", json=VALID_AREA)
        assert resp.status_code == 401


class TestListAreas:
    async def test_list_areas_empty_initially(self, client):
        headers = await _auth_headers(client)
        resp = await client.get("/areas", headers=headers)

        assert resp.status_code == 200
        assert resp.json() == []

    async def test_list_areas_returns_only_own_areas(self, client):
        headers_a = await _auth_headers(client, email=EMAIL_A)
        headers_b = await _auth_headers(client, email=EMAIL_B)

        await client.post("/areas", json=VALID_AREA, headers=headers_a)
        await client.post(
            "/areas", json={**VALID_AREA, "name": "B Area"}, headers=headers_b
        )

        resp_a = await client.get("/areas", headers=headers_a)
        assert len(resp_a.json()) == 1
        assert resp_a.json()[0]["name"] == "Work"


class TestCreateArea:
    async def test_create_area_returns_201(self, client):
        headers = await _auth_headers(client)
        resp = await client.post("/areas", json=VALID_AREA, headers=headers)

        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Work"
        assert body["color"] == "#6C63FF"
        assert body["icon"] == "briefcase"
        assert "id" in body
        assert "user_id" in body

    async def test_create_area_invalid_color_returns_422(self, client):
        headers = await _auth_headers(client)
        resp = await client.post(
            "/areas",
            json={**VALID_AREA, "color": "red"},
            headers=headers,
        )
        assert resp.status_code == 422

    async def test_create_area_empty_name_returns_422(self, client):
        headers = await _auth_headers(client)
        resp = await client.post(
            "/areas",
            json={**VALID_AREA, "name": ""},
            headers=headers,
        )
        assert resp.status_code == 422


class TestGetArea:
    async def test_get_own_area_returns_200(self, client):
        headers = await _auth_headers(client)
        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers)
        area_id = create_resp.json()["id"]

        resp = await client.get(f"/areas/{area_id}", headers=headers)
        assert resp.status_code == 200
        assert resp.json()["id"] == area_id

    async def test_cannot_access_other_user_area(self, client):
        headers_a = await _auth_headers(client, email=EMAIL_A)
        headers_b = await _auth_headers(client, email=EMAIL_B)

        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers_a)
        area_id_a = create_resp.json()["id"]

        # user_b tries to access user_a's area — must 404, not 403
        resp = await client.get(f"/areas/{area_id_a}", headers=headers_b)
        assert resp.status_code == 404

    async def test_nonexistent_area_returns_404(self, client):
        headers = await _auth_headers(client)
        resp = await client.get("/areas/nonexistent-id", headers=headers)
        assert resp.status_code == 404


class TestUpdateArea:
    async def test_patch_name_keeps_other_fields(self, client):
        headers = await _auth_headers(client)
        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers)
        area_id = create_resp.json()["id"]

        resp = await client.patch(
            f"/areas/{area_id}",
            json={"name": "Updated Name"},
            headers=headers,
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["name"] == "Updated Name"
        assert body["color"] == VALID_AREA["color"]
        assert body["icon"] == VALID_AREA["icon"]
        assert body["order"] == VALID_AREA["order"]

    async def test_cannot_patch_other_user_area(self, client):
        headers_a = await _auth_headers(client, email=EMAIL_A)
        headers_b = await _auth_headers(client, email=EMAIL_B)

        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers_a)
        area_id_a = create_resp.json()["id"]

        resp = await client.patch(
            f"/areas/{area_id_a}",
            json={"name": "Hijacked"},
            headers=headers_b,
        )
        assert resp.status_code == 404


class TestDeleteArea:
    async def test_delete_area_returns_204(self, client):
        headers = await _auth_headers(client)
        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers)
        area_id = create_resp.json()["id"]

        resp = await client.delete(f"/areas/{area_id}", headers=headers)
        assert resp.status_code == 204

    async def test_get_after_delete_returns_404(self, client):
        headers = await _auth_headers(client)
        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers)
        area_id = create_resp.json()["id"]

        await client.delete(f"/areas/{area_id}", headers=headers)
        resp = await client.get(f"/areas/{area_id}", headers=headers)
        assert resp.status_code == 404

    async def test_cannot_delete_other_user_area(self, client):
        headers_a = await _auth_headers(client, email=EMAIL_A)
        headers_b = await _auth_headers(client, email=EMAIL_B)

        create_resp = await client.post("/areas", json=VALID_AREA, headers=headers_a)
        area_id_a = create_resp.json()["id"]

        resp = await client.delete(f"/areas/{area_id_a}", headers=headers_b)
        assert resp.status_code == 404
