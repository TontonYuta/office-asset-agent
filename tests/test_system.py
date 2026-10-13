"""
Comprehensive Test Suite for Office Asset Agent.
Đồ án 2: Kiểm thử tự động từ A-Z đảm bảo 100% chức năng hoạt động hoàn hảo.
"""

import os
from pathlib import Path
import pytest

from src.core.config import ROLE_USER, ROLE_ADMIN, TEMPLATES_DIR
from src.core.security import has_permission, check_role_access, PERMISSION_OCR_RESTOCK, PERMISSION_VIEW_INVENTORY
from src.core.init_db import init_database
from src.core.database import SessionLocal
from src.models.asset import Asset, KnowledgeDoc
from src.models.ticket import MaintenanceTicket
from src.tools.sql_calculator import (
    search_asset_by_query,
    get_all_assets,
    calculate_inventory_metrics,
    commit_stock_transaction,
)
from src.tools.doc_generator import generate_maintenance_ticket_docx, generate_inventory_chart
from src.tools.web_search import enrich_and_cache_knowledge
from src.tools.vision_ocr import parse_delivery_receipt
from src.tools.inventory_memory import (
    compute_dynamic_safe_stock,
    retrieve_similar_episodes,
    evaluate_allocation_request
)
from src.agents.orchestrator import process_user_request


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Khởi tạo database và dữ liệu mẫu trước khi chạy test."""
    init_database()
    yield
    # Tự động dọn dẹp các tệp docx sinh ra trong quá trình test
    for f in TEMPLATES_DIR.glob("Phieu_Bao_Hong_*.docx"):
        try:
            f.unlink()
        except Exception:
            pass


def test_rbac_security():
    """Kiểm tra ma trận phân quyền RBAC giữa User và Admin."""
    assert has_permission(ROLE_USER, PERMISSION_VIEW_INVENTORY) is True
    assert has_permission(ROLE_USER, PERMISSION_OCR_RESTOCK) is False

    assert has_permission(ROLE_ADMIN, PERMISSION_VIEW_INVENTORY) is True
    assert has_permission(ROLE_ADMIN, PERMISSION_OCR_RESTOCK) is True

    denied = check_role_access(ROLE_USER, PERMISSION_OCR_RESTOCK)
    assert denied["allowed"] is False
    assert "Từ chối truy cập" in denied["message"]


def test_deterministic_sql_calculator():
    """Kiểm tra tính toán số học chuẩn xác bằng code/SQL (chống hallucination)."""
    # 1. Tìm kiếm theo bí danh đời thường 'giấy a4'
    asset = search_asset_by_query("giấy a4")
    assert asset is not None
    assert "Double A" in asset.name
    assert asset.quantity > 0

    # 2. Tìm kiếm theo model máy 'Canon LBP 2900'
    printer = search_asset_by_query("Canon LBP 2900")
    assert printer is not None
    assert "Canon" in printer.name

    # 3. Tính toán metrics tổng
    metrics = calculate_inventory_metrics()
    assert metrics["total_items"] > 0
    assert metrics["total_valuation_vnd"] > 0
    assert "VNĐ" in metrics["total_valuation_str"]

    # 4. Kiểm tra cập nhật kho không được âm
    fail_res = commit_stock_transaction(
        asset_id=asset.id,
        transaction_type="OUT",
        quantity=999999,
        provider_or_dept="Test Dept"
    )
    assert fail_res["success"] is False
    assert "không đủ hàng xuất" in fail_res["message"]


def test_document_and_chart_generation(tmp_path):
    """Kiểm tra việc tự động tạo file Word .docx và vẽ biểu đồ Matplotlib."""
    # 1. Tạo file Word Phiếu Báo Hỏng
    ticket_sample = {
        "ticket_code": "TEST-SC-001",
        "requester_name": "Trần Huy Hoàng",
        "department": "Phòng Hành chính - Quản trị",
        "device_name": "Máy chiếu Epson EB-X06",
        "location": "Phòng họp số 3",
        "symptom": "No Signal test",
        "proposed_solution": "Thay cáp HDMI test",
        "status": "CHỜ DUYỆT"
    }
    docx_file = generate_maintenance_ticket_docx(ticket_sample)
    assert Path(docx_file).exists()
    assert Path(docx_file).stat().st_size > 0

    # 2. Vẽ biểu đồ tồn kho
    chart_file = str(tmp_path / "test_chart.png")
    out_chart = generate_inventory_chart(chart_file)
    assert Path(out_chart).exists()
    assert Path(out_chart).stat().st_size > 0


def test_web_search_enrichment():
    """Kiểm tra cơ chế làm giàu tri thức thiết bị (Self-Enriching)."""
    res = enrich_and_cache_knowledge("Canon LBP 2900")
    assert res["status"] in ["cached", "newly_enriched"]
    assert "Canon" in res["model_name"]
    assert len(res["troubleshooting_guide"]) > 0


def test_vision_ocr():
    """Kiểm tra bóc tách hóa đơn giao hàng, kiểm tra Bounding Box và đối soát CSDL thật."""
    ocr_res = parse_delivery_receipt(None)
    assert ocr_res["status"] == "success"
    assert len(ocr_res["items"]) >= 3
    assert ocr_res["total_amount"] > 0
    # Kiểm tra Bounding Box chuẩn hóa và đối soát CSDL
    for item in ocr_res["items"]:
        assert "target_id" in item
        assert item["target_id"] is not None
        assert len(item["bbox"]) == 4
        assert item["confidence"] >= 0.90


def test_aim_rm_safe_stock_and_memory():
    """Kiểm tra mô hình AIM-RM: Safe-Stock toán học và Episodic Memory Retrieval."""
    # 1. Kiểm tra công thức Safe-Stock: S_safe = z * sigma * sqrt(L+1)
    # Với z=1.645, sigma=10, L=1 => sqrt(2) approx 1.414 => 1.645 * 10 * 1.414 approx 23.26
    s_safe = compute_dynamic_safe_stock(mean_demand_per_period=50.0, std_demand_per_period=10.0, lead_time_periods=1.0)
    assert 22.0 <= s_safe <= 25.0

    # 2. Thử nghiệm thẩm định yêu cầu cấp phát bình thường
    normal_eval = evaluate_allocation_request(
        department="Phòng Marketing",
        item_query="Giấy in Double A A4 70gsm",
        requested_qty=12
    )
    assert normal_eval["status"] == "success"
    assert normal_eval["decision_code"] == "APPROVE_OPTIMAL"
    assert normal_eval["asset_id"] is not None
    assert len(normal_eval["similar_episodes"]) > 0

    # 3. Thử nghiệm thẩm định yêu cầu vượt định mức bất thường (yêu cầu 9999 ram)
    over_eval = evaluate_allocation_request(
        department="Phòng Marketing",
        item_query="Giấy in Double A A4 70gsm",
        requested_qty=9999
    )
    assert over_eval["status"] == "success"
    assert over_eval["decision_code"] == "REJECT_INSUFFICIENT_STOCK"
    assert "Từ chối" in over_eval["recommendation"] or "không đủ" in over_eval["recommendation"]


def test_orchestrator_aim_rm_allocation_query():
    """Kiểm tra điều phối yêu cầu thẩm định cấp phát qua LangGraph bằng ngôn ngữ tự nhiên."""
    res = process_user_request(
        message="Phòng Marketing xin cấp 15 ram giấy in A4 cho chiến dịch mới",
        role=ROLE_USER,
        department="Phòng Marketing"
    )
    assert res["intent"] == "inventory"
    assert "AIM-RM" in res["response"]
    assert "Định mức tồn kho an toàn" in res["response"]


def test_orchestrator_inventory_query():
    """Kiểm tra luồng hỏi đáp tồn kho qua LangGraph."""
    res = process_user_request(
        message="Kho phòng mình còn bao nhiêu ram giấy in A4?",
        role=ROLE_USER
    )
    assert res["intent"] == "inventory"
    assert "Double A" in res["response"] or "giấy" in res["response"].lower()


def test_orchestrator_support_and_ticket_creation():
    """Kiểm tra luồng xử lý sự cố và tự động lập phiếu báo hỏng."""
    # Bước 1: Hỏi cách khắc phục
    guide_res = process_user_request(
        message="Máy chiếu ở phòng họp báo No Signal màn hình xanh",
        role=ROLE_USER
    )
    assert guide_res["intent"] == "support"
    assert "Duplicate" in guide_res["response"] or "Windows + P" in guide_res["response"]

    # Bước 2: Báo vẫn hỏng -> Agent tự lập phiếu báo hỏng Word
    ticket_res = process_user_request(
        message="Tôi đã thử cả 3 bước rồi nhưng vẫn không lên, dây cáp âm bàn hỏng rồi",
        role=ROLE_USER,
        user_name="Nguyễn Hoàng Long",
        department="Phòng Marketing"
    )
    assert ticket_res["intent"] == "support"
    assert "Phiếu Báo Hỏng" in ticket_res["response"]
    assert "docx_path" in ticket_res["data"]
    assert Path(ticket_res["data"]["docx_path"]).exists()


def test_orchestrator_rbac_blocking():
    """Kiểm tra chặn hành vi trái quyền hạn qua LangGraph."""
    # User thông thường không được phép tải ảnh nhập kho
    res = process_user_request(
        message="nhập kho bằng ảnh hóa đơn nhà cung cấp",
        role=ROLE_USER
    )
    assert res["intent"] == "blocked"
    assert "Từ chối truy cập" in res["response"]


def test_model_mismatch_and_presence_query():
    """Kiểm tra xử lý câu hỏi vị trí 'có trong phòng không' và chống nhận vơ model (Canon 3300)."""
    # 1. Kiểm tra trực tiếp hàm search_asset_by_query không được nhận vơ Canon 3300 thành Canon 2900
    res_asset = search_asset_by_query("máy in canon 3300")
    assert res_asset is None

    # 2. Kiểm tra điều phối qua Orchestrator
    res = process_user_request("Máy in canon 3300 có trong phòng không")
    assert res["intent"] == "inventory"
    assert "Không tìm thấy model '3300'" in res["response"]
    assert "Canon LBP 2900" in res["response"]


def test_out_of_scope_guardrail():
    """Kiểm tra tầng lọc câu hỏi ngoài phạm vi (Guardrail) ngăn chặn chitchat/hỏi linh tinh."""
    res_food = process_user_request("Hôm nay ăn gì nhỉ?")
    assert res_food["intent"] == "out_of_scope"
    assert "ngoài phạm vi hỗ trợ" in res_food["response"]

    res_weather = process_user_request("Thời tiết Hà Nội hôm nay thế nào?")
    assert res_weather["intent"] == "out_of_scope"
    assert "ngoài phạm vi hỗ trợ" in res_weather["response"]


def test_greeting_intent():
    """Kiểm tra phân loại lời chào hỏi và giới thiệu trợ lý."""
    res = process_user_request("Xin chào, bạn là ai?")
    assert res["intent"] == "greeting"
    assert "Office Asset Agent" in res["response"]


def test_dynamic_entity_extraction_ticket():
    """Kiểm tra trích xuất thực thể động (vị trí, triệu chứng) khi lập phiếu sửa chữa."""
    res = process_user_request(
        "Máy in ở phòng Kế toán tầng 3 bị kẹt giấy, hãy lập phiếu sửa chữa",
        user_name="Nguyễn Hoàng Long",
        department="Phòng Kế toán"
    )
    assert res["intent"] == "support"
    assert "Phiếu Báo Hỏng" in res["response"]
    assert "Tầng 3" in res["response"] or "Kế Toán" in res["response"]

