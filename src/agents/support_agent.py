"""
Device Support & Troubleshooting Agent.
Đồ án 2: Hướng dẫn khắc phục sự cố theo Model và tự động lập Phiếu Báo Hỏng (Word/PDF).
"""

import re
from typing import Dict, Any
import uuid
from src.core.database import SessionLocal
from src.models.asset import KnowledgeDoc
from src.models.ticket import MaintenanceTicket
from src.tools.doc_generator import generate_maintenance_ticket_docx


def handle_support_query(user_message: str, user_name: str = "Nguyễn Hoàng Long", dept: str = "Phòng Marketing") -> Dict[str, Any]:
    """
    Xử lý các tình huống hỏi sửa lỗi hoặc lập phiếu báo hỏng thiết bị.
    """
    msg_lower = user_message.lower()
    db = SessionLocal()

    try:
        # Trường hợp 1: Người dùng báo vẫn hỏng, yêu cầu lập phiếu sửa chữa / báo hỏng
        escalate_keywords = ["không được", "vẫn không lên", "vẫn hỏng", "lập phiếu", "báo hỏng", "sửa chữa", "thay dây", "gọi thợ", "hỏng rồi"]
        if any(kw in msg_lower for kw in escalate_keywords):
            # Trích xuất vị trí nếu người dùng đề cập cụ thể (VD: "ở phòng kế toán", "tại phòng họp 2", "tầng 3")
            loc_match = re.search(r"(phòng\s+[a-zA-Z0-9\s–\-]{2,20}|tầng\s+\d+|khu\s+[a-zA-Z0-9]+)", user_message, re.IGNORECASE)
            extracted_location = loc_match.group(0).strip().title() if loc_match else None

            # Xác định loại thiết bị từ ngữ cảnh
            if "máy in" in msg_lower or "printer" in msg_lower:
                device_name = "Máy in Laser đơn năng Canon LBP 2900"
                location = extracted_location or "Phòng Hành chính - Tầng 2"
                symptom = "Kẹt giấy cụm sấy hoặc lỗi bản in theo phản ánh của nhân viên"
                proposed_solution = "Kỹ thuật viên kiểm tra bảo trì cụm sấy, vệ sinh rulo cuốn giấy hoặc thay hộp mực"
            elif "micro" in msg_lower or "mic" in msg_lower:
                device_name = "Bộ Micro Takstar WGV-201"
                location = extracted_location or "Phòng họp số 1"
                symptom = "Mất tiếng, chập chờn nguồn hoặc lệch sóng bộ thu"
                proposed_solution = "Kiểm tra thay micro hoặc bảo dưỡng bộ thu RF"
            else:
                device_name = "Máy chiếu Epson EB-X06 (Cáp HDMI âm sàn)"
                location = extracted_location or "Phòng họp số 3"
                symptom = "Báo No Signal màn hình xanh, đã thử thao tác Win+P và đổi cáp nhưng không nhận"
                proposed_solution = "Kỹ thuật viên kiểm tra thay mới cáp HDMI âm sàn / Bảo hành thiết bị"

            # Tinh chỉnh triệu chứng nếu người dùng mô tả chi tiết
            if any(s in msg_lower for s in ["kẹt giấy", "rách giấy", "không kéo được giấy"]):
                symptom = "Kẹt giấy cụm sấy hoặc kẹt rulo kéo giấy"
            elif any(s in msg_lower for s in ["no signal", "không lên tín hiệu", "màn xanh"]):
                symptom = "Không nhận tín hiệu hình ảnh (No Signal), lỗi cổng/cáp HDMI"
            elif any(s in msg_lower for s in ["mất tiếng", "hú", "không nghe tiếng"]):
                symptom = "Micro mất tiếng hoặc chập chờn nguồn âm thanh"

            ticket_code = f"SC-{uuid.uuid4().hex[:6].upper()}"
            ticket_data = {
                "ticket_code": ticket_code,
                "requester_name": user_name,
                "department": dept,
                "device_name": device_name,
                "location": location,
                "symptom": symptom,
                "proposed_solution": proposed_solution,
                "status": "CHỜ CÁN BỘ QUẢN TRỊ DUYỆT",
            }

            # Tự động xuất file Word .docx
            docx_path = generate_maintenance_ticket_docx(ticket_data)

            # Lưu vào Database
            ticket = MaintenanceTicket(
                ticket_code=ticket_code,
                requester_name=user_name,
                department=dept,
                device_name=device_name,
                location=location,
                symptom=symptom,
                proposed_solution=proposed_solution,
                status="PENDING_APPROVAL",
                docx_path=docx_path,
            )
            db.add(ticket)
            db.commit()

            reply_text = (
                f"⚠️ **Hệ thống đã tự động lập Phiếu Báo Hỏng & Yêu Cầu Sửa Chữa Thiết Bị:**\n\n"
                f"* **Mã phiếu:** `{ticket_code}`\n"
                f"* **Thiết bị:** {device_name}\n"
                f"* **Vị trí:** {location}\n"
                f"* **Người gửi yêu cầu:** {user_name} ({dept})\n"
                f"* **Hiện trạng:** {symptom}\n"
                f"* **Đề xuất:** {proposed_solution}\n\n"
                f"📄 Đã tạo file biểu mẫu công ty: `Phieu_Bao_Hong_{ticket_code}.docx`.\n"
                f"🔔 Phiếu đã được chuyển đến Cán bộ Quản trị phòng ban phê duyệt."
            )

            return {
                "status": "ticket_created",
                "ticket_code": ticket_code,
                "docx_path": docx_path,
                "response": reply_text
            }

        # Trường hợp 2: Hướng dẫn kỹ thuật từ Cơ sở tri thức CSDL (Dynamic Knowledge Retrieval)
        matched_doc = None
        # Ưu tiên khớp theo tên model cụ thể
        all_docs = db.query(KnowledgeDoc).all()
        for doc in all_docs:
            if doc.model_name.lower() in msg_lower:
                matched_doc = doc
                break

        # Nếu chưa khớp theo model, khớp theo phân loại thiết bị & triệu chứng
        if not matched_doc:
            if any(k in msg_lower for k in ["máy chiếu", "no signal", "màn chiếu", "mờ hình"]):
                matched_doc = db.query(KnowledgeDoc).filter(KnowledgeDoc.device_type.ilike("%máy chiếu%")).first()
            elif any(k in msg_lower for k in ["máy in", "kẹt giấy", "offline", "vệt đen"]):
                matched_doc = db.query(KnowledgeDoc).filter(KnowledgeDoc.device_type.ilike("%máy in%")).first()
            elif any(k in msg_lower for k in ["micro", "mic", "hú", "rút rít", "mất tiếng"]):
                matched_doc = db.query(KnowledgeDoc).filter(KnowledgeDoc.device_type.ilike("%micro%")).first()

        if matched_doc:
            reply_text = (
                f"🎯 **Cẩm nang khắc phục sự cố {matched_doc.device_type} ({matched_doc.model_name}):**\n\n"
                f"📖 **Hướng dẫn vận hành chuẩn:**\n{matched_doc.manual_text}\n\n"
                f"🛠️ **Bảng chẩn đoán & Cách khắc phục:**\n{matched_doc.troubleshooting_guide}\n\n"
                f"*(Nguồn: {matched_doc.source_url} — Nếu làm đủ các bước mà vẫn không khắc phục được, "
                f"bạn hãy nhắn lại 'Vẫn không được' để tôi tự động lập Phiếu Báo Hỏng gửi Cán bộ duyệt nhé!)*"
            )
            return {
                "status": "guide_provided",
                "model_name": matched_doc.model_name,
                "response": reply_text
            }

        # Mặc định: Tra cứu cẩm nang chung
        available_models = ", ".join([d.model_name for d in all_docs[:4]])
        return {
            "status": "general_guide",
            "response": (
                "Tôi có thể hỗ trợ bạn các hướng dẫn sử dụng và xử lý sự cố thiết bị văn phòng:\n"
                f"- Các dòng máy đã có cẩm nang trong kho: {available_models}\n"
                "- Máy chiếu phòng họp (báo No Signal, mờ nét, méo keystone)\n"
                "- Máy in laser văn phòng (kẹt giấy, báo offline, vệt đen sọc)\n"
                "- Hệ thống micro không dây & amply phòng họp (mất tiếng, pin yếu, hú rít)\n\n"
                "Bạn vui lòng mô tả hiện tượng đang gặp phải nhé!"
            )
        }
    finally:
        db.close()
