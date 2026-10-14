"""
API Test Suite for Office Asset Agent FastAPI Backend.
Validates REST endpoints, LangGraph multi-agent chat, and SPA serving.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.server import app
from src.core.init_db import init_database

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_api_database():
    init_database()


def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Office Asset Agent Backend"


def test_get_assets():
    res = client.get("/api/assets")
    assert res.status_code == 200
    assets = res.json()
    assert len(assets) > 0
    # Check schema
    first = assets[0]
    assert "id" in first
    assert "name" in first
    assert "currentStock" in first
    assert "unitPrice" in first
    assert "status" in first


def test_inventory_metrics():
    res = client.get("/api/inventory/metrics")
    assert res.status_code == 200
    metrics = res.json()
    assert metrics["total_items"] > 0
    assert metrics["total_valuation_vnd"] > 0


def test_adjust_stock():
    # Fetch first asset
    assets = client.get("/api/assets").json()
    target = assets[0]
    prev_stock = target["currentStock"]

    # 1. Adjust IN
    res_in = client.post("/api/assets/adjust", json={
        "asset_id": target["id"],
        "type": "IN",
        "quantity": 5,
        "reason": "Nhập thử nghiệm test_api",
        "performer": "Admin Test",
        "reference_doc": "HĐ-TEST"
    })
    assert res_in.status_code == 200
    assert res_in.json()["success"] is True

    # 2. Adjust OUT
    res_out = client.post("/api/assets/adjust", json={
        "asset_id": target["id"],
        "type": "OUT",
        "quantity": 5,
        "reason": "Xuất hoàn lại test_api",
        "performer": "Admin Test",
        "reference_doc": "XK-TEST"
    })
    assert res_out.status_code == 200
    assert res_out.json()["success"] is True

    # Clean up test transactions
    from src.core.database import SessionLocal
    from src.models.ticket import StockTransaction, MaintenanceTicket
    from src.models.asset import Asset
    db = SessionLocal()
    try:
        db.query(StockTransaction).filter(StockTransaction.provider_or_dept == "Admin Test").delete()
        db.commit()
    finally:
        db.close()


def test_ticket_lifecycle():
    # 1. Create ticket
    create_res = client.post("/api/tickets", json={
        "asset_name": "Máy chiếu Epson EB-X06",
        "department": "Phòng Kế toán",
        "reporter_name": "Trần Thị Lan",
        "reporter_role": "Kế toán viên",
        "location": "Phòng họp số 3",
        "symptom_description": "Không nhận tín hiệu cáp HDMI",
        "preliminary_diagnosis": "Lỏng cáp kết nối",
        "proposed_action": "Thay cáp",
        "estimated_cost": 250000,
        "urgency": "HIGH"
    })
    assert create_res.status_code == 200
    ticket = create_res.json()
    ticket_id = ticket["id"]
    assert ticket["status"] == "PENDING_APPROVAL"

    # 2. Update status
    patch_res = client.patch(f"/api/tickets/{ticket_id}/status", json={
        "status": "APPROVED",
        "approved_by": "Trần Huy Hoàng"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "APPROVED"

    # 3. Download docx
    docx_res = client.get(f"/api/tickets/{ticket_id}/docx")
    assert docx_res.status_code == 200
    assert "application/vnd.openxmlformats-officedocument.wordprocessingml.document" in docx_res.headers["content-type"]

    # Clean up created ticket
    from src.core.database import SessionLocal
    from src.models.ticket import MaintenanceTicket
    db = SessionLocal()
    try:
        db.query(MaintenanceTicket).filter(MaintenanceTicket.ticket_code == ticket_id).delete()
        db.commit()
    finally:
        db.close()


def test_audit_endpoints():
    # 1. Fetch episodes
    episodes_res = client.get("/api/audit/episodes")
    assert episodes_res.status_code == 200
    episodes = episodes_res.json()
    assert len(episodes) > 0

    # 2. Evaluate allocation request
    eval_res = client.post("/api/audit/evaluate", json={
        "department": "Phòng Marketing",
        "item_query": "giấy a4",
        "requested_qty": 20
    })
    assert eval_res.status_code == 200
    data = eval_res.json()
    assert data["status"] == "success"
    assert "safe_stock_benchmark" in data

    # 3. Approve allocation
    approve_res = client.post("/api/audit/approve", json={
        "asset_id": data["asset_code"],
        "quantity": 5,
        "department": "Phòng Thử Nghiệm API",
        "notes": "Test approval"
    })
    assert approve_res.status_code == 200
    assert approve_res.json()["success"] is True

    # Revert asset quantity and clean up test transaction
    from src.core.database import SessionLocal
    from src.models.asset import Asset
    from src.models.ticket import StockTransaction
    db = SessionLocal()
    try:
        a = db.query(Asset).filter(Asset.code == data["asset_code"]).first()
        if a:
            a.quantity += 5
        db.query(StockTransaction).filter(StockTransaction.provider_or_dept == "Phòng Thử Nghiệm API").delete()
        db.commit()
    finally:
        db.close()


def test_knowledge_endpoint():
    res = client.get("/api/knowledge")
    assert res.status_code == 200
    docs = res.json()
    assert len(docs) > 0
    assert "model" in docs[0]
    assert "operatingSteps" in docs[0]
    assert "errorCodes" in docs[0]


def test_chat_with_langgraph_agent():
    # Query stock via LangGraph
    chat_res = client.post("/api/chat", json={
        "message": "Kho còn bao nhiêu ram giấy in A4?",
        "role": "user",
        "user_name": "Nguyễn Hoàng Long",
        "department": "Phòng Marketing",
        "thread_id": "test_session_api"
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert "response" in data
    assert "giấy" in data["response"].lower() or "double a" in data["response"].lower()


def test_spa_serving():
    res = client.get("/")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Office Asset Agent" in res.text or "<!DOCTYPE html>" in res.text or "<!doctype html>" in res.text


def test_auth_login_success():
    # 1. Admin login
    res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["canAdjustStock"] is True

    # 2. Staff user login
    res_user = client.post("/api/auth/login", json={"username": "user", "password": "user123"})
    assert res_user.status_code == 200
    data_user = res_user.json()
    assert data_user["success"] is True
    assert data_user["user"]["role"] == "user"
    assert data_user["user"]["canAdjustStock"] is False


def test_auth_login_failure():
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "không chính xác" in res.json()["detail"]


def test_auth_me_and_guard():
    # Login as user
    res_user = client.post("/api/auth/login", json={"username": "user", "password": "user123"})
    user_token = res_user.json()["token"]

    # Verify /api/auth/me
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert res_me.status_code == 200
    assert res_me.json()["user"]["username"] in ["user", "user1"]

    # Role Guard check: Non-admin trying to adjust stock must receive 403 Forbidden
    res_forbidden = client.post(
        "/api/assets/adjust",
        json={"asset_id": "VT-GIAY-A4", "type": "IN", "quantity": 1, "reason": "Test RBAC", "performer": "User"},
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert res_forbidden.status_code == 403
    assert "Quản trị viên" in res_forbidden.json()["detail"]


def test_ocr_upload_real_image():
    import io
    from PIL import Image

    # Create dummy PNG image bytes
    img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    res = client.post(
        "/api/ocr",
        files={"file": ("invoice_test.png", buf.getvalue(), "image/png")}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert len(data["items"]) > 0
    assert "image_data" in data
    assert data["image_data"].startswith("data:image/png;base64,")

