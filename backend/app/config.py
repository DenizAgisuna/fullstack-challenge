import os
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATHS = [
    BASE_DIR / '.env',
    BASE_DIR / '.env.local',
    BASE_DIR.parent / '.env',
]
for path in ENV_PATHS:
    if path.exists():
        load_dotenv(path, override=False)

@dataclass
class Config:
    SQLALCHEMY_DATABASE_URI: str = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'replace-me')
    JWT_SECRET_KEY: str = os.getenv('JWT_SECRET_KEY', 'replace-me-jwt')
    JWT_ACCESS_TOKEN_EXPIRES: int = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', '3600'))

def get_config() -> 'Config':
    return Config()

