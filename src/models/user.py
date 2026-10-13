"""
User Model and Authentication Schemas.
Đồ án 2: Quản lý người dùng và vai trò phân quyền.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from src.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="user")  # 'user' hoặc 'admin'
    password_hash = Column(String(128), nullable=True)  # Mật khẩu băm an toàn
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"
