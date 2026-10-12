# 🛠️ TÀI LIỆU 03: HƯỚNG DẪN THỰC HÀNH, CHẠY THỬ VÀ MỞ RỘNG ĐỒ ÁN
### Cầm Tay Chỉ Việc Từng Bước Dành Cho Sinh Viên Chưa Từng Cài Đặt
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp  
> **Tác giả:** Trần Huy Hoàng — MSSV: `20237337` (Đại học Bách khoa Hà Nội)

---

## 💻 1. Chuẩn Bị Môi Trường Làm Việc (Từ Con Số 0)

Để chạy được dự án này trên máy tính của bạn (Windows, macOS hoặc Linux/Ubuntu), bạn chỉ cần cài đặt sẵn **Python phiên bản 3.10 trở lên** (khuyên dùng Python 3.11).

### Bước 1: Mở Terminal hoặc Command Prompt
* Trên **Ubuntu / Linux**: Nhấn `Ctrl + Alt + T`.
* Trên **Windows**: Nhấn phím `Windows`, gõ `cmd` hoặc `PowerShell` và nhấn Enter.
* Trên **macOS**: Nhấn `Cmd + Space`, gõ `Terminal` và nhấn Enter.

Di chuyển vào thư mục của dự án:
```bash
cd /home/tontonyuta/repos/office-asset-agent
```

### Bước 2: Tạo Môi Trường Ảo (Virtual Environment)
Môi trường ảo giống như một "chiếc hộp cách ly", giúp các thư viện bạn cài đặt không bị xung đột với các phần mềm khác trên máy tính.

* **Cách 1: Sử dụng công cụ siêu tốc `uv` (Khuyên dùng, cài trong 3 giây):**
  ```bash
  uv venv --python 3.11 .venv
  source .venv/bin/activate    # Trên Windows: .venv\Scripts\activate
  uv pip install -r requirements.txt pytest
  ```

