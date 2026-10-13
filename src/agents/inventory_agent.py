"""
Inventory Management & Deterministic Calculation Agent.
Đồ án 2: 
- Tra cứu tồn kho chính xác bằng code Python/SQL, loại bỏ ảo giác tính nhẩm (Hallucination Tax - arXiv:2602.12631).
- Tích hợp bộ nhớ AIM-RM & Safe-Stock thẩm định cấp phát (Supply Chain Agent - arXiv:2602.05524).
"""

import re
from typing import Dict, Any, Optional
from src.core.config import ROLE_ADMIN
from src.tools.sql_calculator import (
    search_asset_by_query,
    search_asset_with_diagnostics,
    calculate_inventory_metrics,
    get_all_assets,
)
from src.tools.doc_generator import generate_inventory_chart
from src.tools.inventory_memory import evaluate_allocation_request


def handle_inventory_query(
    user_message: str,
    user_role: str = "user",
    department: str = "Phòng Ban Chức Năng"
) -> Dict[str, Any]:
    """
    Phân tích câu hỏi tự nhiên về kho vật tư, tính toán chính xác 100% bằng SQL
    và thẩm định định mức tồn kho an toàn bằng AIM-RM.
    """
    msg_lower = user_message.lower()

    # 1. Yêu cầu thẩm định đơn xin cấp phát vật tư (AIM-RM Safe-Stock & Memory Retrieval)
    allocation_keywords = ["xin cấp", "xin xuất", "cấp phát", "thẩm định", "định mức an toàn", "safe stock", "dự trù"]
    if any(k in msg_lower for k in allocation_keywords) and not ("còn bao nhiêu" in msg_lower):
        # Trích xuất số lượng số học từ câu nói (VD: "xin cấp 50 ram", "cấp phát 20 hộp")
        qty_match = re.search(r"(\d+)", user_message)
        requested_qty = int(qty_match.group(1)) if qty_match else 15

        eval_res = evaluate_allocation_request(
            department=department,
            item_query=user_message,
            requested_qty=requested_qty
        )

        if eval_res["status"] == "success":
            episodes_text = ""
            for ep in eval_res["similar_episodes"]:
                episodes_text += (
                    f"  * Kỳ {ep.get('notes', 'Giao dịch')}: đã cấp `{ep['quantity']}` "
                    f"(Độ tương đồng kịch bản: {ep['similarity_score']*100:.1f}%)\n"
                )

            response_text = (
                f"🧠 **[AIM-RM Memory Retrieval & Safe-Stock Audit]**\n\n"
                f"* **Vật tư thẩm định:** {eval_res['asset_name']} (`{eval_res['asset_code']}`)\n"
                f"* **Đơn vị xin cấp:** {department} | **Số lượng yêu cầu:** `{eval_res['requested_qty']} {eval_res['unit']}`\n"
                f"* **Tồn kho hiện tại:** `{eval_res['current_onhand']} {eval_res['unit']}` | **Dự kiến sau cấp:** `{eval_res['projected_stock_after']} {eval_res['unit']}`\n"
                f"* **Định mức tồn kho an toàn ($S_{{safe}}$):** `{eval_res['safe_stock_benchmark']} {eval_res['unit']}`\n"
                f"* **Mức tiêu thụ trung bình lịch sử ($\\\\mu \\\\pm \\\\sigma$):** `{eval_res['historical_mean']} \\\\pm {eval_res['historical_std']} {eval_res['unit']}`\n\n"
                f"📜 **Kịch bản tương đồng trong bộ nhớ lịch sử (Top Similar Episodes):**\n"
                f"{episodes_text}\n"
                f"⚖️ **Khuyến nghị của Hệ thống:**\n"
                f"{eval_res['recommendation']}"
            )
            return {
                "status": "allocation_evaluation",
                "data": eval_res,
                "response": response_text
            }

    # 2. Yêu cầu vẽ biểu đồ thống kê
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

    # 3. Yêu cầu xem tổng giá trị kho / chi phí (Admin only)
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

    # 4. Yêu cầu xem danh sách cảnh báo sắp hết hàng
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

    # 5. Yêu cầu tra cứu mặt hàng cụ thể (VD: "giấy a4", "bút dạ", "mực in", "máy chiếu")
    diag = search_asset_with_diagnostics(user_message)
    matched_asset = diag.get("asset")

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

    # 6. Trường hợp người dùng hỏi đích danh Model mà phòng ban không có (Model Mismatch)
    if diag.get("status") == "model_mismatch":
        queried_model = diag.get("queried_model", "yêu cầu")
        cat = diag.get("detected_category", "thiết bị")
        alt_items = diag.get("alternatives", [])
        alt_text = ""
        if alt_items:
            alt_lines = []
            for a in alt_items:
                alt_lines.append(
                    f"- **{a.name}** (`{a.code}`):\n"
                    f"  • Tồn kho: `{a.quantity} {a.unit}` | Tình trạng: `{a.status}`\n"
                    f"  • Vị trí: `{a.location}`"
                )
            alt_text = f"\n\n📌 **Các dòng {cat} hiện có sẵn trong phòng ban:**\n" + "\n".join(alt_lines)

        response_text = (
            f"❌ **Không tìm thấy model '{queried_model}' trong danh mục {cat} của phòng ban.**"
            f"{alt_text}\n\n"
            f"💡 **Gợi ý xử lý:**\n"
            f"1. Nếu phòng ban mới mua thêm dòng máy này: bạn có thể yêu cầu *'Tìm tài liệu model {queried_model}'* để Agent tự cào tài liệu lưu vào CSDL.\n"
            f"2. Hoặc liên hệ Cán bộ Quản trị (Admin) để cập nhật model này vào danh mục quản lý kho."
        )
        return {
            "status": "model_mismatch",
            "queried_model": queried_model,
            "response": response_text
        }

    # 7. Nếu không khớp món cụ thể, trả về danh mục tổng quát rõ ràng
    all_items = get_all_assets()
    item_list = ", ".join([f"**{a['name']}** (còn {a['quantity']} {a['unit']})" for a in all_items[:4]])
    return {
        "status": "not_found",
        "response": (
            f"📦 **Thông báo tra cứu kho:**\n\n"
            f"Hệ thống hiện **chưa có** thông tin vật tư/thiết bị khớp với yêu cầu `{user_message.strip()}` "
            f"trong danh mục quản lý kho của phòng ban.\n\n"
            f"📋 **Một số mặt hàng phổ biến đang có sẵn:**\n- {item_list}...\n\n"
            f"💡 Bạn có thể tra cứu theo từ khóa như: *'giấy a4'*, *'bút dạ'*, *'máy in 2900'*, *'máy chiếu epson'*."
        )
    }
