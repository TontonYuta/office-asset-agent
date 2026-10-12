# 🔬 TÀI LIỆU 01: GIẢI PHẪU TOÀN BỘ SOURCE CODE DỰ ÁN TỪ A ĐẾN Z
### Hướng Dẫn Từng File, Từng Hàm & Luồng Dữ Liệu Chi Tiết Dành Cho Sinh Viên
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp  
> **Tác giả:** Trần Huy Hoàng — MSSV: `20237337` (Đại học Bách khoa Hà Nội)

---

## 🗺️ 1. Bản Đồ Tổng Thể Thư Mục Mã Nguồn

Dự án được tổ chức theo chuẩn kiến trúc phân lớp công nghiệp (**Clean Layered Architecture**), tách biệt rạch ròi giữa Cấu hình, Cơ sở dữ liệu, Công cụ, Bộ não Agent và Giao diện:

```
office-asset-agent/
├── src/
│   ├── core/                  # [TẦNG LÕI]: Cấu hình, kết nối DB và phân quyền bảo mật
│   │   ├── config.py          # Đường dẫn hệ thống, biến môi trường, định nghĩa Role
│   │   ├── database.py        # SQLAlchemy Engine, SessionLocal, Base ORM
│   │   ├── security.py        # RBAC Matrix, hàm kiểm tra quyền truy cập has_permission
│   │   └── init_db.py         # Hàm tạo bảng và nạp dữ liệu mẫu ban đầu (Seeder)
│   ├── models/                # [TẦNG DỮ LIỆU]: Định nghĩa các bảng CSDL (SQLAlchemy ORM)
│   │   ├── user.py            # Bảng users (Nhân viên, Cán bộ quản lý)
│   │   ├── asset.py           # Bảng assets (Vật tư, thiết bị) & knowledge_docs (Cẩm nang)
│   │   └── ticket.py          # Bảng maintenance_tickets & stock_transactions
│   ├── tools/                 # [TẦNG CÔNG CỤ]: Các hàm chức năng phục vụ Agent
│   │   ├── sql_calculator.py  # Máy tính số học kho, tìm kiếm thông minh qua aliases
│   │   ├── web_search.py      # Cào tài liệu HDSD/mã lỗi trên internet qua DuckDuckGo
│   │   ├── vision_ocr.py      # Bóc tách bảng dữ liệu từ ảnh phiếu giao hàng
│   │   └── doc_generator.py   # Xuất file Word (.docx) phiếu báo hỏng & vẽ biểu đồ PNG
│   ├── agents/                # [TẦNG BỘ NÃO AGENT]: LangGraph StateGraph & Sub-Agents
│   │   ├── orchestrator.py    # Bộ điều phối trung tâm LangGraph, định tuyến luồng
│   │   ├── inventory_agent.py # Agent xử lý các câu hỏi về kho và tài chính
│   │   ├── support_agent.py   # Agent hướng dẫn sửa lỗi & lập phiếu báo hỏng
│   │   └── enrich_agent.py    # Agent tự động làm giàu tri thức theo model máy
│   └── ui/                    # [TẦNG GIAO DIỆN]: Ứng dụng Web tương tác
│       └── app.py             # Giao diện Web 4 Tabs bằng Streamlit
├── data/                      # Thư mục chứa Database SQLite, file Word mẫu & biểu đồ
├── tests/                     # Bộ kiểm thử tự động toàn diện
│   └── test_system.py         # 8 bài test tự động bao phủ 100% chức năng
├── requirements.txt           # Danh mục các thư viện phụ thuộc
└── README.md                  # Giới thiệu tổng quan đề tài
```

---

## 🔎 2. Mổ Xẻ Chi Tiết Từng File Trong Tầng Lõi (`src/core/`)

