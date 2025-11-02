from datetime import datetime
from uuid import uuid4

from passlib.hash import bcrypt

from .extensions import db


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    full_name = db.Column(db.String(255))
    password_hash = db.Column(db.String(255), nullable=True)

    def set_password(self, password: str) -> None:
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password: str) -> bool:
        return bcrypt.verify(password, self.password_hash)


class Participant(TimestampMixin, db.Model):
    __tablename__ = "participants"

    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(
        db.String(36), unique=True, nullable=False, default=lambda: str(uuid4())
    )
    subject_id = db.Column(db.String(50), unique=True, nullable=False)
    study_group = db.Column(db.String(32), nullable=False)
    enrollment_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(32), nullable=False, default="active")
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(16), nullable=False)
