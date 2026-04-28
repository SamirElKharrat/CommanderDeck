from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    user_name: str
    email: EmailStr
    image: Optional[str] = ""

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    user_name: Optional[str] = None
    image: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserOut(UserBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
