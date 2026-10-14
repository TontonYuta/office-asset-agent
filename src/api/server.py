"""
FastAPI Server for Office Asset Agent.
Replaces Streamlit with a modern REST API serving the React/TypeScript frontend.
"""

import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from src.core.config import BASE_DIR, DATA_DIR, TEMPLATES_DIR, ROLE_USER, ROLE_ADMIN
from src.core.database import SessionLocal
from src.core.init_db import init_database
from src.models.user import User
from src.models.asset import Asset, KnowledgeDoc
from src.models.ticket import MaintenanceTicket, StockTransaction
from src.core.security import (
    create_jwt_token,
    verify_jwt_token,
    authenticate_user,
    user_to_profile,
)
from src.tools.sql_calculator import (
    search_asset_by_query,
    calculate_inventory_metrics,
    commit_stock_transaction,
    get_all_assets,
)
from src.tools.inventory_memory import (
    evaluate_allocation_request,
    get_department_allocation_history,
    retrieve_similar_episodes,
)
from src.tools.doc_generator import generate_maintenance_ticket_docx
from src.tools.web_search import enrich_and_cache_knowledge
from src.tools.vision_ocr import parse_delivery_receipt
from src.agents.orchestrator import process_user_request

# Initialize Database
init_database()

app = FastAPI(
    title="Office Asset Agent API",
    description="Enterprise Multi-Agent Office Asset & Equipment Management System",
    version="2.0.0",
)

# CORS Middleware (Allows Vite dev server on port 3000 to connect seamlessly)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------- PYDANTIC SCHEMAS -------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class ChatRequest(BaseModel):
    message: str
    role: str = "user"
    user_name: str = "Nguyễn Hoàng Long"
    department: str = "Phòng Marketing"
    thread_id: Optional[str] = "default_session"


class StockAdjustRequest(BaseModel):
    asset_id: str
    type: str  # 'IN' or 'OUT'
    quantity: int
    reason: str
    performer: str
    reference_doc: Optional[str] = None


class BatchStockItem(BaseModel):
    asset_id: str
    quantity: int


class BatchStockAdjustRequest(BaseModel):
    items: List[BatchStockItem]
    reason: str
    performer: str
    reference_doc: Optional[str] = None


class CreateTicketRequest(BaseModel):
    asset_id: Optional[str] = ""
    asset_name: str
    asset_model: Optional[str] = ""
    department: str
    reporter_name: str
    reporter_role: Optional[str] = "Nhân viên"
    location: str
    symptom_description: str
    preliminary_diagnosis: Optional[str] = ""
    proposed_action: Optional[str] = ""
    estimated_cost: Optional[int] = 0
    urgency: Optional[str] = "HIGH"
    conversation_summary: Optional[str] = ""


class UpdateTicketStatusRequest(BaseModel):
    status: str
    approved_by: Optional[str] = None
    assigned_technician: Optional[str] = None


class AuditEvaluateRequest(BaseModel):
    department: str
    item_query: str
    requested_qty: int


class AuditApproveRequest(BaseModel):
    asset_id: str
    quantity: int
    department: str
    notes: Optional[str] = ""


class EnrichRequest(BaseModel):
    model_name: str


# ------------------- HELPER SERIALIZERS -------------------

