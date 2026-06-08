from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.core.security import hash_password, verify_password
from app.services.auth_service import login, register


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    db.add = MagicMock()
    return db


def _make_result(value):
    result = MagicMock()
    result.scalar_one_or_none.return_value = value
    return result


class TestRegister:
    async def test_new_user_returns_user_with_hashed_password(self, mock_db):
        mock_db.execute.return_value = _make_result(None)
        password = "SecurePass1"

        user = await register(mock_db, "new@example.com", password)

        assert user.email == "new@example.com"
        assert user.hashed_password != password
        assert verify_password(password, user.hashed_password)

    async def test_duplicate_email_raises_409(self, mock_db):
        mock_db.execute.return_value = _make_result(MagicMock())

        with pytest.raises(HTTPException) as exc:
            await register(mock_db, "existing@example.com", "Password1")

        assert exc.value.status_code == 409

    async def test_password_never_in_returned_object(self, mock_db):
        mock_db.execute.return_value = _make_result(None)
        password = "MySecret1A"

        user = await register(mock_db, "user@example.com", password)

        # SECURITY: plaintext password must not be stored anywhere on the object
        assert user.hashed_password != password
        assert password not in str(user.__dict__.values())


class TestLogin:
    async def test_valid_credentials_returns_token_string(self, mock_db):
        mock_user = MagicMock()
        mock_user.id = "test-uuid"
        mock_user.email = "user@example.com"
        mock_user.hashed_password = hash_password("ValidPass1")
        mock_db.execute.return_value = _make_result(mock_user)

        token = await login(mock_db, "user@example.com", "ValidPass1")

        assert isinstance(token, str)
        assert len(token) > 0

    async def test_nonexistent_email_raises_401(self, mock_db):
        mock_db.execute.return_value = _make_result(None)

        with pytest.raises(HTTPException) as exc:
            await login(mock_db, "ghost@example.com", "ValidPass1")

        assert exc.value.status_code == 401

    async def test_wrong_password_raises_401(self, mock_db):
        mock_user = MagicMock()
        mock_user.hashed_password = hash_password("CorrectPass1")
        mock_db.execute.return_value = _make_result(mock_user)

        with pytest.raises(HTTPException) as exc:
            await login(mock_db, "user@example.com", "WrongPass999")

        assert exc.value.status_code == 401

    async def test_anti_enumeration_identical_error_messages(self, mock_db):
        # nonexistent email
        mock_db.execute.return_value = _make_result(None)
        with pytest.raises(HTTPException) as exc_missing:
            await login(mock_db, "ghost@example.com", "Password1")

        # existing user, wrong password
        mock_user = MagicMock()
        mock_user.hashed_password = hash_password("RightPass1")
        mock_db.execute.return_value = _make_result(mock_user)
        with pytest.raises(HTTPException) as exc_wrong:
            await login(mock_db, "user@example.com", "WrongPass1")

        # SECURITY: byte-identical messages prevent attacker from knowing which field is wrong
        assert exc_missing.value.detail == exc_wrong.value.detail
        assert exc_missing.value.status_code == exc_wrong.value.status_code
