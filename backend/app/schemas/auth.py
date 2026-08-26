from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    remember: bool = True


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    createdAt: str


class AuthResponse(BaseModel):
    success: bool = True
    token: str
    tokenType: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(min_length=1, max_length=128)
    newPassword: str = Field(min_length=6, max_length=128)


class AuthErrorDetail(BaseModel):
    code: str
    message: str


class AuthErrorResponse(BaseModel):
    success: bool = False
    error: AuthErrorDetail
