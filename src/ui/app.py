"""
Office Asset Agent - Streamlit Interactive Web Application.
Đồ án 2: Hệ Thống Agent AI Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị
Sinh viên thực hiện: Trần Huy Hoàng - MSSV: 20237337
"""

import sys
from pathlib import Path
import streamlit as st

# Thêm thư mục gốc vào PYTHONPATH
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from src.core.config import ROLE_USER, ROLE_ADMIN, TEMPLATES_DIR
from src.core.init_db import init_database
from src.core.database import SessionLocal
from src.models.asset import Asset, KnowledgeDoc
from src.models.ticket import MaintenanceTicket
from src.tools.sql_calculator import (
    get_all_assets,
    calculate_inventory_metrics,
    commit_stock_transaction,
)
from src.tools.doc_generator import generate_inventory_chart
from src.tools.inventory_memory import evaluate_allocation_request
from src.agents.orchestrator import process_user_request

# Cấu hình giao diện Streamlit
st.set_page_config(
    page_title="Office Asset Agent - Đồ án 2",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Tự động khởi tạo database nếu lần đầu chạy
init_database()

# Quản lý Session State
if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "👋 Xin chào! Tôi là **Office Asset Agent** — Trợ lý AI hỗ trợ quản lý vật tư và thiết bị văn phòng.\n\n"
                "Tôi có thể hỗ trợ bạn:\n"
                "- 📦 **Tra cứu tồn kho:** *'Kho còn bao nhiêu ram giấy A4?'*, *'Hộp mực 12A còn không?'*\n"
                "- 🛠️ **Hỗ trợ kỹ thuật & sửa lỗi:** *'Máy chiếu báo No Signal'*, *'Máy in bị kẹt giấy'*\n"
                "- 📄 **Tự động lập Phiếu Báo Hỏng:** Tạo sẵn file Word chuẩn mẫu gửi cán bộ duyệt\n"
                "- 🌐 **Tự động làm giàu tri thức:** Tìm kiếm cẩm nang kỹ thuật theo model máy trên mạng\n"
                "- 📷 **Nhập kho bằng ảnh chứng từ:** Dành cho Cán bộ Quản lý (Admin)"
            ),
        }
    ]

# ----------------- SIDEBAR -----------------
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/office.png", width=70)
    st.title("🏢 Office Asset Agent")
    st.caption("Đề tài Đồ án Tốt nghiệp / Đồ án 2")

    st.markdown("---")
    st.subheader("👤 Thiết lập Người Dùng & Phân Quyền")

    selected_role_label = st.radio(
        "Chọn vai trò đăng nhập:",
        ["👤 Nhân viên (User)", "🔑 Cán bộ Quản lý (Admin)"],
        index=0
    )

    if "Admin" in selected_role_label:
        current_role = ROLE_ADMIN
        user_name = "Trần Huy Hoàng"
        department = "Phòng Hành chính – Quản trị"
        st.success(f"**Đã cấp quyền:** `{current_role.upper()}` (Toàn quyền quản trị kho)")
    else:
        current_role = ROLE_USER
        user_name = "Nguyễn Hoàng Long"
        department = "Phòng Marketing"
        st.info(f"**Vai trò:** `{current_role.upper()}` (Tra cứu, hỏi sửa lỗi, mượn đồ)")

    st.markdown(f"**Người dùng:** {user_name}  \n**Phòng ban:** {department}")

    st.markdown("---")
    st.subheader("ℹ️ Thông Tin Đề Tài")
    st.markdown(
        """
        - **Sinh viên:** Trần Huy Hoàng
        - **MSSV:** `20237337`
        - **Đơn vị thử nghiệm:** Phòng Hành chính - Quản trị
        - **Kiến trúc:** LangGraph Multi-Agent
        """
    )

    if st.button("🔄 Xóa lịch sử chat", use_container_width=True):
        st.session_state.messages = [st.session_state.messages[0]]
        st.rerun()

# ----------------- MAIN INTERFACE TABS -----------------
tab_chat, tab_inventory, tab_safe_stock, tab_tickets, tab_manuals = st.tabs([
    "💬 Trợ Lý Hội Thoại (Multi-Agent)",
    "📦 Danh Mục Vật Tư & Kho",
    "🧠 Thẩm Định Cấp Phát (AIM-RM)",
    "📋 Phiếu Sửa Chữa & Duyệt Đơn",
    "📖 Sổ Tay Tri Thức Theo Model"
])

