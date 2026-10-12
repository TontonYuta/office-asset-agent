"""
Core Configuration Module for Office Asset Agent.
Đồ án 2: Hệ Thống Agent AI Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load biến môi trường từ .env nếu có
load_dotenv()

# Đường dẫn thư mục gốc của project
BASE_DIR = Path(__file__).resolve().parent.parent.parent
SRC_DIR = BASE_DIR / "src"
DATA_DIR = BASE_DIR / "data"
TEMPLATES_DIR = DATA_DIR / "templates"
MOCK_DIR = DATA_DIR / "mock"
DOCS_DIR = BASE_DIR / "docs"

# Đường dẫn Database SQLite
DB_PATH = DATA_DIR / "office_assets.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Phân quyền vai trò hệ thống (RBAC)
ROLE_USER = "user"          # Nhân viên công ty thông thường
ROLE_ADMIN = "admin"        # Cán bộ Quản trị / Quản lý Cơ sở vật chất

# API Keys (Nếu có, hệ thống sẽ gọi LLM cloud; nếu không có, hệ thống tự động fallback sang Rule-based Agent an toàn)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Đảm bảo các thư mục tồn tại
TEMPLATES_DIR.mkdir(parents=True, exist_ok=True)
MOCK_DIR.mkdir(parents=True, exist_ok=True)