### 2.1. File `src/core/config.py` — Trung Tâm Cấu Hình
* **Mục đích:** Khai báo toàn bộ đường dẫn tuyệt đối, biến môi trường và hằng số của hệ thống. Tránh việc "hardcode" (viết chết đường dẫn) trong mã nguồn.
* **Các biến quan trọng:**
  * `BASE_DIR = Path(__file__).resolve().parent.parent.parent`: Tìm đường dẫn gốc của project bất kể code đang được chạy ở đâu.
  * `DB_PATH = DATA_DIR / "office_assets.db"`: Đường dẫn file SQLite vật lý trên ổ cứng.
  * `ROLE_USER = "user"`, `ROLE_ADMIN = "admin"`: Định danh 2 vai trò RBAC.
  * `TEMPLATES_DIR.mkdir(...)`: Tự động tạo thư mục nếu chưa tồn tại, tránh lỗi `FileNotFoundError`.

### 2.2. File `src/core/database.py` — Động Cơ Kết Nối CSDL
* **Mục đích:** Khởi tạo động cơ kết nối SQLAlchemy và quản lý phiên làm việc (Session).
* **Điểm kỹ thuật đắt giá:**
  ```python
  engine = create_engine(
      DATABASE_URL,
      connect_args={"check_same_thread": False}, # BẮT BUỘC CHO STREAMLIT
      echo=False
  )
  ```
  * *Tại sao cần `check_same_thread=False`?* Mặc định SQLite chỉ cho phép 1 luồng (thread) truy cập DB. Nhưng Streamlit chạy mô hình đa luồng (multi-threaded) khi có nhiều sự kiện người dùng. Tham số này cho phép nhiều luồng chia sẻ kết nối SQLite an toàn.
  * `SessionLocal`: Factory sinh ra phiên làm việc với database.
  * `Base = declarative_base()`: Lớp cha của toàn bộ các bảng ORM Models.

### 2.3. File `src/core/security.py` — Ma Trận Phân Quyền RBAC
* **Mục đích:** Đảm bảo nguyên tắc bảo mật: Không tin tưởng người dùng ở tầng giao diện, mà phải kiểm soát quyền ở ngay tầng logic.
* **Cơ chế hoạt động:**
  * Định nghĩa danh sách quyền: `PERMISSION_VIEW_INVENTORY`, `PERMISSION_OCR_RESTOCK`, `PERMISSION_VIEW_FINANCIAL_REPORTS`...
  * `ROLE_PERMISSIONS`: Bản đồ ánh xạ Role $\rightarrow$ Danh sách quyền.
  * Hàm `has_permission(role, permission)`: Trả về `True`/`False`.
  * Hàm `check_role_access(role, required_permission)`: Nếu không đủ quyền, trả về thông báo lỗi thân thiện giải thích rõ lý do.

### 2.4. File `src/core/init_db.py` — Nạp Dữ Liệu Ban Đầu (Seeder)
* **Mục đích:** Khi hệ thống chạy lần đầu tiên, file CSDL rỗng. Hàm `init_database()` sẽ:
  1. Gọi `Base.metadata.create_all(bind=engine)` để tự động tạo toàn bộ các bảng trong CSDL SQLite.
  2. Kiểm tra nếu bảng chưa có dữ liệu thì nạp:
     * 3 Users mẫu (`admin`, `user1`, `user2`).
     * 6 Danh mục vật tư/thiết bị mẫu: Giấy in Double A A4, Bút dạ Thiên Long xanh, Hộp mực Cartridge 12A, Pin AA Energizer, Máy in Canon LBP 2900, Máy in HP M404dn.
     * Cẩm nang kỹ thuật nạp sẵn cho Canon 2900, Epson EB-X06, Micro Takstar.

---

## 🗃️ 3. Mổ Xẻ Tầng Mô Hình Dữ Liệu (`src/models/`)

### 3.1. File `src/models/user.py`
* Bảng `users`: Lưu thông tin tài khoản người dùng (`username`, `full_name`, `department`, `role`).

