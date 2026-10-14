# 🏢 Office Asset Agent
### Hệ Thống Agent AI Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-61DAFB.svg)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/Orchestrator-LangGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![Tests](https://img.shields.io/badge/Tests-27%2F27%20PASSED-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()

> **Đề tài Đồ án Tốt nghiệp:** Xây dựng Hệ thống Agent Hỗ trợ Tra cứu Thống kê và Tự động hóa Quản lý Vật tư - Thiết bị tại Phòng ban Doanh nghiệp  
> **Sinh viên thực hiện:** Trần Huy Hoàng — **MSSV:** 20237337  
> **Đơn vị áp dụng thử nghiệm:** Phòng Hành chính – Quản trị (Ban Quản lý Cơ sở vật chất Doanh nghiệp)  
> **Hướng dẫn chi tiết xây dựng từ A-Z:** [Tài liệu cẩm nang kỹ thuật](docs/HUONG_DAN_CHI_TIET_XAY_DUNG_DO_AN_TU_A_TOI_Z.md)

---

## 📌 1. Bối Cảnh & Bài Toán Thực Tế

Tại các phòng ban chức năng của doanh nghiệp (như Phòng Hành chính – Quản trị, Quản trị Cơ sở vật chất), công tác theo dõi vật tư và thiết bị hiện nay vẫn phụ thuộc lớn vào việc ghi chép sổ tay hoặc file Excel tự lập. Điều này dẫn đến 3 bất cập lớn:
1. **Nhập kho thủ công tốn thời gian:** Mỗi đợt nhà cung cấp giao vật tư kèm hóa đơn giấy, cán bộ phải gõ tay từng dòng vào Excel, rất dễ nhầm lẫn số lượng và đơn giá.
2. **Cán bộ thường xuyên bị gián đoạn công việc:** Nhân viên liên tục hỏi số lượng tồn kho hoặc nhờ sửa các sự cố kỹ thuật thông thường (máy in kẹt giấy, máy in báo offline, máy chiếu phòng họp không nhận hình HDMI, micro bị hú rít).
3. **Cán bộ không có thời gian soạn cẩm nang:** Doanh nghiệp có hàng chục dòng máy khác nhau, không có nhân sự nào rảnh để ngồi gõ tay hàng chục trang cẩm nang hướng dẫn sử dụng và bảng mã lỗi cho từng model.

**Office Asset Agent** ra đời nhằm giải quyết triệt để các vấn đề trên thông qua một hệ thống Multi-Agent AI tương tác tự nhiên, thông minh, tính toán số học chuẩn xác và an toàn tuyệt đối.

---

## 🔬 2. Nền Tảng Khoa Học: Hệ Thống 9 Chuyên Khảo Papers Chuẩn Mực

Hệ thống được thiết kế và xây dựng dựa trên 9 công trình nghiên cứu khoa học đầu ngành (đầy đủ bản dịch học thuật và phân tích chuyên sâu tại thư mục [`tom_tat_paper/`](tom_tat_paper/)):