def serialize_asset(a: Asset) -> Dict[str, Any]:
    """Serialize SQLAlchemy Asset into the frontend Asset schema."""
    stock_status = "AVAILABLE"
    if a.status == "Bảo trì":
        stock_status = "MAINTENANCE"
    elif a.quantity <= 0:
        stock_status = "OUT_OF_STOCK"
    elif a.quantity <= 10:
        stock_status = "LOW_STOCK"

    category_map = {
        "Vật tư tiêu hao": "Vật tư tiêu hao",
        "Thiết bị dùng chung": "Thiết bị dùng chung",
        "Thiết bị văn phòng": "Thiết bị văn phòng",
    }
    category = category_map.get(a.category, "Thiết bị văn phòng")

    specs_dict = {}
    if a.specs:
        for part in a.specs.split(","):
            if ":" in part:
                k, v = part.split(":", 1)
                specs_dict[k.strip()] = v.strip()
            else:
                specs_dict["Thông số"] = a.specs

    return {
        "id": a.code,
        "db_id": a.id,
        "name": a.name,
        "model": a.model or a.code,
        "category": category,
        "location": a.location,
        "currentStock": a.quantity,
        "minSafeStock": 15 if a.category == "Vật tư tiêu hao" else 2,
        "maxCapacity": max(100, a.quantity * 2),
        "unit": a.unit,
        "unitPrice": a.unit_price,
        "status": stock_status,
        "lastAudited": a.created_at.strftime("%Y-%m-%d") if a.created_at else "2026-10-01",
        "meanMonthlyDemand": max(1, int(a.quantity * 0.35)),
        "stdDevDemand": max(1.0, round(a.quantity * 0.1, 1)),
        "leadTimeWeeks": 1.0 if a.category == "Vật tư tiêu hao" else 2.0,
        "specifications": specs_dict,
    }


def serialize_ticket(t: MaintenanceTicket) -> Dict[str, Any]:
    """Serialize MaintenanceTicket into the frontend MaintenanceTicket schema."""
    return {
        "id": t.ticket_code,
        "officialDocNumber": f"{t.id + 30}/TTr-HCQT",
        "assetId": t.model or "TB-001",
        "assetName": t.device_name,
        "assetModel": t.model or t.device_name,
        "department": t.department,
        "reporterName": t.requester_name,
        "reporterRole": "Cán bộ / Chuyên viên",
        "location": t.location,
        "createdAt": t.created_at.isoformat() if t.created_at else datetime.utcnow().isoformat(),
        "symptomDescription": t.symptom,
        "preliminaryDiagnosis": t.proposed_solution or "Kiểm tra kỹ thuật cụm chi tiết máy",
        "proposedAction": t.proposed_solution or "Bảo dưỡng thay thế linh kiện",
        "estimatedCost": 350000,
        "urgency": "HIGH",
        "status": t.status,
        "docxPath": t.docx_path,
        "approvedBy": t.approved_by,
    }


# ------------------- AUTH & PERMISSION HELPERS -------------------

def get_token_payload(authorization: Optional[str] = None) -> Optional[Dict[str, Any]]:
    if not authorization:
        return None
    token = authorization.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    return verify_jwt_token(token)


def check_admin_permission(authorization: Optional[str] = None):
    if not authorization:
        return  # Allow unauthenticated access for legacy calls / testing
    payload = get_token_payload(authorization)
    if not payload:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")
    if payload.get("role") != ROLE_ADMIN:
        raise HTTPException(
            status_code=403,
            detail="🚫 Từ chối truy cập: Thao tác này yêu cầu quyền Quản trị viên (Admin)."
        )


# ------------------- API ENDPOINTS -------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Office Asset Agent Backend",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat(),
    }


# 0. AUTHENTICATION & JWT ENDPOINTS
@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác. (Gợi ý: admin / admin123 hoặc user / user123)"
        )
    profile = user_to_profile(user)
    token = create_jwt_token({
        "sub": user.username,
        "user_id": user.id,
        "role": user.role,
        "name": user.full_name,
        "department": user.department,
    })
    return {
        "success": True,
        "token": token,
        "user": profile,
        "message": f"Đăng nhập thành công với vai trò {profile['roleLabel']}."
    }


@app.get("/api/auth/me")
def get_me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Thiếu Authorization header.")
    payload = get_token_payload(authorization)
    if not payload:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == payload.get("sub")).first()
        if not user:
            raise HTTPException(status_code=404, detail="Người dùng không tồn tại.")
        return {
            "authenticated": True,
            "user": user_to_profile(user),
        }
    finally:
        db.close()


@app.post("/api/auth/logout")
def logout():
    return {"success": True, "message": "Đã đăng xuất thành công."}


# 1. ASSETS & INVENTORY ENDPOINTS
@app.get("/api/assets")
def get_assets():
    db = SessionLocal()
    try:
        assets = db.query(Asset).all()
        return [serialize_asset(a) for a in assets]
    finally:
        db.close()


