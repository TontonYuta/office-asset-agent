# CẨM NANG TOÀN TẬP: XÂY DỰNG HỆ THỐNG AGENT AI QUẢN LÝ VẬT TƯ - THIẾT BỊ TỪ CON SỐ 0
**Đề tài:** Xây dựng Hệ thống Agent Hỗ trợ Tra cứu Thống kê và Tự động hóa Quản lý Vật tư - Thiết bị tại Phòng ban Doanh nghiệp  
**Sinh viên thực hiện:** Trần Huy Hoàng — **MSSV:** 20237337  
**Phạm vi áp dụng:** Phòng Hành chính – Quản trị / Bộ phận Cơ sở vật chất Doanh nghiệp  
**Phiên bản:** Production v2.0 (Tích hợp 9 Paper Nghiên cứu Khoa học chuẩn mực)

---

## MỤC LỤC
1. [TỔNG QUAN BÀI TOÁN & 4 TẦNG THÁCH THỨC](#1-tổng-quan-bài-toán--4-tầng-thách-thức)
2. [CƠ SỞ KHOA HỌC: ÁNH XẠ 9 PAPERS VÀO KIẾN TRÚC CODE](#2-cơ-sở-khoa-học-ánh-xạ-9-papers-vào-kiến-trúc-code)
3. [KIẾN TRÚC TỔNG THỂ & SƠ ĐỒ LUỒNG DỮ LIỆU](#3-kiến-trúc-tổng-thể--sơ-đồ-luồng-dữ-liệu)
4. [GIẢI PHẪU TOÀN DIỆN SOURCE CODE DỰ ÁN](#4-giải-phẫu-toàn-diện-source-code-dự-án)
5. [HƯỚNG DẪN TỪNG BƯỚC XÂY DỰNG LẠI TỪ CON SỐ 0 (ZERO-TO-HERO)](#5-hướng-dẫn-từng-bước-xây-dựng-lại-từ-con-số-0-zero-to-hero)
6. [HƯỚNG DẪN CHẠY ỨNG DỤNG & KIỂM THỬ TỰ ĐỘNG](#6-hướng-dẫn-chạy-ứng-dụng--kiểm-thử-tự-động)
7. [KỊCH BẢN THỰC CHIẾN DEMO VÀ BẢO VỆ TRƯỚC HỘI ĐỒNG](#7-kịch-bản-thực-chiến-demo-và-bảo-vệ-trước-hội-đồng)

---

## 1. TỔNG QUAN BÀI TOÁN & 4 TẦNG THÁCH THỨC

### 1.1 Bối Cảnh Thực Tế Tại Doanh Nghiệp
Tại các phòng ban quản trị hành chính, cán bộ phải quản lý hai nhóm đồ dùng thiết yếu:
- **Vật tư tiêu hao:** Giấy in A4, bút viết, mực máy in, pin micro, băng dính, phụ kiện văn phòng.
- **Thiết bị dùng chung:** Máy chiếu phòng họp, laptop dự phòng, micro hội nghị, màn hình mở rộng.

Phương thức quản lý truyền thống qua **sổ tay ghi chép** hoặc **file Excel cá nhân** bộc lộ các điểm nghẽn nghiêm trọng:
1. *Mất thời gian nhập kho:* Mỗi khi nhà cung cấp giao hàng, cán bộ phải gõ tay từng dòng từ hóa đơn giấy vào Excel, rất dễ nhầm lẫn số lượng và đơn giá.
2. *Điểm nghẽn hỗ trợ kỹ thuật:* Nhân viên liên tục ngắt quãng công việc của cán bộ để hỏi sửa máy in kẹt giấy, máy in offline, máy chiếu báo "No Signal". Cán bộ không có thời gian soạn cẩm nang cho từng model máy.
3. *Ảo giác và sai sót khi báo cáo:* Cuối tháng phải cộng trừ Excel thủ công nhiều ngày; tên gọi nhân viên hỏi đời thường (*"lấy mực máy in phòng sếp"*) không khớp mã kho chuẩn (`INK-CN-2900`).

### 1.2 Bốn Tầng Bài Toán (Từ Nhỏ Đến Lớn)
- **Tầng 1 (Kỹ thuật vi mô):** Chống ảo giác tính nhẩm số học (Hallucination Tax), ánh xạ ngôn ngữ đời thường về mã kho CSDL (Entity Linking), bóc tách ảnh chứng từ quang học có bảng biểu phức tạp (Visual Document Parsing).
- **Tầng 2 (Tri thức cục bộ):** Trợ lý tương tác chẩn đoán sự cố thiết bị theo từng model, tự động tìm kiếm trên mạng tài liệu chính hãng khi có model mới (Auto-Enrichment), tự động xuất file Word chuẩn mẫu (Automated Ticketing).
- **Tầng 3 (Quy trình nghiệp vụ):** Nhập kho tự động hóa từ ảnh, ổn định quyết định cấp phát bằng bộ nhớ lịch sử (AIM-RM & Safe-Stock), phân quyền vai trò bảo mật (RBAC), kiểm soát con người duyệt trước khi lưu CSDL (Human-in-the-Loop).
- **Tầng 4 (Vĩ mô & Đóng góp):** Chuyển đổi số thực chất cho doanh nghiệp, đảm bảo tính khả thi vận hành On-Premise trên 1 GPU thương mại với chi phí thấp và an toàn dữ liệu.

---

## 2. CƠ SỞ KHOA HỌC: ÁNH XẠ 9 PAPERS VÀO KIẾN TRÚC CODE

Đề tài không xây dựng mô hình cảm tính mà dựa trên 9 công trình nghiên cứu khoa học nền tảng:

| STT | Tên Paper & Xuất Bản | Tư Tưởng Cốt Lõi | Hiện Thực Hóa Cụ Thể Trong Source Code |
| :---: | :--- | :--- | :--- |
| **01** | **ReAct** *(ICLR 2023)* | Kết hợp Tư duy (*Thought*) và Hành động (*Action*) theo vòng lặp quan sát (*Observation*). | `src/agents/orchestrator.py`: Phân tách suy luận nhận diện ý định và kích hoạt các công cụ tương ứng. |
| **02** | **Toolformer** *(NeurIPS 2023)* | Dạy mô hình ngôn ngữ tự gọi API bên ngoài để lấy sự thật khách quan. | `src/tools/`: Tách biệt logic LLM với các công cụ gọi CSDL SQL, tìm kiếm web và sinh file Word. |
| **03** | **Hallucination Tax** *(arXiv:2602.12631)* | LLM tính toán số học rất hay sai; bắt buộc phải giao tính toán cho code xác định. | `src/tools/sql_calculator.py`: Toàn bộ phép cộng trừ kho và nhân chia thành tiền do Python & SQLite tính toán 100%. |
| **04** | **Self-Refine** *(NeurIPS 2023)* | Vòng lặp phản hồi và tự sửa lỗi đầu ra trước khi trả kết quả cuối cùng. | `src/agents/support_agent.py`: Kiểm tra chéo phương án khắc phục sự cố, nếu người dùng báo vẫn lỗi thì tự chuyển sang tạo Ticket. |
| **05** | **The AI Scientist** *(Nature MI 2026)* | Quy trình tự động hóa khép kín: Khảo sát $\rightarrow$ Thử nghiệm $\rightarrow$ Kiểm chứng. | `tests/test_system.py`: Bộ kiểm thử tự động hóa 10 kịch bản kiểm tra độ tin cậy của toàn bộ hệ thống. |
| **06** | **Agent Laboratory** *(arXiv:2501.04227)* | Phân vai đa tác tử chuyên biệt, mỗi Agent phụ trách một miền chuyên môn hẹp. | `src/agents/`: Chia nhỏ thành `InventoryAgent`, `SupportAgent`, `EnrichAgent` dưới quyền điều phối của Orchestrator. |
| **07** | **NIST RBAC96** *(IEEE Computer 1996)* | Mô hình phân quyền theo vai trò (Role-Based Access Control) với ma trận quyền hạn PA/UA. | `src/core/security.py`: Tách biệt tuyệt đối quyền giữa `user` (tra cứu, hỏi lỗi) và `admin` (xem tài chính, nhập kho, duyệt đơn). |
| **08** | **Supply Chain Agent** *(arXiv:2602.05524)* | Kiến trúc AIM-RM: Safe-Stock Prompting và truy xuất ký ức kịch bản tương đồng qua Cosine distance. | `src/tools/inventory_memory.py`: Tính $S_{safe} = z_\alpha \sigma_d \sqrt{L+1}$, truy xuất lịch sử cấp phát theo phòng ban để cảnh báo bất thường. |
| **09** | **Qwen2.5-VL** *(arXiv:2502.13923)* | Vision Transformer độ phân giải động (Dynamic Resolution ViT), Window Attention và Bounding Box Grounding. | `src/tools/vision_ocr.py`: Bóc tách bảng kê hóa đơn giữ nguyên tỷ lệ ảnh, trích xuất tọa độ Bounding Box và đối soát CSDL thật. |

---

## 3. KIẾN TRÚC TỔNG THỂ & SƠ ĐỒ LUỒNG DỮ LIỆU

### 3.1 Sơ Đồ Kiến Trúc Hệ Thống (Block Diagram)

```
       +--------------------------------------------------------------+
       |               GIAO DIỆN NGƯỜI DÙNG (STREAMLIT UI)             |
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
       |  - Bảng stock_transactions (Lịch sử nhập / xuất, logs)       |
       |  - Bảng maintenance_tickets (Phiếu báo hỏng Word/PDF)        |
       |  - Bảng knowledge_docs (Cẩm nang HDSD & mã lỗi theo model)   |
       +--------------------------------------------------------------+
```

### 3.2 Luồng Dữ Liệu Chi Tiết (Step-by-Step Flow)
1. **Người dùng gửi yêu cầu:** Tin nhắn văn bản hoặc ảnh hóa đơn đi qua `process_user_request(...)`.
2. **Kiểm tra phân quyền & ý định:** `classify_and_auth` đối chiếu vai trò trong `src/core/security.py`. Nếu vi phạm quyền, trả về thông báo từ chối ngay lập tức.
3. **Thực thi xác định (Deterministic Execution):**
   - Nếu hỏi tồn kho: Gọi `sql_calculator.py` truy vấn chính xác số lượng trong SQLite.
   - Nếu xin cấp phát: Gọi `inventory_memory.py` chạy thuật toán AIM-RM tính Safe-Stock và truy xuất lịch sử.
   - Nếu gửi ảnh phiếu giao hàng: Gọi `vision_ocr.py` bóc tách bảng và đối soát mã CSDL.
   - Nếu hỏi sự cố thiết bị: Gọi `support_agent.py` tra cứu cẩm nang; nếu báo hỏng phần cứng thì gọi `doc_generator.py` xuất file Word `.docx`.
   - Nếu model máy mới chưa có trong kho: Gọi `web_search.py` cào tài liệu từ DuckDuckGo và lưu vào `knowledge_docs`.
4. **Điểm chốt Human-in-the-Loop:** Bất kỳ thao tác thay đổi số lượng kho nào đều dừng lại ở giao diện Web, yêu cầu Cán bộ bấm nút **[Duyệt]** thì lệnh `commit_stock_transaction(...)` mới được ghi nhận vào CSDL.

---

## 4. GIẢI PHẪU TOÀN DIỆN SOURCE CODE DỰ ÁN

Toàn bộ mã nguồn dự án được tổ chức khoa học theo mô hình phân lớp chuyên nghiệp:

```
office-asset-agent/
├── data/                       # Dữ liệu nội bộ
│   ├── office_assets.db        # SQLite database lưu trữ toàn bộ dữ liệu
│   └── templates/              # Thư mục chứa các file Word và ảnh biểu đồ sinh ra
├── docs/                       # Tài liệu học thuật & báo cáo đề tài
│   ├── bao_cao_khao_sat_de_tai.tex   # Báo cáo kỹ thuật tổng quan LaTeX
│   └── HUONG_DAN_CHI_TIET_XAY_DUNG_DO_AN_TU_A_TOI_Z.md # Cẩm nang này
├── tom_tat_paper/              # Thư mục 9 chuyên khảo LaTeX/PDF của các paper
│   ├── 01_react_reasoning_and_acting.pdf
│   ├── ...
│   ├── 08_supply_chain_agent_memory_retrieval.pdf
│   └── 09_qwen2_5_vl_multimodal_document_parsing.pdf
├── src/                        # Mã nguồn ứng dụng chính
│   ├── core/                   # Cấu hình, bảo mật và kết nối CSDL
│   │   ├── config.py           # Thiết lập đường dẫn, vai trò, API keys
│   │   ├── database.py         # SQLAlchemy Engine & Session Local
│   │   ├── init_db.py          # Schema migration & nạp dữ liệu mẫu ban đầu
│   │   └── security.py         # Ma trận phân quyền NIST RBAC96
│   ├── models/                 # ORM Database Models
│   │   ├── asset.py            # Bảng Asset (Vật tư) & KnowledgeDoc (Cẩm nang)
│   │   ├── ticket.py           # Bảng MaintenanceTicket & StockTransaction
│   │   └── user.py             # Bảng User (Tài khoản người dùng)
│   ├── tools/                  # Bộ công cụ xác định (Deterministic Tools)
│   │   ├── sql_calculator.py   # Tính toán kho & tiền bằng SQL (Chống hallucination)
│   │   ├── inventory_memory.py # Động học tồn kho AIM-RM & Safe-Stock (arXiv:2602.05524)
│   │   ├── vision_ocr.py       # Layout Parser & Grounding Bounding Box (Qwen2.5-VL)
│   │   ├── doc_generator.py    # Xuất file Word (.docx) & Biểu đồ Matplotlib
│   │   └── web_search.py       # Cào tài liệu HDSD & mã lỗi qua DuckDuckGo Search
│   ├── agents/                 # Các Sub-Agent và Bộ điều phối
│   │   ├── inventory_agent.py  # Xử lý hội thoại kho & thẩm định cấp phát
│   │   ├── support_agent.py    # Xử lý hội thoại sửa lỗi thiết bị & kích hoạt tạo Ticket
│   │   ├── enrich_agent.py     # Xử lý hội thoại làm giàu tri thức thiết bị
│   │   └── orchestrator.py     # Bộ điều phối trung tâm LangGraph StateGraph
│   └── ui/                     # Giao diện người dùng
│       └── app.py              # Ứng dụng Web tương tác Streamlit 5 Tabs
├── tests/                      # Bộ kiểm thử tự động
│   └── test_system.py          # 10 kịch bản kiểm thử tự động toàn diện
├── requirements.txt            # Danh sách thư viện Python
└── pytest.ini                  # Cấu hình pytest
```

---

## 5. HƯỚNG DẪN TỪNG BƯỚC XÂY DỰNG LẠI TỪ CON SỐ 0 (ZERO-TO-HERO)

Nếu bạn là một người mới bắt đầu hoàn toàn, hãy làm theo đúng 8 bước dưới đây để tái hiện lại 100% hệ thống:

### Bước 1: Khởi Tạo Môi Trường Python & Cài Đặt Thư Viện
1. **Cài đặt Python 3.11:** Tải từ python.org (khuyên dùng Python 3.11 hoặc 3.12).
2. **Tạo môi trường ảo (Virtualenv):**
   ```powershell
   cd C:\Users\<Your_Username>
   mkdir office-asset-agent
   cd office-asset-agent
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. **Tạo tệp `requirements.txt`:**
   ```text
   streamlit>=1.35.0
   sqlalchemy>=2.0.0
   langgraph>=0.2.0
   python-docx>=1.1.0
   matplotlib>=3.8.0
   duckduckgo_search>=6.0.0
   pillow>=10.0.0
   numpy>=1.26.0
   pytest>=8.0.0
   python-dotenv>=1.0.0
   requests>=2.31.0
   ```
4. **Cài đặt các gói:**
   ```powershell
   pip install -r requirements.txt
   ```

---

### Bước 2: Thiết Kế Mô Hình CSDL & Khởi Tạo Database (`src/models/` & `src/core/`)
Xây dựng 4 bảng CSDL cốt lõi bằng SQLAlchemy ORM:
1. **`Asset` (`src/models/asset.py`):**
   - `code` (chuỗi duy nhất, VD: `VT-GIAY-A4`): Khóa định danh sản phẩm.
   - `name`: Tên đầy đủ (VD: *"Giấy in Double A A4 70gsm"*).
   - `quantity`, `unit`, `unit_price`: Số lượng, đơn vị tính, đơn giá.
   - `aliases`: Danh sách từ khóa đời thường ngăn cách bằng dấu phẩy (*"giấy in, giấy a4, double a, ram giấy"*).
2. **`KnowledgeDoc` (`src/models/asset.py`):**
   - `model_name`: Mã model chính hãng (VD: `Canon LBP 2900`).
   - `manual_text`: Hướng dẫn vận hành.
   - `troubleshooting_guide`: Bảng mã lỗi và cách xử lý.
3. **`StockTransaction` (`src/models/ticket.py`):**
   - Lưu trữ mọi biến động kho: Mã giao dịch, loại `IN` (nhập) hoặc `OUT` (xuất), số lượng, đối tác/phòng ban nhận, thời gian.
4. **`MaintenanceTicket` (`src/models/ticket.py`):**
   - Lưu thông tin phiếu báo hỏng: Mã phiếu, người báo, thiết bị, hiện trạng, đường dẫn file Word `.docx` sinh ra.

---

### Bước 3: Hiện Thực Hóa Bộ Công Cụ Xác Định (Deterministic Tools)

#### 3.1 Chống Ảo Giác Số Học (`src/tools/sql_calculator.py`)
- **Nguyên lý:** Tuyệt đối không để LLM tính `85 - 20 = 65`. Khi người dùng hỏi *"còn bao nhiêu"*, hàm `search_asset_by_query` duyệt CSDL và trả về `asset.quantity` thật.
- Khi xuất kho: `commit_stock_transaction` kiểm tra `if asset.quantity < quantity: return {"success": False}` $\rightarrow$ Ngăn chặn hoàn toàn lỗi âm kho.

#### 3.2 Tự Động Xuất Phiếu Word & Biểu Đồ (`src/tools/doc_generator.py`)
- Sử dụng thư viện `python-docx` để đọc mẫu văn bản hành chính, tự động điền các trường `ticket_code`, `requester_name`, `device_name`, `symptom`, đóng khung bảng biểu và lưu thành file `.docx`.
- Sử dụng `matplotlib` vẽ biểu đồ cột thể hiện biến động số lượng các mặt hàng vật tư và xuất ra file ảnh `.png`.

#### 3.3 Tự Động Làm Giàu Tri Thức Web (`src/tools/web_search.py`)
- Khi người dùng cung cấp model mới (như `Epson EB-X06`), hàm `enrich_and_cache_knowledge` trước hết kiểm tra xem trong bảng `knowledge_docs` đã có chưa.
- Nếu chưa có: Kích hoạt `duckduckgo_search` với truy vấn `{model} user manual error codes troubleshooting`. Trích xuất các đoạn trích dẫn và lưu cố định vào CSDL.

---

### Bước 4: Hiện Thực Hóa Bộ Máy Đọc Chứng Từ Qwen2.5-VL (`src/tools/vision_ocr.py`)
- **Tư tưởng từ Paper 09 (arXiv:2502.13923):**
  - Không ép ảnh vuông làm méo chữ.
  - Mỗi dòng hàng được gán tọa độ Bounding Box $[y_{\min}, x_{\min}, y_{\max}, x_{\max}]$ chuẩn hóa trên dải $[0, 1000]$.
  - **Deterministic Database Matching:** Mỗi tên hàng đọc được (`raw_ocr_name`) được chạy qua hàm `search_asset_by_query(...)` để lấy `target_id` và `target_code` thật từ CSDL. Điều này loại bỏ hoàn toàn việc gán cứng ID giả lập.

---

### Bước 5: Hiện Thực Hóa Bộ Nhớ Hồi Cứu AIM-RM (`src/tools/inventory_memory.py`)
- **Tư tưởng từ Paper 08 (arXiv:2602.05524):**
  - **Công thức Tồn Kho An Toàn Động:**
    $$S_{\text{safe}} = z_{\alpha} \cdot \sigma_d \cdot \sqrt{L + 1}$$
  - **Episodic Memory Retrieval:** Quét các lần xuất kho trước đó của phòng ban đó, tính khoảng cách tương đồng giữa số lượng xin cấp và số lượng trong quá khứ:
    $$\text{Sim}(q_{\text{req}}, q_k) = \frac{1}{1 + \frac{|q_{\text{req}} - q_k|}{\max(1, q_k)}}$$
  - **Phát hiện bất thường:** Nếu $q_{\text{req}} > \mu + 2\sigma$ hoặc làm tồn kho sau cấp rơi xuống dưới $S_{\text{safe}}$, Agent đưa ra cảnh báo màu vàng và yêu cầu Cán bộ quản lý thẩm tra kỹ lưỡng.

---

### Bước 6: Bộ Điều Phối Đa Tác Tử LangGraph (`src/agents/orchestrator.py`)
Xây dựng đồ thị trạng thái `StateGraph(AgentState)`:
1. `classify_and_auth`: Kiểm tra vai trò RBAC (`user` không được phép yêu cầu `ocr_restock`).
2. Conditional Edges: Điều hướng sang `ocr_node`, `inventory_node`, `support_node`, `enrich_node` hoặc `END`.
3. Điểm vào duy nhất: `process_user_request(message, role, user_name, department, image_source)`.

---

### Bước 7: Giao Diện Người Dùng Tương Tác Streamlit (`src/ui/app.py`)
Thiết kế giao diện 5 Tabs chuyên nghiệp:
- **Tab 1: Trợ Lý Hội Thoại:** Khung chat tương tác tự nhiên, hỗ trợ gợi ý câu hỏi nhanh, hiển thị biểu đồ và nút tải file Word phiếu báo hỏng.
- **Tab 2: Danh Mục Vật Tư & Kho:** Bảng theo dõi số lượng tồn kho theo thời gian thực, tổng định giá tài sản, cảnh báo sắp hết hàng.
- **Tab 3: Thẩm Định Cấp Phát (AIM-RM):** Cho phép chọn phòng ban, mặt hàng, số lượng xin cấp $\rightarrow$ Hệ thống tự động tính Safe-Stock, quét bộ nhớ lịch sử và cung cấp nút duyệt xuất kho cho Cán bộ.
- **Tab 4: Phiếu Sửa Chữa & Duyệt Đơn:** Quản lý danh sách các phiếu bảo trì, tải file `.docx` và nút duyệt sửa chữa của Cán bộ (Human-in-the-Loop).
- **Tab 5: Sổ Tay Tri Thức Theo Model:** Xem cẩm nang kỹ thuật của các dòng máy và form tìm kiếm cào tri thức từ Internet cho model mới.

---

### Bước 8: Kiểm Thử Tự Động Toàn Diện (`tests/test_system.py`)
Viết 10 test cases tự động kiểm tra:
1. Phân quyền RBAC (Chặn User, cho phép Admin).
2. Tính toán SQL số học chính xác, không âm kho.
3. Sinh file Word `.docx` và ảnh biểu đồ `.png`.
4. Cào web và lưu cache tri thức thiết bị.
5. Bóc tách hóa đơn Qwen2.5-VL có Bounding Box và match CSDL thật.
6. Tính toán công thức Safe-Stock và AIM-RM similarity matching.
7. Điều phối ngôn ngữ tự nhiên yêu cầu cấp phát qua LangGraph.
8. Hỏi đáp tra cứu tồn kho theo tên đời thường.
9. Hướng dẫn sửa lỗi và tự động lập phiếu báo hỏng.
10. Chặn hành vi trái quyền hạn của User thường qua LangGraph.

---

## 6. HƯỚNG DẪN CHẠY ỨNG DỤNG & KIỂM THỬ TỰ ĐỘNG

### 6.1 Khởi Động Giao Diện Web Streamlit
Mở PowerShell tại thư mục gốc của dự án:
```powershell
# Kích hoạt môi trường ảo
.\venv\Scripts\Activate.ps1

# Chạy ứng dụng Streamlit
streamlit run src/ui/app.py
```
Ứng dụng sẽ tự động mở trên trình duyệt tại địa chỉ: `http://localhost:8501`.

### 6.2 Chạy Bộ Kiểm Thử Tự Động (Test Suite Loop-Until-Green)
Chạy lệnh kiểm thử toàn diện:
```powershell
python -m pytest tests/ -v
```
**Kết quả chuẩn mực:**
```text
tests/test_system.py::test_rbac_security PASSED                          [ 10%]
tests/test_system.py::test_deterministic_sql_calculator PASSED           [ 20%]
tests/test_system.py::test_document_and_chart_generation PASSED          [ 30%]
tests/test_system.py::test_web_search_enrichment PASSED                  [ 40%]
tests/test_system.py::test_vision_ocr PASSED                             [ 50%]
tests/test_system.py::test_aim_rm_safe_stock_and_memory PASSED           [ 60%]
tests/test_system.py::test_orchestrator_aim_rm_allocation_query PASSED   [ 70%]
tests/test_system.py::test_orchestrator_inventory_query PASSED           [ 80%]
tests/test_system.py::test_orchestrator_support_and_ticket_creation PASSED [ 90%]
tests/test_system.py::test_orchestrator_rbac_blocking PASSED             [100%]

======================= 10 passed in 1.80s =======================
```

---

## 7. KỊCH BẢN THỰC CHIẾN DEMO VÀ BẢO VỆ TRƯỚC HỘI ĐỒNG

Khi đứng trước Hội đồng chấm thi Đồ án Tốt nghiệp, hãy thực hiện trình diễn theo 4 màn demo mạch lạc sau:

### Màn 1: Thử Nghiệm Phân Quyền Vai Trò (NIST RBAC96)
- **Hành động:** Ở thanh bên (Sidebar), chọn vai trò **👤 Nhân viên (User)**.
- **Thử nghiệm:** Gõ vào khung chat: *"Tôi muốn nhập kho bằng ảnh hóa đơn nhà cung cấp"*.
- **Kết quả hiển thị:** Hệ thống từ chối ngay lập tức: *"🚫 Từ chối truy cập: Chức năng đọc ảnh hóa đơn và nhập kho tự động bắt buộc phải có quyền Cán bộ Quản lý (Admin)"*.
- **Chuyển vai trò:** Đổi sang **🔑 Cán bộ Quản lý (Admin)** $\rightarrow$ Mở rộng khung tải ảnh hóa đơn $\rightarrow$ Chức năng bóc tách được kích hoạt.

### Màn 2: Nhập Kho Bằng Ảnh Chứng Từ & Bóc Tách Bảng (Qwen2.5-VL Layout Parser)
- **Hành động:** Ở vai trò Admin, tải ảnh phiếu giao hàng lên và bấm **[🚀 Bóc tách bảng bằng Vision AI]**.
- **Điểm nhấn thuyết minh:** 
  - Mô hình đọc đúng các dòng hàng (Giấy A4: 25 ram, Bút dạ: 35 chiếc, Mực 12A: 5 hộp, Pin AA: 10 viên).
  - Tự động gán Bounding Box tọa độ chuẩn hóa $[y_{\min}, x_{\min}, y_{\max}, x_{\max}]$.
  - Tự động map chính xác với mã `VT-GIAY-A4`, `VT-BUT-DA`, `VT-MUC-2900`, `VT-PIN-AA` trong CSDL.
- **Điểm chốt Human-in-the-Loop:** Cán bộ xem lại bảng đối soát và bấm **[✅ Duyệt Cập Nhật Vào CSDL Kho]** $\rightarrow$ Tồn kho trong Tab 2 lập tức được cộng dồn chính xác.

### Màn 3: Tra Cứu Tồn Kho & Thẩm Định Cấp Phát (AIM-RM Safe-Stock)
- **Hành động 1:** Nhân viên hỏi ngôn ngữ đời thường: *"Kho phòng mình còn bao nhiêu ram giấy in A4?"* $\rightarrow$ Agent trả lời chính xác số lượng tồn kho thực tế, vị trí lưu trữ và đặc tính kỹ thuật.
- **Hành động 2:** Chuyển sang **Tab 3: Thẩm Định Cấp Phát (AIM-RM)**:
  - Chọn Phòng Marketing xin cấp 15 ram giấy A4 $\rightarrow$ Bấm thẩm định $\rightarrow$ Agent báo: *✅ Đề xuất Duyệt Cấp Phát (Nằm trong hạn mức bình thường)*.
  - Thử nhập xin cấp 150 ram giấy A4 $\rightarrow$ Bấm thẩm định $\rightarrow$ Agent lập tức bật cảnh báo vàng: *⚠️ Cảnh báo bất thường: Số lượng xin cấp cao gấp nhiều lần trung bình lịch sử và vi phạm ngưỡng tồn kho an toàn $S_{safe}$*.

### Màn 4: Trợ Lý Hướng Dẫn Sửa Lỗi Thiết Bị & Tự Động Lập Phiếu Báo Hỏng
- **Hành động 1:** Nhân viên gõ: *"Máy chiếu phòng họp 3 báo No Signal màn hình xanh"* $\rightarrow$ Agent trả lời quy trình 3 bước (nhấn `Windows + P` chọn Duplicate, chỉnh Source HDMI 1, cắm lại cáp).
- **Hành động 2:** Nhân viên gõ tiếp: *"Tôi đã thử cả 3 bước rồi nhưng vẫn không lên, dây cáp âm bàn hỏng rồi"*.
- **Kết quả đột phá:** Agent nhận diện người dùng không thể tự sửa được $\rightarrow$ Tự động điền thông tin vào mẫu Word $\rightarrow$ Sinh ra file `Phieu_Bao_Hong_TEST-SC-...docx` kèm nút tải về trực tiếp trong khung chat $\rightarrow$ Tự động tạo một Ticket trong **Tab 4** chờ Cán bộ bấm duyệt.

---

## LỜI KẾT
Hệ thống **Office Asset Agent** là một minh chứng tiêu biểu cho xu hướng **Agentic AI thế hệ mới**: Không dừng lại ở việc trả lời văn bản đơn thuần mà có khả năng **nhận thức đa phương thức, tự kiểm tra bảo mật, tính toán số học xác định, hồi cứu kinh nghiệm lịch sử và tự động hóa toàn diện quy trình nghiệp vụ**. Toàn bộ mã nguồn và tài liệu đã được chuẩn hóa, sẵn sàng 100% để bảo vệ xuất sắc trước Hội đồng!
