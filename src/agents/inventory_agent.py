"""
Inventory Management & Deterministic Calculation Agent.
Đồ án 2: Tra cứu tồn kho chính xác bằng code Python/SQL, loại bỏ ảo giác tính nhẩm.
"""

from typing import Dict, Any
from src.core.config import ROLE_ADMIN
from src.tools.sql_calculator import (
    search_asset_by_query,
    calculate_inventory_metrics,
    get_all_assets,
)
from src.tools.doc_generator import generate_inventory_chart


def handle_inventory_query(user_message: str, user_role: str = "user") -> Dict[str, Any]:
    """
    Phân tích câu hỏi tự nhiên về kho vật tư và trả lời số liệu chính xác 100%.
    """
    msg_lower = user_message.lower()

    # 1. Yêu cầu vẽ biểu đồ thống kê
    if "biểu đồ" in msg_lower or "chart" in msg_lower or "đồ thị" in msg_lower:
        if user_role != ROLE_ADMIN:
            return {
                "status": "permission_denied",
                "response": "🚫 Chức năng xem và xuất biểu đồ quản trị kho yêu cầu quyền Cán bộ Quản lý (Admin)."
            }
        chart_path = generate_inventory_chart()
        metrics = calculate_inventory_metrics()
        return {
            "status": "chart_generated",
            "chart_path": chart_path,
            "response": (
                f"📊 **Biểu đồ thống kê kho đã được khởi tạo thành công!**\n\n"
                f"- Tổng số danh mục quản lý: **{metrics['total_items']} mặt hàng**\n"
                f"- Tổng định giá tài sản kho: **{metrics['total_valuation_str']}**\n"
                f"- Mặt hàng vật tư tiêu hao: **{metrics['consumables_count']}** | Thiết bị dùng chung: **{metrics['devices_count']}**"
            )
        }

    # 2. Yêu cầu xem tổng giá trị kho / chi phí (Admin only)
    if "tổng giá trị" in msg_lower or "tổng tiền" in msg_lower or "định giá" in msg_lower or "chi phí" in msg_lower:
        if user_role != ROLE_ADMIN:
            return {
                "status": "permission_denied",
                "response": "🚫 Thông tin tổng giá trị tài chính kho chỉ dành cho Cán bộ Quản lý (Admin)."
            }
        metrics = calculate_inventory_metrics()
        return {
            "status": "metrics",
            "response": (
                f"💰 **Báo cáo định giá tài sản kho phòng ban:**\n\n"
                f"* **Tổng giá trị hiện tại:** `{metrics['total_valuation_str']}`\n"
                f"* **Số lượng mặt hàng:** {metrics['total_items']} danh mục\n"
                f"* **Cảnh báo tồn kho thấp:** {len(metrics['low_stock_items'])} mặt hàng cần dự trù bổ sung."
            )
        }

    # 3. Yêu cầu xem danh sách cảnh báo sắp hết hàng
    if "sắp hết" in msg_lower or "hết hàng" in msg_lower or "cần nhập" in msg_lower or "cảnh báo" in msg_lower:
        metrics = calculate_inventory_metrics()
        low_items = metrics["low_stock_items"]
        if not low_items:
            return {"status": "low_stock", "response": "✅ Hiện tại tất cả vật tư trong kho đều ở mức an toàn!"}

        items_str = "\n".join([f"- **{i['name']}** ({i['code']}): còn `{i['quantity']} {i['unit']}`" for i in low_items])
        return {
            "status": "low_stock",
            "response": f"⚠️ **Cảnh báo các mặt hàng có số lượng tồn kho thấp (cần nhập thêm):**\n\n{items_str}"
        }

    # 4. Yêu cầu tra cứu mặt hàng cụ thể (VD: "giấy a4", "bút dạ", "mực in", "máy chiếu")
    matched_asset = search_asset_by_query(user_message)
    if matched_asset:
        val_vnd = matched_asset.quantity * matched_asset.unit_price
        response_text = (
            f"📦 **Kết quả tra cứu CSDL kho:**\n\n"
            f"* **Tên mặt hàng:** {matched_asset.name}\n"
            f"* **Mã quản lý:** `{matched_asset.code}`\n"
            f"* **Phân loại:** {matched_asset.category}\n"
            f"* **Số lượng tồn kho:** `{matched_asset.quantity} {matched_asset.unit}`\n"
            f"* **Vị trí lưu kho:** {matched_asset.location}\n"
            f"* **Tình trạng:** {matched_asset.status}\n"
            f"* **Đặc tính kỹ thuật:** {matched_asset.specs or 'Chuẩn văn phòng'}"
        )
        if user_role == ROLE_ADMIN:
            response_text += f"\n* **Đơn giá:** {matched_asset.unit_price:,.0f} VNĐ | **Thành tiền:** {val_vnd:,.0f} VNĐ"

        return {
            "status": "asset_found",
            "asset_id": matched_asset.id,
            "asset_name": matched_asset.name,
            "quantity": matched_asset.quantity,
            "unit": matched_asset.unit,
            "response": response_text
        }

    # 5. Nếu không khớp món cụ thể, trả về danh mục tổng quát
    all_items = get_all_assets()
    item_list = ", ".join([a["name"] for a in all_items[:5]])
    return {
        "status": "not_found",
        "response": (
            f"Tôi chưa tìm thấy vật tư khớp với yêu cầu của bạn. "
            f"Một số mặt hàng phổ biến trong kho hiện có: {item_list}... "
            f"Bạn có thể tra cứu theo từ khóa như: 'giấy a4', 'bút dạ', 'mực 2900', 'máy chiếu epson'."
        )
    }
