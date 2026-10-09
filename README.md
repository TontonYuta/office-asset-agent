# 🏢 Office Asset Agent
### Hệ Thống Agent AI Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/Orchestrator-LangGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen.svg)]()

> **Đề tài Đồ án Tốt nghiệp:** Xây dựng Hệ thống Agent Hỗ trợ Tra cứu Thống kê và Tự động hóa Quản lý Vật tư - Thiết bị tại Phòng ban Doanh nghiệp  
> **Sinh viên thực hiện:** Trần Huy Hoàng  
> **MSSV:** 20237337  
> **Đơn vị áp dụng thử nghiệm:** Phòng Hành chính – Quản trị (Ban Quản lý Cơ sở vật chất Doanh nghiệp)

---

## 📌 1. Bối Cảnh & Bài Toán Thực Tế

Tại hầu hết các phòng ban chức năng của doanh nghiệp (như Phòng Hành chính – Quản trị, Quản trị Cơ sở vật chất), công tác theo dõi vật tư và thiết bị hiện nay vẫn phụ thuộc lớn vào việc ghi chép sổ tay hoặc file Excel tự lập. Điều này dẫn đến 3 bất cập lớn:
1. **Nhập kho thủ công tốn thời gian:** Mỗi đợt nhà cung cấp giao vật tư kèm hóa đơn giấy, cán bộ phải gõ tay từng dòng vào Excel, rất dễ nhầm lẫn số lượng và đơn giá.
2. **Cán bộ thường xuyên bị gián đoạn công việc:** Nhân viên liên tục hỏi số lượng tồn kho hoặc nhờ sửa các sự cố kỹ thuật thông thường (máy in kẹt giấy, máy in báo offline, máy chiếu phòng họp không nhận hình HDMI, micro bị hú rít).
3. **Cán bộ không có thời gian soạn cẩm nang:** Doanh nghiệp có hàng chục dòng máy khác nhau, không có nhân sự nào rảnh để ngồi gõ tay hàng chục trang cẩm nang hướng dẫn sử dụng và bảng mã lỗi cho từng model.

**Office Asset Agent** ra đời nhằm giải quyết triệt để các vấn đề trên thông qua một trợ lý AI tương tác tự nhiên, thông minh và an toàn.

---

## 🚀 2. Các Điểm Đột Phá Công Nghệ Của Hệ Thống

### 🔍 2.1. Tự Động Làm Giàu Tri Thức Thiết Bị (Self-Enriching Knowledge Agent)
- Khi phòng ban khai báo một thiết bị mới kèm **Mã sản phẩm / Model** (ví dụ: `Canon LBP 2900`, `Epson EB-X06`, `HP LaserJet M404dn`) hoặc chụp ảnh tem thông số sau thân máy.
- Agent tự động kích hoạt công cụ tìm kiếm trên internet (`duckduckgo_search`), cào tài liệu hướng dẫn chính hãng (*User Manual / Service Manual*), trích xuất bảng mã lỗi và sơ đồ vận hành, sau đó lưu vào CSDL tri thức nội bộ.
- **Lợi ích:** Cán bộ không cần gõ cẩm nang thủ công; hệ thống tự hoàn thiện dữ liệu chỉ sau vài giây.

### 🛠️ 2.2. Trợ Lý Khắc Phục Sự Cố Kỹ Thuật & Tự Động Lập Phiếu Báo Hỏng
- Khi nhân viên gặp sự cố thiết bị dùng chung, Agent tra cứu đúng hồ sơ kỹ thuật số của dòng máy đó để hướng dẫn khắc phục từng bước (gỡ kẹt giấy đúng khớp ray, phím tắt `Win + P` Duplicate cho máy chiếu, cách thay pin mic).
- Nếu người dùng làm theo hướng dẫn mà thiết bị vẫn không hoạt động, Agent **tự động điền dữ liệu vào mẫu Word/PDF Phiếu Yêu Cầu Sửa Chữa (Maintenance Ticket)** và gửi thông báo khẩn cấp cho cán bộ quản lý phê duyệt gọi bảo hành.

### 📷 2.3. Nhập Kho Tự Động Bằng Thị Giác AI (Vision OCR)
- Cán bộ chụp ảnh phiếu giao hàng của nhà cung cấp gửi vào khung chat.
- Hệ thống sử dụng mô hình thị giác AI (`Qwen2.5-VL` kết hợp thư viện `Docling`) bóc tách chính xác bảng danh mục: tên hàng, số lượng thực giao, đơn giá, thành tiền.

### 🧮 2.4. Tính Toán Số Học Chuẩn Xác Bằng Code (Deterministic Code Execution)
- Khắc phục triệt để lỗi "ảo giác tính nhẩm" của LLM (được công bố trong bài báo *arXiv:2602.12631*).
- AI chỉ làm nhiệm vụ hiểu ý định câu hỏi tiếng Việt của người dùng; toàn bộ việc tính toán cộng trừ tồn kho và nhân chia thành tiền được giao hoàn toàn cho code Python và SQL thực hiện, đảm bảo kết quả chính xác 100%.

### 🔐 2.5. Phân Quyền 2 Vai Trò (RBAC) & Con Người Duyệt (Human-in-the-Loop)
- **Nhân viên (User):** Tra cứu kho bằng ngôn ngữ tự nhiên ("bút dạ xanh", "mực phòng sếp"), hỏi HDSD & cách sửa lỗi thiết bị, gửi yêu cầu mượn đồ.
- **Cán bộ quản lý (Admin):** Nhập kho bằng ảnh, xem tổng chi phí, bấm nút duyệt đơn, xuất báo cáo và tự động vẽ biểu đồ trực quan (`Matplotlib`). Mọi thay đổi về kho đều bắt buộc có thao tác bấm duyệt của cán bộ.