* **Cách 2: Sử dụng lệnh Python chuẩn truyền thống:**
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate    # Trên Windows: .venv\Scripts\activate
  pip install -r requirements.txt pytest
  ```

---

## 🧪 2. Chạy Kiểm Thử Tự Động (Kiểm Tra 8/8 Bài Test)

Trước khi chạy giao diện, hãy chạy bộ kiểm thử tự động để chắc chắn 100% các thành phần (CSDL, tính toán, cào web, sinh file Word, phân quyền RBAC) đều hoạt động trơn tru:

```bash
# Đảm bảo bạn đang ở thư mục gốc của project
PYTHONPATH=. .venv/bin/pytest tests/test_system.py -v
```

**Kết quả mong đợi:** Toàn bộ 8 bài test đều hiện chữ xanh `PASSED`:
```text
tests/test_system.py::test_rbac_security PASSED                          [ 12%]
tests/test_system.py::test_deterministic_sql_calculator PASSED           [ 25%]
tests/test_system.py::test_document_and_chart_generation PASSED          [ 37%]
tests/test_system.py::test_web_search_enrichment PASSED                  [ 50%]
tests/test_system.py::test_vision_ocr PASSED                             [ 62%]
tests/test_system.py::test_orchestrator_inventory_query PASSED           [ 75%]
tests/test_system.py::test_orchestrator_support_and_ticket_creation PASSED [ 87%]
tests/test_system.py::test_orchestrator_rbac_blocking PASSED             [100%]
============================== 8 passed in 8.22s ===============================
```

---

## 🌐 3. Khởi Chạy Giao Diện Web Streamlit

Gõ lệnh sau vào Terminal để khởi chạy ứng dụng web:

```bash
.venv/bin/streamlit run src/ui/app.py
```

* Mở trình duyệt web (Chrome, Edge, Firefox, Cốc Cốc) và truy cập địa chỉ:  
  👉 [**http://localhost:8501**](http://localhost:8501)

### Hướng Dẫn Trải Nghiệm 4 Kịch Bản Thử Nghiệm

1. **Thử nghiệm 1: Tra cứu tồn kho bằng ngôn ngữ tự nhiên**
   * Nhìn ở thanh Sidebar bên trái: Chọn vai trò **👤 Nhân viên (User)**.
   * Tại khung chat: Gõ *"Kho phòng mình còn bao nhiêu ram giấy in A4?"* hoặc bấm nút gợi ý **[📄 Tồn kho giấy A4?]**.
   * 👉 **Quan sát:** AI trả lời ngay: còn **85 Ram**, vị trí Kho Tầng 1.
   * Gõ tiếp: *"Cho mình xem tổng tiền toàn bộ kho vật tư?"*  
   * 👉 **Quan sát:** AI từ chối vì bạn đang là User, chức năng tài chính yêu cầu quyền Admin!

2. **Thử nghiệm 2: Đổi sang quyền Cán bộ Quản lý (Admin)**
   * Ở Sidebar bên trái: Chuyển sang chọn **🔑 Cán bộ Quản lý (Admin)**.
   * Tại khung chat: Bấm nút **[📊 Vẽ biểu đồ kho?]**.
   * 👉 **Quan sát:** AI lập tức vẽ ra 2 biểu đồ cột và tròn bằng `matplotlib` hiển thị trực tiếp lên khung chat kèm tổng định giá tài sản kho!

3. **Thử nghiệm 3: Hướng dẫn sửa lỗi & Tự sinh file Word Phiếu Báo Hỏng**
   * Tại khung chat: Bấm nút **[📽️ Máy chiếu No Signal?]**.
   * 👉 **Quan sát:** AI hướng dẫn 3 bước thao tác (`Win + P`, phím Source trên remote, cắm lại cáp HDMI).
   * Gõ tiếp câu: *"Tôi đã làm đủ 3 bước rồi mà máy chiếu vẫn không lên, cáp âm bàn bị hỏng rồi!"*
   * 👉 **Quan sát:** AI lập tức phát hiện trường hợp hỏng thật $\rightarrow$ tự tạo phiếu báo hỏng mã `SC-XXXXXX` $\rightarrow$ hiện nút màu xanh **[📥 Tải biểu mẫu: Phieu_Bao_Hong_...docx]** để bạn tải file Word về mở xem!

4. **Thử nghiệm 4: Duyệt phiếu báo hỏng trên giao diện Quản trị**
   * Bấm chuyển sang **Tab 3: 📋 Phiếu Sửa Chữa & Duyệt Đơn**.
   * 👉 **Quan sát:** Phiếu bạn vừa tạo đã nằm trong danh sách với trạng thái `PENDING_APPROVAL`.
   * Bấm nút **✅ [Duyệt sửa chữa]** $\rightarrow$ Trạng thái chuyển thành `APPROVED` ngay lập tức!

---

## 🧪 4. BÀI THỰC HÀNH 1: Thêm Một Mặt Hàng Mới Vào Kho

Giả sử công ty bạn vừa mua thêm một mặt hàng mới: **Chuột không dây Logitech B170**. Hãy cùng thêm mặt hàng này vào CSDL để AI có thể nhận diện được.

### Bước 1: Mở file `src/core/init_db.py`
Tìm đến danh sách `sample_assets` (khoảng dòng 30-80), thêm đoạn code sau vào danh sách:

```python
Asset(
    code="VT-CHUOT-LOGI",
    name="Chuột máy tính không dây Logitech B170",
    category="Vật tư tiêu hao",
    model="Logitech B170 Wireless",
    quantity=25,
    unit="Chiếc",
    unit_price=165000,
    location="Kho Tầng 1",
    status="Sẵn sàng",
    aliases="chuột máy tính, chuột không dây, chuột logitech, con chuột, chuot quang",
    specs="Kết nối Wireless 2.4GHz USB Receiver, độ phân giải 1000 DPI, dùng 1 pin AA"
),
```

### Bước 2: Cập nhật CSDL
Xóa file CSDL cũ để hệ thống nạp lại dữ liệu mới:
```bash
rm data/office_assets.db
```
Khi bạn chạy lại lệnh test hoặc mở lại trang web Streamlit, hệ thống sẽ tự động tạo lại DB mới có sẵn món chuột Logitech!

### Bước 3: Thử nghiệm trong khung chat
Gõ câu hỏi: *"Kho còn con chuột không dây nào không bạn?"*  
👉 AI sẽ tự động map từ khóa *"con chuột"* vào `VT-CHUOT-LOGI` và trả lời: còn **25 Chiếc**!

---

## 🌐 5. BÀI THỰC HÀNH 2: Tự Động Cào Web Làm Giàu Tri Thức Cho Model Máy Mới

Công ty bạn vừa mua một chiếc máy in mới: **Canon LBP 3300** (chưa có trong cẩm nang hướng dẫn). Bạn muốn hệ thống tự động tìm tài liệu trên mạng để sau này nhân viên hỏi là có câu trả lời ngay:

1. Mở giao diện Web, bấm vào **Tab 4: 📖 Sổ Tay Tri Thức Theo Model**.
2. Cuộn xuống phần **🌐 Tự Động Làm Giàu Tri Thức Cho Model Mới**.
3. Nhập vào ô: `Canon LBP 3300`.
4. Bấm nút **🔍 Tìm kiếm trên Internet & Tự Động Nạp Tri Thức**.
5. 👉 **Quan sát:** Agent sẽ kích hoạt `duckduckgo_search`, cào tài liệu kỹ thuật về máy in Canon 3300, trích xuất bảng mã lỗi và lưu vào CSDL.
6. Quay lại **Tab 1** hỏi: *"Máy in Canon 3300 bị kẹt giấy thì làm sao?"* $\rightarrow$ AI sẽ lấy ngay tri thức mới vừa nạp để trả lời bạn!

---

## 🤖 6. BÀI THỰC HÀNH 3: Tích Hợp API Key Của OpenAI / Gemini (Tùy Chọn)

Hiện tại, hệ thống đang chạy ở chế độ **Deterministic Rule-based Agent** cực kỳ ổn định và không tốn tiền API. Nếu bạn muốn kết nối với não bộ của mô hình lớn như GPT-4o hoặc Gemini:

1. Tạo một file `.env` tại thư mục gốc:
   ```bash
   touch .env
   ```
2. Mở file `.env` và điền key của bạn:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
   # hoặc:
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
   ```