@app.get("/api/inventory/metrics")
def get_inventory_metrics():
    return calculate_inventory_metrics()


@app.post("/api/assets/adjust")
def adjust_stock(req: StockAdjustRequest, authorization: Optional[str] = Header(None)):
    check_admin_permission(authorization)
    db = SessionLocal()
    try:
        # Match by code or by id
        asset = db.query(Asset).filter(
            (Asset.code == req.asset_id) | (Asset.id == (int(req.asset_id) if req.asset_id.isdigit() else -1))
        ).first()

        if not asset:
            raise HTTPException(status_code=404, detail="Không tìm thấy vật tư trong hệ thống.")

        res = commit_stock_transaction(
            asset_id=asset.id,
            transaction_type=req.type,
            quantity=req.quantity,
            provider_or_dept=req.performer,
            notes=f"{req.reason} (Chứng từ: {req.reference_doc or 'N/A'})",
        )
        if not res["success"]:
            raise HTTPException(status_code=400, detail=res["message"])

        return {
            "success": True,
            "message": res["message"],
            "asset": serialize_asset(asset),
            "transaction_code": res.get("transaction_code"),
        }
    finally:
        db.close()


@app.post("/api/assets/batch-add")
def batch_add_stock(req: BatchStockAdjustRequest, authorization: Optional[str] = Header(None)):
    check_admin_permission(authorization)
    db = SessionLocal()
    count = 0
    try:
        for item in req.items:
            asset = db.query(Asset).filter(
                (Asset.code == item.asset_id) | (Asset.id == (int(item.asset_id) if item.asset_id.isdigit() else -1))
            ).first()
            if asset:
                commit_stock_transaction(
                    asset_id=asset.id,
                    transaction_type="IN",
                    quantity=item.quantity,
                    provider_or_dept=req.performer,
                    notes=f"{req.reason} (Chứng từ: {req.reference_doc or 'Hóa đơn'})",
                )
                count += 1
        return {"success": True, "count": count}
    finally:
        db.close()


# 2. TICKETS & ADMINISTRATIVE WORD DOCUMENTS
@app.get("/api/tickets")
def get_tickets():
    db = SessionLocal()
    try:
        tickets = db.query(MaintenanceTicket).order_by(MaintenanceTicket.created_at.desc()).all()
        return [serialize_ticket(t) for t in tickets]
    finally:
        db.close()


@app.post("/api/tickets")
def create_ticket(req: CreateTicketRequest):
    db = SessionLocal()
    try:
        ticket_code = f"PBH-{datetime.now().strftime('%Y')}-{uuid.uuid4().hex[:4].upper()}"
        ticket_data = {
            "ticket_code": ticket_code,
            "requester_name": req.reporter_name,
            "department": req.department,
            "device_name": req.asset_name,
            "location": req.location,
            "symptom": req.symptom_description,
            "proposed_solution": req.proposed_action or req.preliminary_diagnosis,
            "status": "CHỜ CÁN BỘ QUẢN TRỊ DUYỆT",
        }

        # Generate official Decree 30 standard .docx document
        docx_path = generate_maintenance_ticket_docx(ticket_data)

        ticket = MaintenanceTicket(
            ticket_code=ticket_code,
            requester_name=req.reporter_name,
            department=req.department,
            device_name=req.asset_name,
            model=req.asset_model or req.asset_name,
            location=req.location,
            symptom=req.symptom_description,
            proposed_solution=req.proposed_action or req.preliminary_diagnosis,
            status="PENDING_APPROVAL",
            docx_path=docx_path,
        )
        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        return serialize_ticket(ticket)
    finally:
        db.close()


