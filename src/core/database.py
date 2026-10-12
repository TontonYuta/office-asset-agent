"""
Database Engine and Session Management Module.
Đồ án 2: Kết nối SQLite và quản lý phiên làm việc SQLAlchemy.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import DATABASE_URL

# Tạo SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # Cho phép SQLite hoạt động với multi-threading trong Streamlit
    echo=False
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho toàn bộ ORM Models
Base = declarative_base()


def get_db():
    """Hàm yield database session phục vụ dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