# ----------------- TAB 1: KHUNG CHAT MULTI-AGENT -----------------
with tab_chat:
    st.subheader("Trợ Lý AI Tương Tác Tự Nhiên")

    # Gợi ý câu hỏi nhanh
    st.markdown("**Gợi ý thao tác nhanh:**")
    col_q1, col_q2, col_q3, col_q4 = st.columns(4)
    quick_prompt = None

    with col_q1:
        if st.button("📄 Tồn kho giấy A4?", use_container_width=True):
            quick_prompt = "Kho phòng mình còn bao nhiêu ram giấy in A4 Double A?"
    with col_q2:
        if st.button("📽️ Máy chiếu No Signal?", use_container_width=True):
            quick_prompt = "Máy chiếu ở phòng họp 3 cắm laptop vào mà nó cứ báo No Signal màn hình xanh lè!"
    with col_q3:
        if st.button("🖨️ Sửa máy in kẹt giấy?", use_container_width=True):
            quick_prompt = "Máy in Canon 2900 bị kẹt giấy thì gỡ thế nào?"
    with col_q4:
        if st.button("📊 Vẽ biểu đồ kho?", use_container_width=True):
            quick_prompt = "Vẽ biểu đồ thống kê tồn kho vật tư"

    # Hiển thị lịch sử hội thoại
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if "image_path" in msg and msg["image_path"]:
                st.image(msg["image_path"], caption="Biểu đồ thống kê", width=650)
            if "docx_path" in msg and msg["docx_path"]:
                path_obj = Path(msg["docx_path"])
                if path_obj.exists():
                    with open(path_obj, "rb") as f:
                        st.download_button(
                            label=f"📥 Tải biểu mẫu: {path_obj.name}",
                            data=f.read(),
                            file_name=path_obj.name,
                            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )

    # Khung upload ảnh hóa đơn (Dành cho chức năng Vision AI)
    with st.expander("📷 Nhập kho bằng ảnh hóa đơn/phiếu giao hàng (Chức năng OCR)"):
        uploaded_img = st.file_uploader("Tải lên ảnh phiếu giao hàng của nhà cung cấp", type=["png", "jpg", "jpeg"])
        if uploaded_img is not None:
            st.image(uploaded_img, caption="Ảnh phiếu giao hàng nhận được", width=350)
            if st.button("🚀 Bóc tách bảng bằng Vision AI"):
                if current_role != ROLE_ADMIN:
                    st.error("🚫 Bạn không có quyền Admin! Chức năng này chỉ dành cho Cán bộ Quản lý kho.")
                else:
                    with st.spinner("Đang sử dụng mô hình Vision AI bóc tách bảng chứng từ..."):
                        res = process_user_request(
                            "nhập kho bằng ảnh phiếu giao hàng",
                            role=current_role,
                            user_name=user_name,
                            department=department,
                            image_source=uploaded_img
                        )
                        st.success(res["response"])
                        if "items" in res.get("data", {}):
                            st.write("📋 **Danh sách mặt hàng trích xuất:**")
                            st.table(res["data"]["items"])
                            if st.button("✅ [Human-in-the-Loop] Duyệt Cập Nhật Vào CSDL Kho"):
                                updated_count = 0
                                for item in res["data"]["items"]:
                                    t_id = item.get("target_id")
                                    if t_id is not None:
                                        commit_stock_transaction(
                                            asset_id=t_id,
                                            transaction_type="IN",
                                            quantity=item["quantity"],
                                            provider_or_dept=res["data"].get("provider", "Nhà cung cấp"),
                                            notes=f"Nhập tự động từ hóa đơn {res['data'].get('invoice_number')} (Qwen2.5-VL Layout Parser)"
                                        )
                                        updated_count += 1
                                st.success(f"🎉 Đã cập nhật cộng dồn số lượng cho {updated_count} mặt hàng vào CSDL thành công!")
                                st.rerun()

    # Nhận câu hỏi từ chat input
    user_input = st.chat_input("Nhập câu hỏi hoặc yêu cầu hỗ trợ...") or quick_prompt

    if user_input:
        # Thêm câu hỏi người dùng
        st.session_state.messages.append({"role": "user", "content": user_input})
        with st.chat_message("user"):
            st.markdown(user_input)

        # Agent xử lý thông qua LangGraph
        with st.chat_message("assistant"):
            with st.spinner("Office Asset Agent đang xử lý..."):
                result = process_user_request(
                    message=user_input,
                    role=current_role,
                    user_name=user_name,
                    department=department
                )

                st.markdown(result["response"])
                assistant_msg = {"role": "assistant", "content": result["response"]}

                # Nếu có biểu đồ được tạo ra
                if result.get("data", {}).get("chart_path"):
                    c_path = result["data"]["chart_path"]
                    st.image(c_path, caption="Biểu đồ thống kê", width=650)
                    assistant_msg["image_path"] = c_path

                # Nếu có file docx phiếu báo hỏng được sinh tự động
                if result.get("data", {}).get("docx_path"):
                    d_path = Path(result["data"]["docx_path"])
                    if d_path.exists():
                        with open(d_path, "rb") as f:
                            st.download_button(
                                label=f"📥 Tải biểu mẫu: {d_path.name}",
                                data=f.read(),
                                file_name=d_path.name,
                                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            )
                        assistant_msg["docx_path"] = str(d_path)

                st.session_state.messages.append(assistant_msg)

