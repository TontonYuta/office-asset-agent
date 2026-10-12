# 📚 TRUNG TÂM HƯỚNG DẪN ĐỒ ÁN TOÀN DIỆN (LEARNING & DEFENSE HUB)
### Cẩm Nang Cầm Tay Chỉ Việc Dành Cho Sinh Viên Chưa Có Nền Tảng (Zero-to-Hero)
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp (*Office Asset Agent*)  
> **Sinh viên thực hiện:** Trần Huy Hoàng — MSSV: `20237337`  
> **Đơn vị đào tạo:** Trường Công nghệ Thông tin & Truyền thông — Đại học Bách khoa Hà Nội  
> **Đơn vị thử nghiệm:** Phòng Hành chính – Quản trị (Ban Quản lý Cơ sở vật chất Doanh nghiệp)

---

## 🎯 1. Lộ Trình Học Tập 3 Giai Đoạn Dành Cho Người Mới Bắt Đầu

Nếu bạn chưa từng làm việc với AI Agent, Python nâng cao hay CSDL, hãy đọc tài liệu theo đúng lộ trình 3 giai đoạn dưới đây:

```
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: NẮM VỮNG BẢN CHẤT TỪ CON SỐ 0 (Không Cần Biết Code)        │
│ 1. Đọc: 00_NHAP_MON_DANH_CHO_NGUOI_MOI_BAT_DAU.md                      │
│ 2. Đọc: tuan_01_nghiep_vu_va_thiet_ke_csdl.pdf                         │
│ 3. Đọc: tuan_03_ai_agent_va_langgraph_co_ban.pdf (Ảo giác LLM)         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: LÀM CHỦ TOÀN BỘ MÃ NGUỒN & THỰC HÀNH TỰ TAY CHẠY THỬ      │
│ 1. Đọc: 01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md                           │
│ 2. Làm theo: 03_HUONG_DAN_THUC_HANH_VA_MO_RONG.md                      │
│ 3. Đọc: tuan_04_che_tao_bo_cong_cu_tools.pdf & tuan_05_web.pdf         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: LUYỆN THI VẤN ĐÁP HỘI ĐỒNG & CHUẨN BỊ BẢO VỆ ĐỒ ÁN        │
│ 1. Luyện: 02_BO_BI_KIP_VAN_DAP_HOI_DONG.md (25 câu hỏi hiểm hóc)       │
│ 2. Đọc: tuan_06_bao_cao_tot_nghiep_va_van_dap.pdf                      │
│ 3. Mở web demo: http://localhost:8501 biểu diễn trước Hội đồng         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 2. Danh Mục Tài Liệu Cốt Lõi Trong Thư Mục

### 🔹 Phần A: Bộ Cẩm Nang Markdown Siêu Chi Tiết (Đọc Trực Tiếp Trên GitHub / VS Code)

| Tên Tài Liệu | Nội Dung Chính & Mục Đích | Đối Tượng Phù Hợp |
| :--- | :--- | :---: |
| [**`00_NHAP_MON_DANH_CHO_NGUOI_MOI_BAT_DAU.md`**](00_NHAP_MON_DANH_CHO_NGUOI_MOI_BAT_DAU.md) | Giải thích bài toán đời thực, tại sao AI dốt toán (Hallucination Tax arXiv:2602.12631), LangGraph là gì dưới góc nhìn tàu điện ngầm, ORM là gì, bảo mật RBAC và Human-in-the-Loop. | Sinh viên chưa có nền tảng |
| [**`01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md`**](01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md) | Mổ xẻ từng file, từng hàm, từng biến trong `src/` (config, database, security, models, tools, agents, ui). Vẽ luồng dữ liệu 3 ca thử nghiệm thực tế. | Người muốn hiểu sâu mã nguồn |
| [**`02_BO_BI_KIP_VAN_DAP_HOI_DONG.md`**](02_BO_BI_KIP_VAN_DAP_HOI_DONG.md) | Tuyển tập **25 câu hỏi vấn đáp hóc búa nhất** của các thầy cô Hội đồng ĐATN Bách Khoa kèm đáp án chuẩn điểm 10 và luận điểm phản biện đanh thép. | Luyện thi bảo vệ tốt nghiệp |
| [**`03_HUONG_DAN_THUC_HANH_VA_MO_RONG.md`**](03_HUONG_DAN_THUC_HANH_VA_MO_RONG.md) | Hướng dẫn cài môi trường bằng `uv`/`venv`, chạy test `pytest`, thao tác 4 ca demo trên web, 3 bài thực hành tự thêm mặt hàng mới, cào model mới và nối API Key LLM. | Cầm tay chỉ việc thực hành |

---

### 🔹 Phần B: Sổ Tay Hướng Dẫn Học Thuật 6 Tuần (LaTeX & Ấn Phẩm PDF)

Toàn bộ 6 chuyên đề được biên soạn theo chuẩn học thuật sư phạm, đã được biên dịch sẵn sang file PDF chất lượng cao:

| Tuần | Tên Chuyên Đề Học Thuật | Mã Nguồn LaTeX | Bản In PDF Chuẩn | Trạng Thái |
| :---: | :--- | :---: | :---: | :---: |
| **Tuần 01** | Khảo sát nghiệp vụ thực tế & Thiết kế Cơ sở dữ liệu quan hệ | [`tuan_01.tex`](tuan_01_nghiep_vu_va_thiet_ke_csdl.tex) | [**`tuan_01.pdf`**](tuan_01_nghiep_vu_va_thiet_ke_csdl.pdf) | ✅ Đã phát hành |
| **Tuần 02** | Lập trình Python & Tương tác CSDL SQLite/SQLAlchemy | [`tuan_02.tex`](tuan_02_lap_trinh_python_va_sqlalchemy.tex) | [**`tuan_02.pdf`**](tuan_02_lap_trinh_python_va_sqlalchemy.pdf) | ✅ Đã phát hành |
| **Tuần 03** | Khái niệm AI Agent & Chống ảo giác số học (*Hallucination Tax*) | [`tuan_03.tex`](tuan_03_ai_agent_va_langgraph_co_ban.tex) | [**`tuan_03.pdf`**](tuan_03_ai_agent_va_langgraph_co_ban.pdf) | ✅ Đã phát hành |
| **Tuần 04** | Chế tạo các Tool (Tính kho, cào web, sinh file Word & biểu đồ) | [`tuan_04.tex`](tuan_04_che_tao_bo_cong_cu_tools.tex) | [**`tuan_04.pdf`**](tuan_04_che_tao_bo_cong_cu_tools.pdf) | ✅ Đã phát hành |
| **Tuần 05** | Bộ điều phối LangGraph, phân quyền RBAC & Giao diện Streamlit | [`tuan_05.tex`](tuan_05_dieu_phoi_agent_va_giao_dien_web.tex) | [**`tuan_05.pdf`**](tuan_05_dieu_phoi_agent_va_giao_dien_web.pdf) | ✅ Đã phát hành |
| **Tuần 06** | Thử nghiệm thực tế tại phòng ban, viết báo cáo & Thi vấn đáp | [`tuan_06.tex`](tuan_06_bao_cao_tot_nghiep_va_van_dap.tex) | [**`tuan_06.pdf`**](tuan_06_bao_cao_tot_nghiep_va_van_dap.pdf) | ✅ Đã phát hành |

---

## ⚡ 3. Lệnh Nhanh Vận Hành Hệ Thống

```bash
# 1. Kích hoạt môi trường ảo
source .venv/bin/activate

# 2. Chạy kiểm thử tự động 8/8 tests
PYTHONPATH=. .venv/bin/pytest tests/test_system.py -v

# 3. Khởi chạy giao diện Web
.venv/bin/streamlit run src/ui/app.py
```
👉 Truy cập giao diện tại: **http://localhost:8501**

---

## 🖨️ 4. Cách Biên Dịch Lại Các File LaTeX Sang PDF (Khi Có Chỉnh Sửa)

Nếu bạn có thêm ghi chú cá nhân vào các file `.tex`, bạn có thể biên dịch lại bằng lệnh sau trong Terminal:

```bash
cd huong_dan_do_an
pdflatex -interaction=nonstopmode tuan_01_nghiep_vu_va_thiet_ke_csdl.tex
```

---
*Chúc bạn hoàn thành xuất sắc đồ án và tự tin đạt điểm tuyệt đối trước Hội đồng chấm thi!*
