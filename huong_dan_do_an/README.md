# 📚 TRUNG TÂM HƯỚNG DẪN ĐỒ ÁN TOÀN DIỆN (15 TUẦN HỌC KỲ CHUẨN)
### Giáo Trình Đào Tạo Cầm Tay Chỉ Việc Dành Cho Sinh Viên Chưa Có Nền Tảng (Zero-to-Hero)
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp (*Office Asset Agent*)  
> **Sinh viên thực hiện:** Trần Huy Hoàng — MSSV: `20237337`  
> **Đơn vị đào tạo:** Trường Công nghệ Thông tin & Truyền thông — Đại học Bách khoa Hà Nội  
> **Đơn vị thử nghiệm:** Phòng Hành chính – Quản trị (Ban Quản lý Cơ sở vật chất Doanh nghiệp)

---

## 🗺️ 1. Khung Chương Trình Đào Tạo 15 Tuần Học Kỳ

Chương trình được thiết kế đặc biệt cho sinh viên **chưa học hoặc chưa nắm vững các môn tiên quyết** (Lập trình nâng cao, Cơ sở dữ liệu quan hệ, Kỹ nghệ phần mềm, AI/NLP):

```
GIAI ĐOẠN 1: NỀN TẢNG NGHIỆP VỤ, LẬP TRÌNH & CƠ SỞ DỮ LIỆU (Tuần 1 - 4)
├── Tuần 01: Khảo sát nghiệp vụ đời thực & Nỗi đau quản trị cơ sở vật chất
├── Tuần 02: Thiết lập môi trường kỹ sư (Terminal, Python 3.11, venv, Git)
├── Tuần 03: Bản chất Cơ sở dữ liệu quan hệ (RDBMS), Khóa chính/ngoại & ERD
└── Tuần 04: Lập trình CSDL với SQLite & SQLAlchemy ORM (CRUD, Transaction ACID)

GIAI ĐOẠN 2: THIẾT KẾ DỮ LIỆU & BỘ CÔNG CỤ TÁC VỤ (TOOLS) (Tuần 5 - 8)
├── Tuần 05: Thiết kế CSDL chi tiết & Thuật toán Token/Alias Matching
├── Tuần 06: Chế tạo Tool 1: Máy tính tồn kho tất định & Bài toán arXiv:2602.12631
├── Tuần 07: Chế tạo Tool 2: Cào web tự động làm giàu tri thức & Fallback an toàn
└── Tuần 08: Chế tạo Tool 3 & 4: Sinh file Word (.docx), Biểu đồ & Thị giác AI (OCR)

GIAI ĐOẠN 3: BỘ NÃO AI AGENT & ĐIỀU PHỐI LANGGRAPH (Tuần 9 - 11)
├── Tuần 09: Bản chất AI: Từ Chatbot, LLM đến AI Agent (ReAct Framework)
├── Tuần 10: Nhập môn LangGraph: Điều phối luồng trạng thái (StateGraph)
└── Tuần 11: Xây dựng hệ thống Đa Agent (Multi-Agent) & Quy trình 3 bước xử lý lỗi

GIAI ĐOẠN 4: BẢO MẬT, GIAO DIỆN WEB & TÍCH HỢP HỆ THỐNG (Tuần 12 - 13)
├── Tuần 12: Bảo mật phân quyền 2 vai trò (RBAC) & Giám sát con người (Human-in-the-Loop)
└── Tuần 13: Xây dựng Giao diện Web tương tác với Streamlit (Session State, 4 Tabs)

GIAI ĐOẠN 5: KIỂM THỬ, THỬ NGHIỆM THỰC TẾ & BẢO VỆ ĐỒ ÁN (Tuần 14 - 15)
├── Tuần 14: Kiểm thử tự động Pytest (8/8 tests) & Đo lường hiệu quả định lượng
└── Tuần 15: Biên soạn báo cáo tốt nghiệp & Tuyệt chiêu vấn đáp Hội đồng chuẩn Điểm 10
```

---

## 📑 2. Danh Mục Tài Liệu Học Tập

### 🌟 Sách Giáo Trình Toàn Tập 15 Tuần
* [**`GIAO_TRINH_15_TUAN_TOAN_TAP.md`**](GIAO_TRINH_15_TUAN_TOAN_TAP.md): Phiên bản Markdown đầy đủ, trực quan, đọc trực tiếp trên GitHub hoặc VS Code.
* [**`giao_trinh_do_an_15_tuan.tex`**](giao_trinh_do_an_15_tuan.tex): Mã nguồn LaTeX cuốn sách giáo trình 15 tuần chuẩn học thuật.
* [**`giao_trinh_do_an_15_tuan.pdf`**](giao_trinh_do_an_15_tuan.pdf): Bản in PDF hoàn chỉnh **12 trang dày dặn** có Mục lục, phân chia 5 phần rõ ràng, sẵn sàng in ấn nộp Khoa/Bộ môn.