# ----------------- TAB 2: QUẢN TRỊ KHO & VẬT TƯ -----------------
with tab_inventory:
    st.subheader("📦 Cơ Sở Dữ Liệu Vật Tư & Thiết Bị Phòng Ban")
    metrics = calculate_inventory_metrics()

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Tổng danh mục", f"{metrics['total_items']} mặt hàng")
    c2.metric("Vật tư tiêu hao", f"{metrics['consumables_count']}")
    c3.metric("Thiết bị dùng chung", f"{metrics['devices_count']}")
    c4.metric("Tổng định giá tài sản", metrics['total_valuation_str'] if current_role == ROLE_ADMIN else "🔒 Cần quyền Admin")

    st.markdown("---")
    assets = get_all_assets()
    st.dataframe(assets, use_container_width=True)

    if current_role == ROLE_ADMIN:
        with st.expander("➕ Cán bộ xuất / nhập kho trực tiếp"):
            with st.form("manual_tx_form"):
                col_a, col_b, col_c = st.columns(3)
                with col_a:
                    selected_asset_name = st.selectbox("Chọn mặt hàng:", [a["name"] for a in assets])
                with col_b:
                    tx_type = st.selectbox("Loại giao dịch:", ["Nhập kho (IN)", "Xuất kho (OUT)"])
                with col_c:
                    tx_qty = st.number_input("Số lượng:", min_value=1, value=5, step=1)

                target_dept = st.text_input("Đơn vị đối tác / Phòng ban:", "Phòng Ban Chức Năng")
                submit_tx = st.form_submit_button("Xác nhận ghi nhận giao dịch")

                if submit_tx:
                    target_asset = next(a for a in assets if a["name"] == selected_asset_name)
                    t_type = "IN" if "IN" in tx_type else "OUT"
                    res = commit_stock_transaction(
                        asset_id=target_asset["id"],
                        transaction_type=t_type,
                        quantity=tx_qty,
                        provider_or_dept=target_dept,
                        notes="Thực hiện thủ công từ giao diện Quản trị"
                    )
                    if res["success"]:
                        st.success(res["message"])
                        st.rerun()
                    else:
                        st.error(res["message"])

# ----------------- TAB 3: THẨM ĐỊNH CẤP PHÁT (AIM-RM & SAFE-STOCK) -----------------
with tab_safe_stock:
    st.subheader("🧠 Thẩm Định Đơn Xin Cấp Phát Vật Tư (AIM-RM & Safe-Stock Strategy)")
    st.markdown(
        "*Ứng dụng kiến trúc AIM-RM (arXiv:2602.05524) kết hợp lý thuyết tồn kho an toàn để ngăn chặn "
        "quyết định cảm tính, hiện tượng roi da (Bullwhip Effect) và chống ảo giác số học.*"
    )

    with st.form("aim_rm_audit_form"):
        col_s1, col_s2, col_s3 = st.columns(3)
        with col_s1:
            audit_dept = st.selectbox(
                "Phòng ban yêu cầu cấp phát:",
                ["Phòng Marketing", "Phòng Kế toán", "Phòng Kỹ thuật", "Phòng Nhân sự", "Ban Giám đốc"]
            )
        with col_s2:
            assets_items = get_all_assets()
            audit_item_name = st.selectbox(
                "Mặt hàng xin cấp:",
                [a["name"] for a in assets_items]
            )
        with col_s3:
            audit_qty = st.number_input("Số lượng đề xuất cấp:", min_value=1, value=15, step=1)

        run_audit_btn = st.form_submit_button("🔍 Thẩm Định & Tra Cứu Bộ Nhớ Lịch Sử (AIM-RM)")

    if run_audit_btn:
        with st.spinner("Đang truy xuất kịch bản tương đồng từ bộ nhớ và tính toán Dynamic Safe-Stock..."):
            eval_res = evaluate_allocation_request(
                department=audit_dept,
                item_query=audit_item_name,
                requested_qty=audit_qty
            )
            if eval_res["status"] == "success":
                # Thống kê nhanh
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Tồn kho hiện tại", f"{eval_res['current_onhand']} {eval_res['unit']}")
                m2.metric("Dự kiến sau cấp", f"{eval_res['projected_stock_after']} {eval_res['unit']}")
                m3.metric("Tồn kho an toàn (S_safe)", f"{eval_res['safe_stock_benchmark']} {eval_res['unit']}")
                m4.metric("Trung bình lịch sử", f"{eval_res['historical_mean']} {eval_res['unit']}")

                st.markdown("---")
                st.markdown(eval_res["recommendation"])

                st.markdown("#### 📜 Kịch bản tương đồng trong bộ nhớ lịch sử (Top Similar Episodes):")
                if eval_res["similar_episodes"]:
                    st.dataframe(eval_res["similar_episodes"], use_container_width=True)

                if current_role == ROLE_ADMIN and eval_res["decision_code"] != "REJECT_INSUFFICIENT_STOCK":
                    st.markdown("---")
                    col_appr1, col_appr2 = st.columns([2, 1])
                    with col_appr1:
                        st.info("Cán bộ có quyền phê duyệt xuất kho trực tiếp theo khuyến nghị của AIM-RM.")
                    with col_appr2:
                        if st.button("✅ [Cán bộ Phê duyệt Xuất Kho]", key="btn_approve_aim_rm"):
                            tx_res = commit_stock_transaction(
                                asset_id=eval_res["asset_id"],
                                transaction_type="OUT",
                                quantity=audit_qty,
                                provider_or_dept=audit_dept,
                                notes=f"Duyệt qua AIM-RM Safe-Stock (Z-Score: {eval_res['z_score']})"
                            )
                            if tx_res["success"]:
                                st.success(tx_res["message"])
                                st.rerun()
                            else:
                                st.error(tx_res["message"])

