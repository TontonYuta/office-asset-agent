"""
Ticket and Transaction Models.
Đồ án 2: Quản lý yêu cầu mượn thiết bị, phiếu báo hỏng và lịch sử giao dịch xuất/nhập kho.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import Base


class BorrowRequest(Base):
    __tablename__ = "borrow_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    requester_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    purpose = Column(String(255), nullable=True)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)
    status = Column(String(30), default="PENDING")  # 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED'
    approved_by = Column(String(100), nullable=True)
    docx_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset")


class MaintenanceTicket(Base):
    __tablename__ = "maintenance_tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ticket_code = Column(String(50), unique=True, nullable=False, index=True)
    requester_name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    device_name = Column(String(200), nullable=False)
    model = Column(String(100), nullable=True)
    location = Column(String(100), nullable=False)
    symptom = Column(Text, nullable=False)
    error_code = Column(String(50), nullable=True)
    proposed_solution = Column(Text, nullable=True)
    status = Column(String(30), default="PENDING_APPROVAL")  # 'PENDING_APPROVAL', 'APPROVED', 'RESOLVED'
    approved_by = Column(String(100), nullable=True)
    docx_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    transaction_code = Column(String(50), unique=True, nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    transaction_type = Column(String(10), nullable=False)  # 'IN' (Nhập kho), 'OUT' (Xuất kho)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Integer, default=0)
    total_amount = Column(Integer, default=0)
    provider_or_dept = Column(String(100), nullable=True)  # Nhà cung cấp (nếu nhập) hoặc Phòng nhận (nếu xuất)
    status = Column(String(30), default="PENDING")         # 'PENDING' (chờ duyệt), 'APPROVED' (đã duyệt)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    asset = relationship("Asset")