---

### 🔹 Bộ Cẩm Nang Chuyên Sâu Từng Chủ Đề (Markdown)

| Tên Tài Liệu | Nội Dung & Mục Đích |
| :--- | :--- |
| [**`00_NHAP_MON_DANH_CHO_NGUOI_MOI_BAT_DAU.md`**](00_NHAP_MON_DANH_CHO_NGUOI_MOI_BAT_DAU.md) | Nhập môn AI Agent từ con số 0, giải thích bối cảnh thực tế, bài toán ảo giác LLM (Hallucination Tax arXiv:2602.12631), LangGraph qua hình ảnh tàu điện ngầm. |
| [**`01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md`**](01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md) | Giải phẫu chi tiết toàn bộ mã nguồn từng file trong `src/` (core, models, tools, agents, ui), luồng dữ liệu 3 kịch bản thực tế. |
| [**`02_BO_BI_KIP_VAN_DAP_HOI_DONG.md`**](02_BO_BI_KIP_VAN_DAP_HOI_DONG.md) | Bộ 25 câu hỏi vấn đáp hóc búa nhất của Hội đồng chấm thi ĐATN Bách Khoa kèm đáp án chuẩn điểm 10. |
| [**`03_HUONG_DAN_THUC_HANH_VA_MO_RONG.md`**](03_HUONG_DAN_THUC_HANH_VA_MO_RONG.md) | Hướng dẫn cài đặt môi trường, chạy test `pytest`, thao tác web demo và 3 bài thực hành tự mở rộng hệ thống. |

---

### 🔹 Các Ấn Phẩm Chuyên Đề Tuần (LaTeX & PDF)

| Chuyên Đề | Tên Chuyên Đề Học Thuật | File LaTeX | Bản In PDF |
| :---: | :--- | :---: | :---: |
| **Tuần 01** | Khảo sát nghiệp vụ thực tế & Thiết kế CSDL | [`tuan_01.tex`](tuan_01_nghiep_vu_va_thiet_ke_csdl.tex) | [**`tuan_01.pdf`**](tuan_01_nghiep_vu_va_thiet_ke_csdl.pdf) |
| **Tuần 02** | Python nền tảng, kết nối SQLite & SQLAlchemy ORM | [`tuan_02.tex`](tuan_02_lap_trinh_python_va_sqlalchemy.tex) | [**`tuan_02.pdf`**](tuan_02_lap_trinh_python_va_sqlalchemy.pdf) |
| **Tuần 03** | Bản chất AI Agent, Chống ảo giác số học & LangGraph | [`tuan_03.tex`](tuan_03_ai_agent_va_langgraph_co_ban.tex) | [**`tuan_03.pdf`**](tuan_03_ai_agent_va_langgraph_co_ban.pdf) |
| **Tuần 04** | Chế tạo bộ công cụ (Tools) tác vụ cho Agent | [`tuan_04.tex`](tuan_04_che_tao_bo_cong_cu_tools.tex) | [**`tuan_04.pdf`**](tuan_04_che_tao_bo_cong_cu_tools.pdf) |
| **Tuần 05** | Bộ điều phối đa Agent (LangGraph), RBAC & Web Streamlit | [`tuan_05.tex`](tuan_05_dieu_phoi_agent_va_giao_dien_web.tex) | [**`tuan_05.pdf`**](tuan_05_dieu_phoi_agent_va_giao_dien_web.pdf) |
| **Tuần 06** | Thử nghiệm thực tế, Viết báo cáo & Chiến lược vấn đáp | [`tuan_06.tex`](tuan_06_bao_cao_tot_nghiep_va_van_dap.tex) | [**`tuan_06.pdf`**](tuan_06_bao_cao_tot_nghiep_va_van_dap.pdf) |

---

## ⚡ 3. Hướng Dẫn Vận Hành & Biên Dịch

```bash
# 1. Kích hoạt môi trường ảo và chạy test
source .venv/bin/activate
PYTHONPATH=. .venv/bin/pytest tests/test_system.py -v

# 2. Khởi chạy Web Demo
.venv/bin/streamlit run src/ui/app.py

# 3. Biên dịch lại sách giáo trình 15 tuần sang PDF
cd huong_dan_do_an
pdflatex -interaction=nonstopmode giao_trinh_do_an_15_tuan.tex
```

---
*Chúc bạn học tập hiệu quả, vững tin với giáo trình 15 tuần và bảo vệ thành công rực rỡ!*