3. Trong file `src/agents/orchestrator.py`, tại hàm `classify_and_auth()`, bạn có thể gọi thư viện `langchain_openai.ChatOpenAI` hoặc `langchain_google_genai.ChatGoogleGenerativeAI` để phân tích ngữ cảnh câu nói phức tạp hơn của người dùng.

---

## ⚠️ 7. Xử Lý Các Lỗi Thường Gặp (Troubleshooting FAQ)

### Lỗi 1: `Port 8501 is already in use` (Cổng 8501 bị chiếm dụng)
* **Nguyên nhân:** Đang có một tiến trình Streamlit cũ đang chạy ngầm.
* **Cách khắc phục:**
  ```bash
  # Tìm và tắt tiến trình đang chiếm cổng 8501
  fuser -k 8501/tcp
  # Sau đó khởi chạy lại
  .venv/bin/streamlit run src/ui/app.py
  ```

### Lỗi 2: `ModuleNotFoundError: No module named 'src'`
* **Nguyên nhân:** Python không tìm thấy thư mục gốc của project khi chạy lệnh test.
* **Cách khắc phục:** Luôn thêm tiền tố `PYTHONPATH=.` ở đầu câu lệnh:
  ```bash
  PYTHONPATH=. .venv/bin/pytest tests/test_system.py
  ```

### Lỗi 3: Biểu đồ Matplotlib bị lỗi ô vuông font chữ tiếng Việt
* **Nguyên nhân:** Hệ điều hành Linux chưa cài đặt font tiếng Việt chuẩn cho thư viện Matplotlib.
* **Cách khắc phục:** Mã nguồn trong `doc_generator.py` đã chủ động sử dụng tên viết tắt không dấu cho trục biểu đồ để đảm bảo hiển thị đẹp mắt trên mọi hệ điều hành mà không cần cài thêm font font-dejavu hay mscorefonts!

---
*Chúc bạn thực hành thành công và hoàn toàn làm chủ hệ thống Office Asset Agent!*