# ----------------- TAB 4: DANH SÁCH PHIẾU BÁO HỎNG & DUYỆT ĐƠN -----------------
with tab_tickets:
    st.subheader("📋 Danh Sách Phiếu Báo Hỏng Thiết Bị (Maintenance Tickets)")
    db = SessionLocal()
    try:
        tickets = db.query(MaintenanceTicket).order_by(MaintenanceTicket.created_at.desc()).all()
        if not tickets:
            st.info("Chưa có phiếu báo hỏng nào được tạo.")
        else:
            for t in tickets:
                with st.container(border=True):
                    col_t1, col_t2 = st.columns([3, 1])
                    with col_t1:
                        st.markdown(f"### Mã phiếu: `{t.ticket_code}` — **{t.device_name}**")
                        st.markdown(f"* **Người báo:** {t.requester_name} ({t.department}) | **Vị trí:** {t.location}")
                        st.markdown(f"* **Hiện trạng:** {t.symptom}")
                        st.markdown(f"* **Đề xuất:** {t.proposed_solution}")
                        st.markdown(f"* **Trạng thái:** `{t.status}`")
                    with col_t2:
                        if t.docx_path and Path(t.docx_path).exists():
                            with open(t.docx_path, "rb") as f:
                                st.download_button(
                                    label="📥 Tải file Word (.docx)",
                                    data=f.read(),
                                    file_name=Path(t.docx_path).name,
                                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                    key=f"dl_{t.ticket_code}"
                                )
                        if current_role == ROLE_ADMIN and t.status == "PENDING_APPROVAL":
                            if st.button("✅ [Duyệt sửa chữa]", key=f"appr_{t.ticket_code}"):
                                t.status = "APPROVED"
                                t.approved_by = user_name
                                db.commit()
                                st.success("Đã duyệt phiếu thành công!")
                                st.rerun()
    finally:
        db.close()

# ----------------- TAB 5: SỔ TAY TRI THỨC THEO MODEL -----------------
with tab_manuals:
    st.subheader("📖 Cơ Sở Tri Thức Kỹ Thuật (Đã Nạp & Làm Giàu)")
    db = SessionLocal()
    try:
        docs = db.query(KnowledgeDoc).all()
        for d in docs:
            with st.expander(f"📌 Model: {d.model_name} — {d.title}"):
                st.markdown(f"**Phân loại:** `{d.device_type}` | **Nguồn:** *{d.source_url}*")
                st.markdown("#### Hướng dẫn vận hành:")
                st.markdown(d.manual_text)
                st.markdown("#### Bảng mã lỗi & Cách khắc phục:")
                st.markdown(d.troubleshooting_guide)
    finally:
        db.close()

    st.markdown("---")
    st.subheader("🌐 Tự Động Làm Giàu Tri Thức Cho Model Mới")
    with st.form("enrich_form"):
        new_model_input = st.text_input("Nhập mã Model thiết bị cần tìm kiếm tài liệu (VD: Canon LBP 3300, Epson EB-E01, HP 1020):")
        enrich_submit = st.form_submit_button("🔍 Tìm kiếm trên Internet & Tự Động Nạp Tri Thức")
        if enrich_submit and new_model_input:
            with st.spinner(f"Agent đang tìm kiếm tài liệu chính hãng cho model '{new_model_input}'..."):
                res = process_user_request(f"Tìm tài liệu model {new_model_input}", role=current_role)
                st.success(res["response"])
                st.rerun()
