from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth_service import login, register

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    body: RegisterRequest, db: AsyncSession = Depends(get_db)
) -> User:
    return await register(db, body.email, body.password)


@router.post("/login", response_model=TokenResponse)
async def login_user(
    body: LoginRequest, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    token = await login(db, body.email, body.password)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
