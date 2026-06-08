from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User

# SECURITY: identical message for both failure cases prevents user enumeration
_INVALID_CREDENTIALS = "Invalid email or password"


async def register(db: AsyncSession, email: str, password: str) -> User:
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    # SECURITY: generic 409 — does not confirm whether the email is already registered
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    # SECURITY: hash before any DB operation; plaintext password never persisted
    hashed = hash_password(password)
    user = User(email=email, hashed_password=hashed)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def login(db: AsyncSession, email: str, password: str) -> str:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    # SECURITY: same branch for "user not found" and "wrong password" — anti-enumeration
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=_INVALID_CREDENTIALS,
        )
    return create_access_token({"sub": user.id, "email": user.email})