### 3.2. File `src/models/asset.py`
* Bảng `assets`:
  * `code`: Mã quản lý duy nhất (ví dụ: `VT-GIAY-A4`, `TB-MAYIN-01`).
  * `category`: Phân biệt `'Vật tư tiêu hao'` và `'Thiết bị dùng chung'`.
  * `quantity`, `unit`, `unit_price`: Quản lý tồn kho và tài chính.
  * `aliases` *(Cực kỳ quan trọng)*: Chứa danh sách các tên gọi đời thường ngăn cách bằng dấu phẩy, ví dụ: `"giấy in, giấy a4, double a, ram giấy"`. Đây chính là "cây cầu" giúp AI hiểu được từ lóng hoặc từ viết tắt của người dùng.
* Bảng `knowledge_docs`: Lưu trữ cẩm nang kỹ thuật cho từng model thiết bị (`manual_text`, `troubleshooting_guide`, `source_url`).

### 3.3. File `src/models/ticket.py`
* Bảng `maintenance_tickets`: Lưu các phiếu báo hỏng thiết bị (`ticket_code`, `requester_name`, `device_name`, `symptom`, `docx_path`, `status`).
* Bảng `stock_transactions`: Nhật ký mọi lần biến động kho (`transaction_code`, `transaction_type`: `'IN'` hoặc `'OUT'`, `quantity`, `total_amount`).

---

## 🛠️ 4. Mổ Xẻ Tầng Công Cụ Tác Vụ (`src/tools/`)

### 4.1. File `src/tools/sql_calculator.py` — Động Cơ Tính Toán Tất Định
Đây là "vũ khí bí mật" của đồ án để khắc phục lỗi ảo giác tính nhẩm của AI:
* **Hàm `search_asset_by_query(query)`:** Thuật toán tìm kiếm 4 lớp:
  1. *Lớp 1:* Khớp chính xác mã sản phẩm (`code` hoặc `model`).
  2. *Lớp 2:* Khớp chuỗi con trong tên đầy đủ (`name`).
  3. *Lớp 3:* Khớp trong danh mục tên gọi đời thường (`aliases`).
  4. *Lớp 4:* Token Matching — đếm số lượng từ khóa trùng khớp (nếu trùng $\ge 2$ từ khóa thì chọn).
* **Hàm `calculate_inventory_metrics()`:** Thực hiện lệnh đếm `COUNT`, tính tổng định giá `SUM(quantity * unit_price)` bằng Python và lọc ra danh sách mặt hàng có tồn kho $\le 10$ đơn vị để cảnh báo.
* **Hàm `commit_stock_transaction(...)`:** Cập nhật số lượng kho:
  * **Kiểm tra chặn âm kho:** Nếu là giao dịch xuất (`OUT`) mà `quantity > asset.quantity`, hàm lập tức từ chối xuất hàng và trả về thông báo lỗi, không bao giờ để kho bị âm!

### 4.2. File `src/tools/web_search.py` — Tự Động Làm Giàu Tri Thức (Self-Enriching)
* **Hàm `search_online_device_knowledge(model_name)`:**
  * Sử dụng thư viện `duckduckgo_search` (`DDGS().text(...)`) để tìm kiếm tài liệu HDSD và bảng mã lỗi chính hãng trên internet.
  * Có cơ chế **Fallback an toàn**: Nếu máy tính mất mạng hoặc bị chặn IP, hàm tự động chuyển sang kho tri thức chuẩn hóa dự phòng, đảm bảo ứng dụng không bao giờ bị sập (crash).
* **Hàm `enrich_and_cache_knowledge(model_name)`:**
  * Trước tiên tìm trong CSDL nội bộ (`KnowledgeDoc`). Nếu đã có rồi thì lấy ra ngay (Cache hit).
  * Nếu chưa có $\rightarrow$ cào web $\rightarrow$ lưu một bản ghi mới vào CSDL để lần sau không phải cào lại.

### 4.3. File `src/tools/vision_ocr.py` — Bóc Tách Bảng Hóa Đơn
* Mô phỏng kiến trúc Vision-Language Model (`Qwen2.5-VL` kết hợp `Docling`): Nhận vào ảnh phiếu giao hàng của nhà cung cấp, trích xuất bảng danh mục gồm Tên hàng, Số lượng, Đơn giá, Thành tiền.

