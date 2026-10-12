"""
Deterministic Inventory Calculator & Safe Query Engine.
Đồ án 2: Khắc phục lỗi ảo giác tính nhẩm của LLM (Hallucination Tax - arXiv:2602.12631).
Toàn bộ việc tính toán số lượng tồn kho và nhân chia tiền được giao cho code Python & SQL.
"""

from typing import Dict, Any, List, Optional
from sqlalchemy import func
from src.core.database import SessionLocal
from src.models.asset import Asset
from src.models.ticket import StockTransaction


def search_asset_by_query(query: str) -> Optional[Asset]:
    """
    Tìm kiếm vật tư hoặc thiết bị trong CSDL theo tên, mã hoặc tên gọi đời thường (aliases).
    Ví dụ: 'giấy a4', 'bút dạ xanh', 'máy in 2900', 'canon lbp 2900', 'mic phòng họp'.
    """
    db = SessionLocal()
    try:
        q_lower = query.strip().lower()
        assets = db.query(Asset).all()

        # 1. Khớp chính xác mã sản phẩm hoặc mã code
        for asset in assets:
            if asset.code.lower() == q_lower or (asset.model and asset.model.lower() == q_lower):
                return asset

        # 2. Khớp trong tên đầy đủ
        for asset in assets:
            if q_lower in asset.name.lower() or asset.name.lower() in q_lower:
                return asset

        # 3. Khớp qua danh mục bí danh đời thường (aliases)
        for asset in assets:
            if asset.aliases:
                aliases_list = [a.strip().lower() for a in asset.aliases.split(",")]
                for alias in aliases_list:
                    if alias and (alias in q_lower or q_lower in alias):
                        return asset

        # 4. Khớp từng từ khóa chính (Token match)
        keywords = q_lower.split()
        best_match = None
        max_matches = 0
        for asset in assets:
            searchable_text = f"{asset.name} {asset.code} {asset.model or ''} {asset.aliases or ''}".lower()
            matches = sum(1 for kw in keywords if kw in searchable_text)
            if matches > max_matches and matches >= 2:
                max_matches = matches
                best_match = asset

        return best_match
    finally:
        db.close()


def get_all_assets() -> List[Dict[str, Any]]:
    """Lấy toàn bộ danh mục tài sản và vật tư trong kho."""
    db = SessionLocal()
    try:
        assets = db.query(Asset).all()
        return [
            {
                "id": a.id,
                "code": a.code,
                "name": a.name,
                "category": a.category,
                "model": a.model or "N/A",
                "quantity": a.quantity,
                "unit": a.unit,
                "unit_price": a.unit_price,
                "total_value": a.quantity * a.unit_price,
                "location": a.location,
                "status": a.status,
            }
            for a in assets
        ]
    finally:
        db.close()


def calculate_inventory_metrics() -> Dict[str, Any]:
    """
    Tính toán các chỉ số thống kê kho chính xác 100% bằng SQL Execution.
    """
    db = SessionLocal()
    try:
        total_items = db.query(Asset).count()
        consumables_count = db.query(Asset).filter(Asset.category == "Vật tư tiêu hao").count()
        devices_count = db.query(Asset).filter(Asset.category == "Thiết bị dùng chung").count()

        # Tính tổng giá trị tài sản
        assets = db.query(Asset).all()
        total_valuation = sum(a.quantity * a.unit_price for a in assets)

        # Cảnh báo mặt hàng sắp hết (quantity <= 5 đối với vật tư tiêu hao)
        low_stock_items = [
            {"code": a.code, "name": a.name, "quantity": a.quantity, "unit": a.unit}
            for a in assets if a.category == "Vật tư tiêu hao" and a.quantity <= 10
        ]

        return {
            "total_items": total_items,
            "consumables_count": consumables_count,
            "devices_count": devices_count,
            "total_valuation_vnd": total_valuation,
            "total_valuation_str": f"{total_valuation:,.0f} VNĐ",
            "low_stock_items": low_stock_items,
        }
    finally:
        db.close()


def commit_stock_transaction(
    asset_id: int,
    transaction_type: str,
    quantity: int,
    provider_or_dept: str,
    notes: str = ""
) -> Dict[str, Any]:
    """
    Cập nhật số lượng kho và ghi nhận lịch sử giao dịch.
    Áp dụng Deterministic math: đảm bảo không bao giờ âm kho.
    """
    db = SessionLocal()
    try:
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            return {"success": False, "message": "Không tìm thấy vật tư trong hệ thống."}

        if transaction_type == "OUT" and asset.quantity < quantity:
            return {
                "success": False,
                "message": (
                    f"Kho không đủ hàng xuất! Hiện chỉ còn {asset.quantity} {asset.unit}, "
                    f"nhưng yêu cầu xuất {quantity} {asset.unit}."
                )
            }

        prev_qty = asset.quantity
        if transaction_type == "IN":
            asset.quantity += quantity
        elif transaction_type == "OUT":
            asset.quantity -= quantity

        import uuid
        tx_code = f"TX-{uuid.uuid4().hex[:8].upper()}"
        total_amount = quantity * asset.unit_price

        tx = StockTransaction(
            transaction_code=tx_code,
            asset_id=asset.id,
            transaction_type=transaction_type,
            quantity=quantity,
            unit_price=asset.unit_price,
            total_amount=total_amount,
            provider_or_dept=provider_or_dept,
            status="APPROVED",
            notes=notes,
        )
        db.add(tx)
        db.commit()

        return {
            "success": True,
            "transaction_code": tx_code,
            "asset_name": asset.name,
            "prev_quantity": prev_qty,
            "new_quantity": asset.quantity,
            "unit": asset.unit,
            "total_amount": total_amount,
            "message": (
                f"Đã cập nhật kho thành công: {asset.name} "
                f"({prev_qty} -> {asset.quantity} {asset.unit})."
            )
        }
    finally:
        db.close()
