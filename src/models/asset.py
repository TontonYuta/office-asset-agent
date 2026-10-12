"""
Asset and Knowledge Base Models.
Đồ án 2: Quản lý danh mục vật tư, thiết bị và cẩm nang kỹ thuật theo Model.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from src.core.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)  # 'Vật tư tiêu hao' hoặc 'Thiết bị dùng chung'
    model = Column(String(100), nullable=True, index=True)  # Mã model thiết bị chính hãng
    quantity = Column(Integer, default=0, nullable=False)
    unit = Column(String(20), nullable=False)      # Ram, Hộp, Chiếc, Bộ, v.v.
    unit_price = Column(Integer, default=0)         # Đơn giá (VNĐ)
    location = Column(String(100), default="Kho Tầng 1")
    status = Column(String(50), default="Sẵn sàng")  # 'Sẵn sàng', 'Đang mượn', 'Bảo trì', 'Hết hàng'
    aliases = Column(String(255), nullable=True)   # Tên gọi đời thường để AI map chính xác
    specs = Column(String(500), nullable=True)     # Thông số kỹ thuật tóm tắt
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Asset(code='{self.code}', name='{self.name}', qty={self.quantity} {self.unit})>"


class KnowledgeDoc(Base):
    __tablename__ = "knowledge_docs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(100), unique=True, nullable=False, index=True)
    device_type = Column(String(50), nullable=False)  # Máy in, Máy chiếu, Micro...
    title = Column(String(200), nullable=False)
    manual_text = Column(Text, nullable=False)       # Hướng dẫn sử dụng
    troubleshooting_guide = Column(Text, nullable=False)  # Bảng chẩn đoán & cách sửa lỗi
    source_url = Column(String(255), default="Nội bộ / Web Scraper")
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<KnowledgeDoc(model='{self.model_name}', title='{self.title}')>"