### 4.4. File `src/tools/doc_generator.py` — Tự Động Sinh Tài Liệu & Biểu Đồ
* **Hàm `generate_maintenance_ticket_docx(ticket_data)`:**
  * Sử dụng thư viện `python-docx` để tạo file Word `.docx` trắng tinh từ code.
  * Căn lề chuẩn 2cm, tạo tiêu đề Quốc hiệu trang trọng màu xanh đậm `#003366`.
  * Tạo bảng viền lưới (`Table Grid`) 7 dòng điền thông tin phiếu.
  * Tạo bảng 3 cột chữ ký: *Người báo hỏng*, *Cán bộ cơ sở vật chất*, *Lãnh đạo phòng ban*.
* **Hàm `generate_inventory_chart()`:**
  * Cấu hình `matplotlib.use("Agg")` (chế độ không hiển thị cửa sổ đồ họa, an toàn cho web server).
  * Vẽ đồ thị kép gồm: Biểu đồ cột (số lượng từng loại vật tư) và Biểu đồ tròn (tỷ lệ cơ cấu vật tư tiêu hao vs thiết bị dùng chung).
  * Lưu thành file ảnh PNG tại `data/bieu_do_ton_kho.png`.

---

## 🧠 5. Mổ Xẻ Bộ Não LangGraph & Các Agent (`src/agents/`)

### 5.1. File `src/agents/orchestrator.py` — Trọng Tâm Đồ Án
Đây là file bạn sẽ được các thầy cô trong Hội đồng hỏi nhiều nhất! Hãy xem cách nó hoạt động:

#### 1. Cấu trúc Trạng Thái (State Definition)
```python
class AgentState(TypedDict):
    user_message: str          # Câu hỏi nguyên bản của người dùng
    user_role: str             # 'user' hoặc 'admin'
    user_name: str             # Tên người đang đăng nhập
    department: str            # Phòng ban công tác
    image_source: Optional[Any]# Ảnh hóa đơn (nếu có đính kèm)
    intent: str                # Ý định sau phân loại: 'inventory', 'support', 'enrich', 'ocr_restock', 'blocked'
    response: str              # Câu trả lời cuối cùng hiển thị cho người dùng
    data: Dict[str, Any]       # Dữ liệu phụ trợ (đường dẫn file Word, biểu đồ, metrics...)
```

#### 2. Nút Phân Loại & Soát Vé (Node `classify_and_auth`)
Hàm này làm 2 nhiệm vụ cùng lúc:
* Đọc tin nhắn để nhận diện người dùng muốn làm gì (`intent`).
* Soát vé bảo mật: Nếu là chức năng nhập kho (`ocr_restock`) mà vai trò không phải `admin` $\rightarrow$ gán `intent = 'blocked'` và viết câu từ chối truy cập.

#### 3. Bộ Rẽ Nhánh Có Điều Kiện (`route_intent`)
```python
def route_intent(state: AgentState) -> str:
    intent = state.get("intent", "inventory")
    if intent == "blocked":      return END               # Kết thúc ngay
    elif intent == "ocr_restock": return "ocr_node"        # Nhảy sang đọc ảnh
    elif intent == "enrich":      return "enrich_node"     # Nhảy sang cào web
    elif intent == "support":     return "support_node"    # Nhảy sang trợ lý kỹ thuật
    else:                         return "inventory_node"  # Nhảy sang tra cứu kho
```

#### 4. Biên Dịch Graph (`builder.compile()`)
LangGraph liên kết các Node và Edge thành một đồ thị có hướng (Directed Acyclic Graph) khép kín, gọi thông qua hàm `process_user_request(...)`.

---

## 🖥️ 6. Mổ Xẻ Tầng Giao Diện Web (`src/ui/app.py`)

Giao diện được viết bằng **Streamlit** với cấu trúc rõ ràng:
1. **Sidebar bên trái:** Cho phép người dùng chuyển đổi qua lại giữa 2 vai trò để thử nghiệm:
   * 👤 **Nhân viên (User):** Nguyễn Hoàng Long - Phòng Marketing.
   * 🔑 **Cán bộ Quản lý (Admin):** Trần Huy Hoàng - Phòng Hành chính.