| STT | Tên Paper & Xuất Bản | Tư Tưởng Cốt Lõi | Tài Liệu Chi Tiết |
| :---: | :--- | :--- | :---: |
| **01** | **ReAct: Synergizing Reasoning and Acting** *(ICLR 2023)* | Kết hợp Tư duy (*Thought*) và Hành động (*Action*) theo chu trình quan sát. | [PDF Chuyên Khảo](tom_tat_paper/01_react_reasoning_and_acting.pdf) |
| **02** | **Toolformer: Language Models Can Teach Themselves** *(NeurIPS 2023)* | Dạy mô hình ngôn ngữ tự gọi API công cụ để đảm bảo tính xác thực. | [PDF Chuyên Khảo](tom_tat_paper/02_toolformer_language_models_use_tools.pdf) |
| **03** | **The Hallucination Tax in Arithmetic Reasoning** *(arXiv:2602.12631)* | LLM tính nhẩm rất hay sai số học; bắt buộc giao việc tính cho code Python/SQL. | [PDF Chuyên Khảo](tom_tat_paper/03_the_hallucination_tax_arithmetic_reasoning.pdf) |
| **04** | **Self-Refine: Iterative Refinement with Self-Feedback** *(NeurIPS 2023)* | Vòng lặp phản hồi và tự sửa đổi đầu ra trước khi hoàn tất phản hồi. | [PDF Chuyên Khảo](tom_tat_paper/04_self_refine_iterative_refinement.pdf) |
| **05** | **The AI Scientist: Towards Fully Automated Discovery** *(Nature MI 2026)* | Quy trình tự động hóa khép kín: Khảo sát $\rightarrow$ Thử nghiệm $\rightarrow$ Xác minh. | [PDF Chuyên Khảo](tom_tat_paper/05_the_ai_scientist_automated_discovery.pdf) |
| **06** | **Agent Laboratory: Autonomous Scientific Research** *(arXiv:2501.04227)* | Phân vai đa tác tử chuyên biệt, mỗi Agent phụ trách một miền nghiệp vụ riêng. | [PDF Chuyên Khảo](tom_tat_paper/06_agent_laboratory_autonomous_research.pdf) |
| **07** | **Role-Based Access Control Models (NIST RBAC96)** *(IEEE Computer 1996)* | Mô hình phân quyền theo vai trò (RBAC) với ma trận quyền hạn nghiêm ngặt. | [PDF Chuyên Khảo](tom_tat_paper/07_role_based_access_control_models.pdf) |
| **08** | **AI Agent Systems for Supply Chains (AIM-RM)** *(arXiv:2602.05524)* | Safe-Stock Strategy và bộ nhớ hồi cứu kịch bản tương đồng qua khoảng cách toán học. | [PDF Chuyên Khảo](tom_tat_paper/08_supply_chain_agent_memory_retrieval.pdf) |
| **09** | **Qwen2.5-VL Technical Report** *(arXiv:2502.13923)* | Dynamic Resolution ViT, Window Attention và định vị vật thể qua Bounding Boxes. | [PDF Chuyên Khảo](tom_tat_paper/09_qwen2_5_vl_multimodal_document_parsing.pdf) |

---

## 🚀 3. Các Điểm Đột Phá Công Nghệ Của Ứng Dụng (Không Mô Phỏng)

### 🧠 3.1. Thẩm Định Cấp Phát & Định Mức Tồn Kho An Toàn (AIM-RM Engine)
- **Công thức Tồn kho An toàn Động:**
  $$S_{\text{safe}} = z_{\alpha} \cdot \sigma_d \cdot \sqrt{L + 1}$$
- **Episodic Memory Retrieval:** Quét các lần xuất kho trước đó của phòng ban, đo độ tương đồng chuẩn hóa với số lượng yêu cầu để hỗ trợ Cán bộ ra quyết định.
- **Cảnh báo bất thường:** Tự động phát hiện các yêu cầu vượt quá $2\sigma$ hoặc làm tồn kho tụt xuống dưới ngưỡng an toàn, loại bỏ hiện tượng đặt hàng cảm tính và hiệu ứng roi da (*Bullwhip Effect*).

### 📷 3.2. Nhập Kho Bằng Thị Giác AI (Qwen2.5-VL Layout Parser)
- Bảo toàn tỷ lệ khung hình thực của văn bản A4 (*Aspect Ratio Preservation*).
- Trích xuất tọa độ Bounding Box $[y_{\min}, x_{\min}, y_{\max}, x_{\max}]$ chuẩn hóa trên dải $[0, 1000]$ cho từng dòng hàng.
- **Deterministic Database Cross-Verification:** Tự động đối soát tên hàng trên hóa đơn với CSDL `Asset` trong kho, gán chính xác `target_id` để cập nhật kho thực tế (không hardcode ID).

### 🔍 3.3. Tự Động Làm Giàu Tri Thức Thiết Bị (Self-Enriching Knowledge Agent)
- Khi nhập mã sản phẩm/Model mới (ví dụ: `Canon LBP 2900`, `Epson EB-X06`, `HP LaserJet M404dn`), Agent tự động tìm kiếm trên internet (`duckduckgo_search`), bóc tách HDSD và bảng mã lỗi chính hãng để lưu vĩnh viễn vào CSDL tri thức nội bộ.

### 🛠️ 3.4. Trợ Lý Khắc Phục Sự Cố Kỹ Thuật & Tự Động Lập Phiếu Báo Hỏng
- Hướng dẫn nhân viên khắc phục lỗi thiết bị theo từng model cụ thể (máy in kẹt giấy, máy chiếu "No Signal", micro mất tiếng).
- Nếu không tự khắc phục được, Agent tự động điền dữ liệu vào mẫu Word chuẩn công ty sinh file **`Phiếu Báo Hỏng (.docx)`** và tạo vé bảo trì gửi cán bộ duyệt.

