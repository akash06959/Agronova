import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

try:
    from .db import get_db
    from .models import User
    from .schemas import UserCreate, UserOut, LoginRequest, Token
except ImportError:
    # Fallback for direct execution
    from db import get_db
    from models import User
    from schemas import UserCreate, UserOut, LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["Auth"]) 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))

def hash_password(password: str) -> str:
  return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
  return pwd_context.verify(plain, hashed)

def create_access_token(sub: str) -> str:
  expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
  payload = {"sub": sub, "exp": expire}
  return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
  existing = db.query(User).filter(User.username == data.username).first()
  if existing:
    raise HTTPException(status_code=400, detail="Username already taken")
  user = User(
    username=data.username,
    email=data.email,
    hashed_password=hash_password(data.password)
  )
  db.add(user)
  db.commit()
  db.refresh(user)
  return {"message": "User registered successfully", "username": user.username}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
  user = db.query(User).filter(User.username == data.username).first()
  if not user or not verify_password(data.password, user.hashed_password):
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
  token = create_access_token(sub=str(user.id))
  return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
      "id": user.id,
      "username": user.username,
      "email": user.email,
      "full_name": user.full_name
    }
  } 