2. **Khung làm việc chính chia 4 Tabs:**
   * **Tab 1 (💬 Trợ Lý Hội Thoại):** Khung chat tương tác tự nhiên, có 4 nút gợi ý thao tác nhanh, hiển thị hình ảnh biểu đồ và nút bấm tải trực tiếp file Word `.docx`. Phía dưới có mục upload ảnh hóa đơn OCR.
   * **Tab 2 (📦 Danh Mục Vật Tư & Kho):** Xem 4 thẻ chỉ số tổng quan (Metrics), bảng dữ liệu chi tiết toàn bộ kho, và form nhập/xuất kho thủ công dành cho Cán bộ Quản lý.
   * **Tab 3 (📋 Phiếu Sửa Chữa & Duyệt Đơn):** Hiển thị danh sách các phiếu báo hỏng được Agent tự động lập; Cán bộ Admin có thể bấm nút **✅ [Duyệt sửa chữa]** trực tiếp trên web.
   * **Tab 4 (📖 Sổ Tay Tri Thức Theo Model):** Xem cẩm nang kỹ thuật của từng dòng máy; có form nhập mã model mới để yêu cầu Agent lên mạng tìm kiếm cào dữ liệu về lưu vào CSDL.

---

## 🔄 7. Luồng Dữ Liệu Thực Tế: Theo Dấu 3 Tình Huống Kinh Điển

### 🌊 Tình huống 1: Nhân viên hỏi tồn kho giấy A4
```
[User gõ "Kho còn bao nhiêu ram giấy in A4?"]
   │
   ▼
[app.py]: Nhận input -> Gói thông tin thành initial_state -> Gọi process_user_request()
   │
   ▼
[orchestrator.py - Node classify_and_auth]: 
   - Kiểm tra thấy hỏi giấy -> Gán intent = "inventory"
   - route_intent() rẽ nhánh sang "inventory_node"
   │
   ▼
[inventory_agent.py - handle_inventory_query()]:
   - Gọi search_asset_by_query("giấy in a4") trong sql_calculator.py
   - Khớp qua bí danh (aliases): "giấy a4, giay in" -> Tìm thấy Asset id=1 (Double A A4 70gsm)
   - Lấy số lượng thực tế: 85 Ram
   - Soạn câu trả lời markdown thân thiện
   │
   ▼
[LangGraph tới END] -> Trả kết quả về app.py -> Streamlit render hiển thị ra bong bóng chat!
```

### 🌊 Tình huống 2: Người dùng báo máy chiếu hỏng -> Tự sinh file Word
```
[User gõ "Đã thử rồi mà máy chiếu vẫn không lên, hỏng cáp rồi"]
   │
   ▼
[orchestrator.py]: Nhận diện từ khóa "vẫn không lên", "hỏng" -> intent = "support"
   │
   ▼
[support_agent.py - handle_support_query()]:
   - Nhận diện trường hợp escalate (chuyển cấp báo hỏng)
   - Tự động sinh mã phiếu ngẫu nhiên: SC-XXXXXX
   - Gom dữ liệu: Tên người dùng, phòng ban, máy chiếu Epson EB-X06, triệu chứng
   - Gọi doc_generator.py: generate_maintenance_ticket_docx() -> Tạo file Word thật trên đĩa
   - Lưu một dòng mới vào bảng maintenance_tickets với trạng thái PENDING_APPROVAL
   │
   ▼
[app.py]: Nhận docx_path -> Hiển thị nút download màu xanh "📥 Tải biểu mẫu: Phieu_Bao_Hong_..."
[Tab 3]: Tự động xuất hiện thẻ phiếu mới với nút "✅ [Duyệt sửa chữa]" cho Cán bộ Quản trị!
```

---
*Chúc bạn đã nắm trọn vẹn toàn bộ mã nguồn của dự án! Hãy tiếp tục đọc file `02_BO_BI_KIP_VAN_DAP_HOI_DONG.md` để trang bị bí kíp trả lời 25 câu hỏi vấn đáp hóc búa nhất của Hội đồng nhé!*
