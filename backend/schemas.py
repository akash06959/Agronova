"""
Pydantic Schemas for AgroNova API
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class UserOut(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Order Schemas
class OrderItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int
    image: str

class OrderCreate(BaseModel):
    items: List[Dict[str, Any]]
    total_amount: float
    payment_method: str
    shipping_address: str
    city: str
    state: str
    pincode: str

class OrderOut(BaseModel):
    id: int
    user_id: int
    items: List[Dict[str, Any]]
    total_amount: float
    payment_method: str
    shipping_address: str
    city: str
    state: str
    pincode: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


