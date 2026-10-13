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


import re


def extract_model_identifiers(text: str) -> List[str]:
    """
    Trích xuất các mã số/ký hiệu định danh model từ chuỗi văn bản.
    Ví dụ: '3300', '2900', '12A', 'EB-X06', 'M404dn', 'WGV-201', 'WB-03'.
    """
    tokens = []
    # 1. Các số hiệu 3-5 chữ số (VD: 3300, 2900, 1020, 201)
    pure_nums = re.findall(r"\b\d{3,5}\b", text)
    tokens.extend(pure_nums)

    # 2. Các mã chữ-số kết hợp (VD: 12A, M404dn, EB-X06, WGV-201, WB-03, E91, FX-9)
    alphanums = re.findall(r"\b[A-Za-z0-9]+[\-][A-Za-z0-9]+\b|\b\d+[A-Za-z]+\b|\b[A-Za-z]+\d+[A-Za-z0-9]*\b", text)
    common_words = {"máy", "kho", "con", "co", "trong", "phong", "khong", "phòng", "không", "chiếc", "bộ", "ram", "hộp"}
    for tok in alphanums:
        t_low = tok.lower()
        if t_low not in common_words and (any(c.isdigit() for c in tok) or "-" in tok):
            tokens.append(t_low)

    return list(dict.fromkeys(tokens))


def search_asset_with_diagnostics(query: str) -> Dict[str, Any]:
    """
    Tìm kiếm vật tư hoặc thiết bị trong CSDL kèm chẩn đoán không khớp model (Must-Match Model Token).
    Ngăn chặn việc nhận vơ model (False Positive Match) ví dụ Canon 3300 -> Canon 2900.
    """
    db = SessionLocal()
    try:
        q_lower = query.strip().lower()
        assets = db.query(Asset).all()

        # 1. Khớp chính xác mã sản phẩm hoặc mã code
        for asset in assets:
            if asset.code.lower() == q_lower or (asset.model and asset.model.lower() == q_lower):
                return {"status": "exact_match", "asset": asset, "queried_model": None, "alternatives": []}

        # 2. Khớp trong tên đầy đủ
        for asset in assets:
            if asset.name.lower() == q_lower:
                return {"status": "exact_match", "asset": asset, "queried_model": None, "alternatives": []}

        # 3. Trích xuất Model Identifier từ câu hỏi của người dùng
        queried_model_tokens = extract_model_identifiers(q_lower)

        # Nhận diện danh mục thiết bị từ câu hỏi
        category_detected = None
        if any(w in q_lower for w in ["máy in", "may in", "printer"]):
            category_detected = "máy in"
        elif any(w in q_lower for w in ["máy chiếu", "may chieu", "projector"]):
            category_detected = "máy chiếu"
        elif any(w in q_lower for w in ["micro", "mic", "loa"]):
            category_detected = "micro"
        elif any(w in q_lower for w in ["mực", "muc", "cartridge"]):
            category_detected = "mực in"
        elif any(w in q_lower for w in ["giấy", "giay", "a4", "ram"]):
            category_detected = "giấy in"

        # Nếu có model token (ví dụ: "3300", "2900")
        if queried_model_tokens:
            for token in queried_model_tokens:
                matched_asset = None
                for asset in assets:
                    searchable = f"{asset.name} {asset.code} {asset.model or ''} {asset.aliases or ''}".lower()
                    if token in searchable:
                        matched_asset = asset
                        break
                if matched_asset:
                    return {"status": "model_token_match", "asset": matched_asset, "queried_model": token, "alternatives": []}
                else:
                    # Token này KHÔNG thuộc bất kỳ asset nào trong kho! (Ví dụ: "3300")
                    alternatives = []
                    for asset in assets:
                        searchable = f"{asset.name} {asset.category} {asset.aliases or ''}".lower()
                        if category_detected and category_detected in searchable:
                            if category_detected == "máy in" and ("mực" in asset.name.lower() or asset.category == "Vật tư tiêu hao"):
                                continue
                            alternatives.append(asset)
                    return {
                        "status": "model_mismatch",
                        "asset": None,
                        "queried_model": token,
                        "detected_category": category_detected or "thiết bị",
                        "alternatives": alternatives
                    }

        # 4. Khớp qua danh mục bí danh đời thường (aliases) khi không có model conflict
        for asset in assets:
            if asset.aliases:
                aliases_list = [a.strip().lower() for a in asset.aliases.split(",")]
                for alias in aliases_list:
                    if alias and (alias == q_lower or f" {alias} " in f" {q_lower} "):
                        return {"status": "alias_match", "asset": asset, "queried_model": None, "alternatives": []}

        # 5. Khớp qua tên (nếu query chứa tên hoặc tên chứa query)
        for asset in assets:
            if asset.name.lower() in q_lower or q_lower in asset.name.lower():
                return {"status": "name_match", "asset": asset, "queried_model": None, "alternatives": []}

        # 6. Khớp qua alias dạng substring nếu là cụm từ rõ nghĩa
        for asset in assets:
            if asset.aliases:
                aliases_list = [a.strip().lower() for a in asset.aliases.split(",")]
                for alias in aliases_list:
                    if alias and alias in q_lower:
                        return {"status": "alias_match", "asset": asset, "queried_model": None, "alternatives": []}

        # 7. Khớp từ khóa (Token match)
        keywords = [w for w in q_lower.split() if len(w) > 1 and w not in ["kho", "còn", "không", "có", "phòng", "cho", "mình", "bao", "nhiêu"]]
        best_match = None
        max_matches = 0
        for asset in assets:
            searchable_text = f"{asset.name} {asset.code} {asset.model or ''} {asset.aliases or ''}".lower()
            matches = sum(1 for kw in keywords if kw in searchable_text)
            if matches > max_matches and matches >= 2:
                max_matches = matches
                best_match = asset

        if best_match:
            return {"status": "token_match", "asset": best_match, "queried_model": None, "alternatives": []}

        # 8. Không tìm thấy
        alternatives = []
        if category_detected:
            alternatives = [a for a in assets if category_detected in f"{a.name} {a.aliases or ''}".lower()]

        return {
            "status": "not_found",
            "asset": None,
            "queried_model": None,
            "detected_category": category_detected,
            "alternatives": alternatives
        }
    finally:
        db.close()


def search_asset_by_query(query: str) -> Optional[Asset]:
    """
    Tìm kiếm vật tư hoặc thiết bị trong CSDL theo tên, mã hoặc tên gọi đời thường (aliases).
    Trả về None nếu không tìm thấy hoặc người dùng chỉ định model khác với model trong kho.
    """
    diag = search_asset_with_diagnostics(query)
    return diag.get("asset")


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
