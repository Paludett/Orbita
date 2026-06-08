import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.base import Base
from app.db.session import get_db
from app.main import app

VALID_PASSWORD = "StrongPass1"
EMAIL_A = "note_user_a@orbita.com"
EMAIL_B = "note_user_b@orbita.com"

VALID_AREA = {"name": "Work", "color": "#6C63FF", "icon": "briefcase", "order": 0}
VALID_NOTE = {"title": "My Note", "content": "<p>Hello world</p>"}


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


async def _create_area(client, headers) -> str:
    resp = await client.post("/areas", json=VALID_AREA, headers=headers)
    return resp.json()["id"]


class TestNotesAuth:
    async def test_list_notes_without_token_returns_401(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)

        resp = await client.get(f"/areas/{area_id}/notes")
        assert resp.status_code == 401

    async def test_list_notes_for_other_user_area_returns_404(self, client):
        headers_a = await _auth_headers(client, email=EMAIL_A)
        headers_b = await _auth_headers(client, email=EMAIL_B)
        area_id = await _create_area(client, headers_a)

        resp = await client.get(f"/areas/{area_id}/notes", headers=headers_b)
        assert resp.status_code == 404


class TestCreateNote:
    async def test_create_note_returns_201_with_content(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)

        resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )

        assert resp.status_code == 201
        body = resp.json()
        assert body["title"] == "My Note"
        assert body["content"] == "<p>Hello world</p>"
        assert body["area_id"] == area_id

    async def test_create_note_empty_title_returns_422(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)

        resp = await client.post(
            f"/areas/{area_id}/notes",
            json={"title": "", "content": ""},
            headers=headers,
        )
        assert resp.status_code == 422


class TestListNotes:
    async def test_list_notes_does_not_include_content_field(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)
        await client.post(f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers)

        resp = await client.get(f"/areas/{area_id}/notes", headers=headers)
        assert resp.status_code == 200
        items = resp.json()
        assert len(items) == 1
        assert "content" not in items[0]
        assert "title" in items[0]
        assert "updated_at" in items[0]


class TestGetNote:
    async def test_get_note_returns_full_detail_with_content(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)
        create_resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )
        note_id = create_resp.json()["id"]

        resp = await client.get(f"/areas/{area_id}/notes/{note_id}", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert body["content"] == "<p>Hello world</p>"


class TestUpdateNote:
    async def test_patch_title_preserves_content(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)
        create_resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )
        note_id = create_resp.json()["id"]

        resp = await client.patch(
            f"/areas/{area_id}/notes/{note_id}",
            json={"title": "New Title"},
            headers=headers,
        )
        assert resp.status_code == 200
        body = resp.json()
        assert body["title"] == "New Title"
        assert body["content"] == "<p>Hello world</p>"


class TestDeleteNote:
    async def test_delete_note_returns_204(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)
        create_resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )
        note_id = create_resp.json()["id"]

        resp = await client.delete(f"/areas/{area_id}/notes/{note_id}", headers=headers)
        assert resp.status_code == 204

    async def test_get_after_delete_returns_404(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)
        create_resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )
        note_id = create_resp.json()["id"]

        await client.delete(f"/areas/{area_id}/notes/{note_id}", headers=headers)
        resp = await client.get(f"/areas/{area_id}/notes/{note_id}", headers=headers)
        assert resp.status_code == 404


class TestCascadeDelete:
    async def test_delete_area_cascades_tasks_and_notes(self, client):
        headers = await _auth_headers(client)
        area_id = await _create_area(client, headers)

        task_resp = await client.post(
            f"/areas/{area_id}/tasks",
            json={"title": "Task to cascade", "order": 0},
            headers=headers,
        )
        note_resp = await client.post(
            f"/areas/{area_id}/notes", json=VALID_NOTE, headers=headers
        )
        assert task_resp.status_code == 201
        assert note_resp.status_code == 201

        del_resp = await client.delete(f"/areas/{area_id}", headers=headers)
        assert del_resp.status_code == 204

        area_resp = await client.get(f"/areas/{area_id}", headers=headers)
        assert area_resp.status_code == 404