@app.patch("/api/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, req: UpdateTicketStatusRequest):
    db = SessionLocal()
    try:
        ticket = db.query(MaintenanceTicket).filter(
            (MaintenanceTicket.ticket_code == ticket_id) | (MaintenanceTicket.id == (int(ticket_id) if ticket_id.isdigit() else -1))
        ).first()

        if not ticket:
            raise HTTPException(status_code=404, detail="Không tìm thấy phiếu báo hỏng.")

        ticket.status = req.status
        if req.approved_by:
            ticket.approved_by = req.approved_by
        db.commit()
        db.refresh(ticket)
        return serialize_ticket(ticket)
    finally:
        db.close()


@app.get("/api/tickets/{ticket_id}/docx")
def download_ticket_docx(ticket_id: str):
    db = SessionLocal()
    try:
        ticket = db.query(MaintenanceTicket).filter(
            (MaintenanceTicket.ticket_code == ticket_id) | (MaintenanceTicket.id == (int(ticket_id) if ticket_id.isdigit() else -1))
        ).first()

        if not ticket:
            raise HTTPException(status_code=404, detail="Phiếu báo hỏng không tồn tại.")

        file_path = Path(ticket.docx_path) if ticket.docx_path else None
        if not file_path or not file_path.exists():
            # Auto-regenerate if missing
            ticket_data = {
                "ticket_code": ticket.ticket_code,
                "requester_name": ticket.requester_name,
                "department": ticket.department,
                "device_name": ticket.device_name,
                "location": ticket.location,
                "symptom": ticket.symptom,
                "proposed_solution": ticket.proposed_solution,
                "status": "ĐÃ PHÊ DUYỆT" if ticket.status == "APPROVED" else "CHỜ DUYỆT",
            }
            docx_path = generate_maintenance_ticket_docx(ticket_data)
            ticket.docx_path = docx_path
            db.commit()
            file_path = Path(docx_path)

        return FileResponse(
            path=str(file_path),
            filename=file_path.name,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    finally:
        db.close()


# 3. AUDIT & AIM-RM SAFE-STOCK ENDPOINTS
@app.get("/api/audit/episodes")
def get_audit_episodes():
    db = SessionLocal()
    try:
        # Retrieve real transactions from database
        txs = db.query(StockTransaction).filter(StockTransaction.transaction_type == "OUT").order_by(StockTransaction.created_at.desc()).limit(10).all()
        episodes = []
        for t in txs:
            asset = db.query(Asset).filter(Asset.id == t.asset_id).first()
            episodes.append({
                "id": t.transaction_code,
                "department": t.provider_or_dept or "Phòng ban",
                "assetId": asset.code if asset else f"VT-{t.asset_id}",
                "assetName": asset.name if asset else "Vật tư",
                "pastQuantity": t.quantity,
                "date": t.created_at.strftime("%Y-%m-%d") if t.created_at else "2026-10-01",
                "outcome": "FULFILLED",
                "note": t.notes or "Cấp phát định kỳ",
            })

        # Baseline episodes for comprehensive demo
        baseline = [
            {
                "id": "EP-MKT-01",
                "department": "Phòng Marketing",
                "assetId": "VT-GIAY-A4",
                "assetName": "Giấy in Double A A4 70gsm",
                "pastQuantity": 20,
                "date": "2026-08-15",
                "outcome": "FULFILLED",
                "note": "Cấp phát in ấn tài liệu chiến dịch Q3",
            },
            {
                "id": "EP-KT-02",
                "department": "Phòng Kế toán",
                "assetId": "VT-GIAY-A4",
                "assetName": "Giấy in Double A A4 70gsm",
                "pastQuantity": 15,
                "date": "2026-09-10",
                "outcome": "FULFILLED",
                "note": "Định mức thường kỳ hàng tháng",
            },
            {
                "id": "EP-HC-03",
                "department": "Phòng Hành chính – Quản trị",
                "assetId": "VT-MUC-2900",
                "assetName": "Hộp mực máy in Cartridge 12A",
                "pastQuantity": 2,
                "date": "2026-08-20",
                "outcome": "FULFILLED",
                "note": "Thay thế hộp mực máy in Canon 2900",
            },
        ]
        return episodes + baseline if len(episodes) < 3 else episodes
    finally:
        db.close()


@app.post("/api/audit/evaluate")
def evaluate_audit(req: AuditEvaluateRequest):
    res = evaluate_allocation_request(
        department=req.department,
        item_query=req.item_query,
        requested_qty=req.requested_qty,
    )
    return res


@app.post("/api/audit/approve")
def approve_audit(req: AuditApproveRequest, authorization: Optional[str] = Header(None)):
    check_admin_permission(authorization)
    db = SessionLocal()
    try:
        asset = db.query(Asset).filter(
            (Asset.code == req.asset_id) | (Asset.id == (int(req.asset_id) if req.asset_id.isdigit() else -1))
        ).first()

        if not asset:
            raise HTTPException(status_code=404, detail="Không tìm thấy vật tư.")

        res = commit_stock_transaction(
            asset_id=asset.id,
            transaction_type="OUT",
            quantity=req.quantity,
            provider_or_dept=req.department,
            notes=f"[AIM-RM Safe-Stock Duyệt] {req.notes or 'Cấp phát định mức'}",
        )
        if not res["success"]:
            raise HTTPException(status_code=400, detail=res["message"])

        return res
    finally:
        db.close()


# 4. KNOWLEDGE NOTEBOOK & ENRICHMENT
@app.get("/api/knowledge")
def get_knowledge_docs():
    db = SessionLocal()
    try:
        docs = db.query(KnowledgeDoc).all()
        results = []
        for d in docs:
            # Parse operating steps from manual_text
            steps = []
            for i, line in enumerate([l for l in d.manual_text.split("\n") if l.strip()][:3]):
                steps.append({
                    "step": i + 1,
                    "title": f"Bước {i + 1}",
                    "description": line.lstrip("1234567890. -*"),
                })
            if not steps:
                steps = [
                    {"step": 1, "title": "Bật nguồn", "description": "Kiểm tra nguồn điện và cáp cắm."},
                    {"step": 2, "title": "Vận hành", "description": "Thao tác theo đúng hướng dẫn kỹ thuật."},
                    {"step": 3, "title": "Bảo dưỡng", "description": "Vệ sinh và tắt máy khi hết giờ."},
                ]

            # Parse error codes from troubleshooting_guide
            error_codes = []
            for line in [l for l in d.troubleshooting_guide.split("\n") if l.strip()]:
                error_codes.append({
                    "code": "Mã sự cố",
                    "title": "Chẩn đoán lỗi",
                    "symptom": line,
                    "fix": "Kiểm tra theo khuyến nghị của nhà sản xuất.",
                })
            if not error_codes:
                error_codes = [
                    {"code": "ERR-01", "title": "Sự cố vận hành", "symptom": d.troubleshooting_guide, "fix": "Liên hệ CSVC nếu không tự xử lý được."},
                ]

            results.append({
                "id": f"KB-{d.id}",
                "model": d.model_name,
                "name": d.title,
                "category": d.device_type,
                "operatingSteps": steps,
                "errorCodes": error_codes,
                "sourceUrl": d.source_url,
            })
        return results
    finally:
        db.close()


@app.post("/api/knowledge/enrich")
def enrich_knowledge(req: EnrichRequest):
    res = enrich_and_cache_knowledge(req.model_name)
    return res


# 5. MULTI-AGENT CHAT (LANGGRAPH ORCHESTRATION)
@app.post("/api/chat")
def chat_with_agent(req: ChatRequest):
    res = process_user_request(
        message=req.message,
        role=req.role,
        user_name=req.user_name,
        department=req.department,
        thread_id=req.thread_id or "default_session",
    )
    return res


# 6. OCR DELIVERY RECEIPT PARSER
@app.post("/api/ocr")
async def parse_receipt_image(file: UploadFile = File(...)):
    contents = await file.read()
    res = parse_delivery_receipt(image_source=contents)
    return res


# ------------------- SPA STATIC FILES -------------------
FRONTEND_DIST = BASE_DIR / "frontend" / "dist"

if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't hijack API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")

        file_candidate = FRONTEND_DIST / full_path
        if file_candidate.is_file():
            return FileResponse(str(file_candidate))

        return FileResponse(str(FRONTEND_DIST / "index.html"))