---

## 🏛️ 3. Kiến Trúc Hệ Thống

```
                     ┌──────────────────────────────────────────────┐
                     │   Giao Diện Web Chat (Streamlit / FastChat)   │
                     │  Cán bộ Quản lý (Admin)  •  Nhân viên (User) │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │  Cổng Tiếp Nhận: Phân Quyền Vai Trò (RBAC)   │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │   Bộ Điều Phối Trung Tâm (LangGraph Workflow)│
                     └──────┬───────────────────┬───────────────────┘
                            │                   │
            ┌───────────────┴────────┐   ┌──────┴───────────────┐
            │ Khối Tri Thức & Web    │   │ Khối Đọc Ảnh AI      │
            │ • DuckDuckGo Search    │   │ • Qwen2.5-VL         │
            │ • RAG Vector Search    │   │ • Docling Layout     │
            │ • Python / SQL Calc    │   └──────────────┬───────┘
            └───────────────┬────────┘                  │
                            ▼                           ▼
            ┌────────────────────────┐   ┌──────────────────────┐
            │ CSDL Cẩm Nang Kỹ Thuật │   │ CSDL Kho & Phiếu Mẫu │
            │ (Lưu theo Model máy)   │   │ (SQLite/PostgreSQL)  │
            └────────────────────────┘   └──────────────┬───────┘
                                                        │
                                                        ▼
                                         ┌──────────────────────┐
                                         │ Human-in-the-Loop    │
                                         │ Cán bộ bấm [Duyệt]   │
                                         └──────────────────────┘
```

---

## 📁 4. Cấu Trúc Thư Mục Dự Án

```
office-asset-agent/
├── docs/                                # Tài liệu học thuật & nghiệp vụ
│   ├── bao_cao_khao_sat_de_tai.pdf      # Báo cáo kỹ thuật chuẩn 4 trang A4
│   ├── bao_cao_khao_sat_de_tai.tex      # Mã nguồn LaTeX của báo cáo
│   └── HUONG_DAN_SU_DUNG_VA_XU_LY_LOI.md # Sổ tay HDSD & Bảng mã lỗi thiết bị
├── src/
│   ├── core/                            # Cấu hình hệ thống, DB, phân quyền RBAC
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── agents/                          # Các Agent xử lý tác vụ theo LangGraph
│   │   ├── orchestrator.py              # Bộ điều phối luồng chính
│   │   ├── enrich_agent.py              # Agent tự tìm kiếm & làm giàu tri thức
│   │   ├── support_agent.py             # Trợ lý HDSD & chẩn đoán lỗi thiết bị
│   │   └── inventory_agent.py           # Quản lý kho, tính toán & xuất báo cáo
│   ├── tools/                           # Bộ công cụ (Tools) cho Agent
│   │   ├── web_search.py                # Tool tìm kiếm cẩm nang kỹ thuật
│   │   ├── vision_ocr.py                # Tool đọc ảnh phiếu giao hàng
│   │   ├── sql_calculator.py            # Tool tính toán số liệu chính xác
│   │   └── doc_generator.py             # Tool xuất phiếu Word/PDF & vẽ biểu đồ
│   ├── models/                          # Pydantic schemas & SQLAlchemy models
│   │   ├── asset.py
│   │   ├── ticket.py
│   │   └── user.py
│   └── ui/                              # Giao diện Web Chat
│       └── app.py
├── data/                                # Dữ liệu mẫu & mẫu biểu
│   ├── templates/                       # Mẫu Word (.docx) phiếu mượn, báo hỏng
│   └── mock/                            # Dữ liệu Excel vật tư mẫu của phòng ban
├── .gitignore
├── requirements.txt
└── README.md
```

---

## ⚙️ 5. Cài Đặt & Hướng Dẫn Chạy Thử Nghiệm

### Yêu cầu môi trường:
* Python `>= 3.10`
* Hệ điều hành: Linux / macOS / Windows

### Các bước cài đặt:

```bash
# 1. Clone repository
git clone https://github.com/TontonYuta/office-asset-agent.git
cd office-asset-agent

# 2. Tạo môi trường ảo và kích hoạt
python3 -m venv .venv
source .venv/bin/activate  # Trên Windows: .venv\Scripts\activate

# 3. Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# 4. Khởi chạy giao diện thử nghiệm
streamlit run src/ui/app.py
```

---

## 📚 6. Tài Liệu Tham Khảo Cốt Lõi

1. **AI Agents for Inventory Control: Human-LLM-OR Complementarity**, *arXiv:2602.12631*, 2026. [https://arxiv.org/abs/2602.12631](https://arxiv.org/abs/2602.12631)
2. **AI Agent Systems for Supply Chains: Structured Decision Prompts and Memory Retrieval**, *arXiv:2602.05524*, 2026. [https://arxiv.org/abs/2602.05524]
3. **Qwen2.5-VL Technical Report: Most Capable Open-Source Vision-Language Model**, *arXiv:2502.13923*, 2026. [https://arxiv.org/abs/2502.13923](https://arxiv.org/abs/2502.13923)
4. **IBM Docling Project:** [https://github.com/docling-project/docling](https://github.com/docling-project/docling)
5. **LangChain LangGraph Framework:** [https://github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
6. **DuckDuckGo Search Tool:** [https://github.com/deedy5/duckduckgo_search](https://github.com/deedy5/duckduckgo_search)

---
*Đồ án tốt nghiệp Đại học Bách khoa Hà Nội — Tác giả: Trần Huy Hoàng (20237337).*
