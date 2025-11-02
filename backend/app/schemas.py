from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ParticipantCreate(BaseModel):
    participant_id: Optional[str] = None
    subject_id: str
    study_group: Literal["treatment", "control"]
    enrollment_date: date
    status: Literal["active", "completed", "withdrawn"] = "active"
    age: int = Field(ge=0, le=150)
    gender: Literal["M", "F", "Other"]


class ParticipantResponse(ParticipantCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