### 🧮 3.5. Tính Toán Số Học Xác Định (Deterministic Execution)
- Loại bỏ hoàn toàn lỗi ảo giác tính nhẩm của LLM (*Hallucination Tax*). Toàn bộ phép tính kho và tiền được giao cho Python và SQLite thực hiện chính xác 100%.

### 🔐 3.6. Phân Quyền Vai Trò (NIST RBAC96) & Con Người Duyệt (Human-in-the-Loop)
- **Nhân viên (User):** Tra cứu kho bằng ngôn ngữ đời thường, hỏi cách sửa lỗi, xin cấp/mượn đồ.
- **Cán bộ quản lý (Admin):** Nhập kho bằng ảnh, xem tổng chi phí tài sản, duyệt cấp phát qua AIM-RM, xuất báo cáo và vẽ biểu đồ trực quan (`Matplotlib`). Mọi thay đổi kho đều yêu cầu cán bộ bấm nút **[Duyệt]**.

---

## 🏛️ 4. Kiến Trúc Hệ Thống (LangGraph Workflow)

```
       +--------------------------------------------------------------+
       |       GIAO DIỆN ENTERPRISE (REACT 19 + TYPESCRIPT + TAILWIND) |
       |  [Tab 1: Chatbot]  [Tab 2: Kho]  [Tab 3: AIM-RM]  [Tab 4/5]  |
       +------------------------------+-------------------------------+
                                      | (User Message / Image / Role)
                                      v
       +--------------------------------------------------------------+
       |           BỘ ĐIỀU PHỐI TRUNG TÂM (LANGGRAPH ORCHESTRATOR)    |
       |                   Node: classify_and_auth                     |
       |     * Kiểm tra RBAC (User vs Admin)                          |
       |     * Phân loại ý định: ocr | inventory | support | enrich    |
       +-------+------------------+-------------------+---------------+
               |                  |                   |
    [ocr_restock]           [inventory]           [support]        [enrich]
               v                  v                   v               v
       +---------------+  +---------------+  +---------------+  +-------------+
       | Khối Đọc Ảnh  |  | Khối Quản Lý  |  | Khối Hỗ Trợ   |  | Khối Làm    |
       | Qwen2.5-VL    |  | Kho & AIM-RM  |  | Kỹ Thuật      |  | Giàu Tri    |
       | Vision OCR    |  | Safe-Stock    |  | & Docx Ticket |  | Thức Web    |
       +-------+-------+  +-------+-------+  +-------+-------+  +------+------+
               |                  |                  |                 |
               +------------------+------------------+-----------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |               CƠ SỞ DỮ LIỆU NỘI BỘ (SQLITE / POSTGRES)        |
       |  - Bảng assets (Danh mục vật tư, tồn kho, đơn giá, aliases)  |
       |  - Bảng stock_transactions (Lịch sử nhập / xuất kho)         |
       |  - Bảng maintenance_tickets (Phiếu báo hỏng Word/PDF)        |
       |  - Bảng knowledge_docs (Cẩm nang HDSD & mã lỗi theo model)   |
       +--------------------------------------------------------------+
```

---

## 📁 5. Cấu Trúc Thư Mục Dự Án

```
office-asset-agent/
├── data/                                # Dữ liệu & biểu mẫu nội bộ
│   ├── office_assets.db                 # CSDL SQLite lưu trữ dữ liệu
│   └── templates/                       # Thư mục lưu file Word (.docx) và chart (.png)
├── docs/                                # Tài liệu kỹ thuật & học thuật
│   ├── bao_cao_khao_sat_de_tai.tex      # Báo cáo đề tài LaTeX chuẩn mực
│   └── HUONG_DAN_CHI_TIET_XAY_DUNG_DO_AN_TU_A_TOI_Z.md # Cẩm nang xây dựng A-Z
├── tom_tat_paper/                       # Thư mục 9 chuyên khảo TeX & PDF các bài báo
│   ├── 01_react_reasoning_and_acting.pdf
│   ├── 02_toolformer_language_models_use_tools.pdf
│   ├── 03_the_hallucination_tax_arithmetic_reasoning.pdf
│   ├── 04_self_refine_iterative_refinement.pdf
│   ├── 05_the_ai_scientist_automated_discovery.pdf
│   ├── 06_agent_laboratory_autonomous_research.pdf
│   ├── 07_role_based_access_control_models.pdf
│   ├── 08_supply_chain_agent_memory_retrieval.pdf
│   └── 09_qwen2_5_vl_multimodal_document_parsing.pdf
├── src/                                 # Mã nguồn ứng dụng chính
│   ├── core/                            # Cấu hình, bảo mật RBAC, kết nối DB
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── init_db.py
│   │   └── security.py
│   ├── models/                          # SQLAlchemy ORM models
│   │   ├── asset.py
│   │   ├── ticket.py
│   │   └── user.py
│   ├── tools/                           # Bộ công cụ thực thi xác định
│   │   ├── sql_calculator.py            # Tính toán kho & tiền bằng SQL
│   │   ├── inventory_memory.py          # AIM-RM Memory Retrieval & Safe-Stock
│   │   ├── vision_ocr.py                # Bóc tách hóa đơn Qwen2.5-VL & Bounding Box
│   │   ├── doc_generator.py             # Sinh file Word (.docx) & biểu đồ
│   │   └── web_search.py                # Tìm kiếm cẩm nang kỹ thuật qua DuckDuckGo
│   ├── agents/                          # Các Sub-Agent và Orchestrator
│   │   ├── orchestrator.py              # Bộ điều phối trung tâm LangGraph
│   │   ├── inventory_agent.py           # Quản lý kho & thẩm định cấp phát
│   │   ├── support_agent.py             # Trợ lý HDSD & sửa lỗi thiết bị
│   │   └── enrich_agent.py              # Agent làm giàu tri thức web
│   └── ui/                              # Giao diện Web tương tác
│       └── app.py                       # Giao diện Streamlit 5 Tabs
├── tests/                               # Bộ kiểm thử tự động hóa
│   └── test_system.py                   # 10 test cases tự động toàn diện
├── requirements.txt                     # Các gói phụ thuộc Python
└── README.md                            # Tài liệu giới thiệu dự án
```

---

## ⚙️ 6. Cài Đặt & Hướng Dẫn Chạy Ứng Dụng

### Yêu cầu hệ thống:
* Python `>= 3.10` (Khuyên dùng Python 3.11)
* Hệ điều hành: Windows, Linux hoặc macOS

### Các bước khởi chạy:

```bash
# 1. Clone repository
git clone https://github.com/TontonYuta/office-asset-agent.git
cd office-asset-agent

# 2. Tạo môi trường ảo và kích hoạt
python -m venv venv
# Trên Windows:
.\venv\Scripts\Activate.ps1
# Trên Linux/macOS:
source venv/bin/activate

# 3. Cài đặt các thư viện phụ thuộc
pip install -r requirements.txt

# 4. Khởi chạy ứng dụng Enterprise Web Server (FastAPI + React SPA)
python run_app.py
```
Ứng dụng sẽ tự động mở trên trình duyệt tại: `http://localhost:8000` (Tài liệu API Swagger tại `http://localhost:8000/docs`).

*(Tùy chọn: Chạy chế độ cửa sổ phần mềm độc lập Desktop: `python run_app.py --desktop`)*

---

## 🧪 7. Kiểm Thử Tự Động (Automated Testing)

Chạy bộ kiểm thử tự động để xác minh tính ổn định của toàn bộ hệ thống:

```bash
pytest
```

**Kết quả kiểm thử thực tế (27/27 Test Cases PASSED):**
```text
tests/test_api.py .........                                              [ 33%]
tests/test_system.py ..................                                  [100%]

============================== 27 passed in 3.43s ==============================
```

---

## 👨‍🏫 8. Tác Giả & Thông Tin Liên Hệ

* **Sinh viên thực hiện:** Trần Huy Hoàng
* **Mã số sinh viên (MSSV):** 20237337
* **Đơn vị:** Đại học Bách khoa Hà Nội
* **GitHub Repository:** [https://github.com/TontonYuta/office-asset-agent](https://github.com/TontonYuta/office-asset-agent)

---
*Đồ án tốt nghiệp Đại học Bách khoa Hà Nội — Năm 2026.*
