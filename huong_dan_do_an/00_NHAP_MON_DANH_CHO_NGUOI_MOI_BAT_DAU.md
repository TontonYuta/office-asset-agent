# 📘 TÀI LIỆU 00: NHẬP MÔN ĐỒ ÁN AI AGENT DÀNH CHO NGƯỜI MỚI BẮT ĐẦU
### Dành Cho Sinh Viên Chưa Có Nền Tảng — Giải Thích Tường Tận Từ Con Số 0
> **Đề tài:** Hệ Thống AI Agent Hỗ Trợ Tra Cứu Thống Kê và Tự Động Hóa Quản Lý Vật Tư - Thiết Bị tại Phòng Ban Doanh Nghiệp  
> **Tác giả:** Trần Huy Hoàng — MSSV: `20237337` (Đại học Bách khoa Hà Nội)

---

## 🌟 Lời Mở Đầu: Đừng Lo Lắng Nếu Bạn Chưa Biết Gì!

Chào bạn! Nếu bạn đang mở thư mục này ra với cảm giác bỡ ngỡ, hoang mang vì thấy quá nhiều từ ngữ công nghệ đao to búa lớn như *Multi-Agent, LangGraph, ORM, Deterministic Execution, Hallucination Tax, RBAC, Vision OCR*... thì **đây chính xác là tài liệu dành cho bạn**.

Tài liệu này được viết với một nguyên tắc duy nhất: **Không giả định bạn đã biết trước bất kỳ điều gì**. Chúng ta sẽ đi từ những câu chuyện đời thực gần gũi nhất, lý giải tại sao máy tính cần làm như vậy, rồi mới đi vào khái niệm kỹ thuật. Khi đọc xong tài liệu này, bạn sẽ tự tin hiểu rõ đồ án từ trong ra ngoài và giải thích trôi chảy cho bất kỳ thầy cô hay bạn bè nào.

---

## 🏢 1. Bối Cảnh Đời Thực: Đồ Án Này Giải Quyết Chuyện Gì Ở Ngoài Đời?

Hãy tưởng tượng bạn được nhận vào làm việc tại **Phòng Hành chính – Quản trị** của một công ty có khoảng 200 nhân viên. Nhiệm vụ của phòng bạn là: mua sắm giấy in, bút viết, mực in, pin micro, quản lý máy in, máy chiếu phòng họp... để cả công ty hoạt động trơn tru.

Mỗi ngày, bạn sẽ gặp phải **3 "nỗi khổ" triền miên**:

### Nỗi khổ 1: Bị ngắt quãng công việc liên tục vì những câu hỏi lặp đi lặp lại
* Đang ngồi làm báo cáo, đồng nghiệp phòng Marketing chạy sang hỏi: *"Hoàng ơi, kho còn ram giấy in A4 nào không em?"*
* Mười phút sau, chị kế toán gọi điện: *"Hộp mực máy in phòng chị hết rồi, kho còn cartridge 12A không?"*
* Buổi chiều, sếp chuẩn bị họp gấp thì nhân viên kêu toáng lên: *"Anh ơi, máy chiếu phòng họp 3 cắm dây HDMI vào laptop mà màn hình cứ đen sì/xanh lè báo No Signal, làm sao bây giờ?!"*
👉 **Hậu quả:** Bạn mất cả ngày chỉ để trả lời những câu hỏi tủn mủn, không còn thời gian làm việc chuyên môn.

### Nỗi khổ 2: Gõ tay sổ sách Excel vừa mệt vừa dễ nhầm lẫn
* Nhà cung cấp chở đến 20 ram giấy, 30 chiếc bút, 4 hộp mực kèm theo một tờ **Hóa đơn/Phiếu giao hàng in trên giấy**.
* Bạn phải ngồi căng mắt gõ từng dòng vào file Excel: Tên hàng, Số lượng, Đơn giá, Thành tiền. Gõ nhầm một số 0 là cuối tháng lệch sổ sách hàng chục triệu đồng.

### Nỗi khổ 3: Thiết bị đa dạng, không ai rảnh để ngồi viết cẩm nang hướng dẫn
* Công ty có máy in Canon, máy in HP, máy chiếu Epson, micro Takstar... Mỗi máy có hàng chục mã lỗi khác nhau (kẹt giấy, lỗi drum, lệch kênh RF, lỗi độ phân giải).
* Không có nhân viên nào đủ thời gian ngồi gõ hàng chục trang cẩm nang hướng dẫn sử dụng cho từng loại máy.

### 💡 Giải Pháp Của Đồ Án: "Office Asset Agent"
Đồ án này xây dựng một **Trợ lý AI thông minh** ngồi trực 24/7 trên giao diện web của công ty:
1. **Nhân viên tự vào chat:** Hỏi *"Kho còn giấy A4 không?"* -> AI tự tra kho trả lời ngay lập tức.
2. **Khi máy móc bị hỏng:** Nhân viên hỏi *"Máy chiếu báo No Signal sửa sao?"* -> AI hướng dẫn 3 bước kiểm tra nhanh. Nếu vẫn không được, AI **tự động điền thông tin và xuất ra file Word Phiếu Báo Hỏng** gửi sếp duyệt gọi thợ.
3. **Cán bộ quản lý nhập kho:** Chỉ cần chụp ảnh tờ phiếu giao hàng giấy gửi vào khung chat -> AI tự đọc bảng số liệu bóc tách danh mục, cán bộ chỉ việc bấm nút **[Duyệt]** là xong!
4. **Mua máy mới về:** Chỉ cần gõ mã máy (ví dụ `Canon LBP 2900`) -> AI tự lên mạng tìm kiếm cẩm nang kỹ thuật, bảng mã lỗi và lưu vào hệ thống.

---

## 🤖 2. Khái Niệm Cốt Lõi: AI Agent Khác Gì Chatbot Thông Thường?

Rất nhiều sinh viên nhầm lẫn: *"Ủa, em thấy cái này cũng là một ô chat gõ chữ vào rồi trả lời, sao không gọi là Chatbot mà lại gọi là AI Agent?"*

Đây là sự khác biệt bản chất mà bạn **nhất định phải nhớ** khi bảo vệ trước Hội đồng:

| Tiêu Chí | Chatbot Cũ (Rule-based) | ChatGPT Thông Thường (LLM) | AI Agent (Hệ Thống Đồ Án Này) |
| :--- | :--- | :--- | :--- |
| **Cách hoạt động** | Dựa trên từ khóa cứng (`if/else`). Chỉ trả lời được các câu đã lập trình sẵn. | Tiếp nhận câu hỏi $\rightarrow$ Suy nghĩ $\rightarrow$ Trả lời bằng chữ. Không thể tác động vào máy tính. | Tiếp nhận câu hỏi $\rightarrow$ **Suy luận ý định** $\rightarrow$ **Chọn công cụ (Tool)** $\rightarrow$ **Thực thi hành động thực tế**. |
| **Khả năng dùng công cụ** | ❌ Không thể. | ❌ Mặc định chỉ sinh văn bản (text), không tự chạy code hay sửa database. | ✅ Tự kết nối CSDL SQL, tự lên mạng cào web, tự vẽ biểu đồ, tự sinh file Word `.docx`. |
| **Tác động vào thế giới thực** | ❌ Không có tác động gì. | ❌ Chỉ đưa ra lời khuyên trên màn hình. | ✅ Tác động thay đổi trạng thái: Cập nhật tồn kho, tạo phiếu yêu cầu sửa chữa trong CSDL. |
| **Tính chủ động** | ❌ Bị động hoàn toàn. | ❌ Hỏi gì đáp nấy 1 lần (Single-turn). | ✅ Biết chia nhỏ bài toán thành chuỗi hành động nhiều bước (Multi-step reasoning). |

> **Ví dụ dễ hiểu:**  
> - **ChatGPT thường:** Bạn hỏi *"Hãy lập phiếu báo hỏng máy in cho tôi"*, nó sẽ viết ra một đoạn văn bản mẫu trên màn hình chat và bảo bạn: *"Bạn hãy copy đoạn này dán vào Word nhé"*.  
> - **AI Agent:** Khi bạn nói câu đó, nó tự động lấy tên bạn, phòng ban của bạn, dòng máy bị hỏng $\rightarrow$ gọi thư viện `python-docx` $\rightarrow$ tạo ra file `Phieu_Bao_Hong.docx` thật sự $\rightarrow$ lưu vào CSDL $\rightarrow$ trả về nút bấm để bạn tải file về máy tính!

---

## 🧮 3. Tại Sao LLM "Dốt Toán" & Khái Niệm "Ảo Giác Tính Nhẩm" (Hallucination Tax)?

### Hiện tượng "Ảo giác" (Hallucination) của mô hình ngôn ngữ lớn là gì?
Các mô hình ngôn ngữ như GPT hay Gemini được huấn luyện để **dự đoán từ tiếp theo có xác suất xuất hiện cao nhất**, chứ bộ não của chúng **không phải là một chip số học (ALU)**.
* Khi bạn hỏi: *"Kho có 158 ram giấy, xuất đi 29 ram, rồi nhập thêm 47 ram, tổng cộng còn bao nhiêu?"*  
* Đôi khi LLM sẽ trả lời tự tin một con số sai bét (ví dụ 172 thay vì 176) vì nó đang "đoán chữ" chứ không thực sự thực hiện phép trừ phép cộng trong thanh ghi nhớ.
* Trong quản lý kho, chỉ cần sai 1 đơn vị là lệch sổ sách tài chính nghiêm trọng!

### Bài báo khoa học arXiv:2602.12631 nói gì?
Nghiên cứu khoa học quốc tế mới nhất năm 2026 mang tên:  
📄 **"AI Agents for Inventory Control: Human-LLM-OR Complementarity"** (*arXiv:2602.12631*)  
đã chỉ ra rằng: Nếu để LLM tự tính nhẩm số lượng kho và tiền bạc, hệ thống sẽ phải trả một cái giá đắt gọi là **"Hallucination Tax" (Thuế ảo giác)** — tức là chi phí thiệt hại do sai số cộng trừ của AI.

### Cách đồ án giải quyết triệt để: Tính Toán Số Học Tất Định (Deterministic Code Execution)
* **Ý tưởng cốt lõi:** Chia việc rõ ràng:
  * **AI:** Chỉ làm việc nó giỏi nhất — đó là **hiểu ngôn ngữ tự nhiên tiếng Việt** của người dùng (Người dùng muốn hỏi món gì? Đang cần mượn đồ hay báo hỏng?).
  * **Code Python & SQL:** Đảm nhận toàn bộ việc tính toán số học (`Asset.quantity - requested_quantity`, tính tổng tiền, kiểm tra tồn kho không bị âm).
* **Kết quả:** Đảm bảo độ chính xác số học đạt **100% tuyệt đối**, loại bỏ hoàn toàn hiện tượng ảo giác!

---

## 🕸️ 4. LangGraph Là Gì? (Hình Dung Bằng Mô Hình Tàu Điện Ngầm)

Đồ án sử dụng thư viện **LangGraph** để xây dựng bộ não điều phối trung tâm. Vậy LangGraph là gì?

Hãy tưởng tượng LangGraph giống như một **Mạng lưới Tuyến Tàu Điện Ngầm**:

```
 [START]  (Người dùng gửi câu hỏi)
    │
    ▼
 [Ga 1: classify_and_auth] ──► (Bác bảo vệ kiểm tra vé: Bạn là User hay Admin? Ý định là gì?)
    │
    ├──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼
 [Ga 2: Kho]   [Ga 3: Sửa lỗi] [Ga 4: Cào web] [Ga 5: Đọc ảnh]
(Inventory)      (Support)      (Enrich)       (Vision OCR)
    │              │              │              │
    └──────────────┴──────┬───────┴──────────────┘
                          ▼
                       [END]  (Trả kết quả về màn hình)
```

Trong LangGraph, bạn chỉ cần nhớ **4 khái niệm**:
1. **State (Trạng thái - Toa tàu mang hành lý):**  
   Là một biến từ điển (`TypedDict`) chứa toàn bộ thông tin của lượt chat hiện tại: Câu hỏi của người dùng, vai trò (`user`/`admin`), tên, phòng ban, ảnh đính kèm, ý định (`intent`), câu trả lời (`response`). Toa tàu này sẽ chạy qua các ga và được bổ sung dữ liệu trên đường đi.
2. **Node (Nút - Nhà ga xử lý):**  
   Mỗi Node thực chất chỉ là một **hàm Python bình thường**. Hàm này nhận vào `State`, xử lý một công việc cụ thể (ví dụ: truy vấn kho, tìm cách sửa lỗi), rồi cập nhật kết quả vào `State` và trả ra.
3. **Edge (Cạnh - Đường ray):**  
   Là đường nối cố định từ Node này sang Node kia (ví dụ từ `inventory_node` đi thẳng tới `END`).
4. **Conditional Edge (Cạnh rẽ nhánh có điều kiện - Cần bẻ ghi đường ray):**  
   Sau khi tàu chạy qua ga `classify_and_auth`, nó sẽ nhìn vào ý định để quyết định rẽ sang đường ray nào:
   * Nếu hỏi giấy in/bút dạ $\rightarrow$ rẽ sang `inventory_node`.
   * Nếu hỏi máy chiếu hỏng/kẹt giấy $\rightarrow$ rẽ sang `support_node`.
   * Nếu gửi ảnh hóa đơn $\rightarrow$ kiểm tra quyền Admin, nếu đủ quyền thì rẽ sang `ocr_node`, nếu là User thì chặn lại kết thúc luôn (`blocked`).

---

## 🗄️ 5. CSDL Quan Hệ & SQLAlchemy ORM: Tại Sao Không Dùng File Excel?

Nhiều người hỏi: *"Sao không lưu dữ liệu vào file `.xlsx` hay `.txt` cho đơn giản mà phải dùng SQLite và SQLAlchemy?"*

### 1. Tại sao dùng SQLite?
* **An toàn giao dịch (ACID):** Khi 2 người cùng gửi yêu cầu mượn đồ cùng một giây, CSDL đảm bảo không bao giờ bị ghi đè hay mất dữ liệu.
* **Tốc độ truy vấn:** Tìm kiếm một mặt hàng trong CSDL chỉ mất vài mili-giây, nhanh hơn đọc cả file Excel hàng nghìn lần.
* **Gọn nhẹ (Serverless):** Toàn bộ dữ liệu nằm trong đúng một file duy nhất `office_assets.db`, không cần cài đặt máy chủ MySQL hay PostgreSQL phức tạp, cực kỳ phù hợp cho ứng dụng phòng ban doanh nghiệp.

### 2. SQLAlchemy ORM là gì?
* Bình thường, nếu muốn lấy dữ liệu từ database, lập trình viên phải viết câu lệnh SQL bằng chữ:  
  `SELECT * FROM assets WHERE code = 'VT-GIAY-A4';`  
  Cách này dễ bị lỗi gõ chữ và nguy cơ bị tấn công SQL Injection.
* **ORM (Object-Relational Mapping)** là một "thông dịch viên": Nó biến mỗi dòng trong bảng dữ liệu thành một **Đối tượng (Object) trong Python**.
* Thay vì viết câu SQL dài ngoằng, ta chỉ cần viết:  
  `asset = db.query(Asset).filter(Asset.code == 'VT-GIAY-A4').first()`  
  Sau đó ta có thể truy cập `asset.name`, `asset.quantity` dễ như gọi thuộc tính của một biến Python!

---

## 🔐 6. Hai Nguyên Tắc Sống Còn: Phân Quyền RBAC & Con Người Duyệt (Human-in-the-Loop)

Khi đem một hệ thống AI vào doanh nghiệp, hai rủi ro lớn nhất là: **Lộ lọt dữ liệu nội bộ** và **AI tự tung tự tác làm hỏng hệ thống**. Đồ án giải quyết bằng 2 cơ chế:

### 1. RBAC (Role-Based Access Control - Kiểm Soát Truy Cập Dựa Trên Vai Trò)
Hệ thống chia làm 2 vai trò rạch ròi:
* **Nhân viên thông thường (`user`):**
  * Được phép: Tra cứu tồn kho ("Còn giấy không?"), hỏi cách sửa lỗi máy móc, gửi yêu cầu mượn đồ.
  * Bị cấm: Không được xem tổng giá trị tiền bạc của kho, không được tự ý sửa số lượng kho, không được upload hóa đơn nhập kho.
* **Cán bộ quản lý kho (`admin`):**
  * Toàn quyền: Xem báo cáo tài chính, xem biểu đồ định giá, upload ảnh hóa đơn OCR, bấm nút duyệt các phiếu báo hỏng và phiếu xuất nhập kho.

### 2. Human-in-the-Loop (Con Người Giữ Quyền Quyết Định Cuối Cùng)
* AI không bao giờ được phép tự tiện thay đổi dữ liệu kho một mình!
* Khi AI đọc một tấm ảnh hóa đơn: Nó bóc tách ra bảng gồm 3 mặt hàng, tính tổng tiền. **Nhưng nó KHÔNG tự cộng vào CSDL ngay**.
* Nó hiển thị bảng đó lên màn hình cho Cán bộ Quản trị xem lại bằng mắt. Chỉ khi Cán bộ bấm nút **✅ [Duyệt Cập Nhật Vào CSDL Kho]**, dữ liệu mới chính thức được ghi nhận.
* Cơ chế này đảm bảo: Nếu nhà cung cấp gửi hóa đơn mờ hoặc AI đọc sai số lượng, con người luôn là chốt chặn cuối cùng ngăn chặn sai sót!

---

## 🎯 Tóm Tắt 5 Ý Cốt Lõi Cần Nhớ Nằm Lòng

1. **Mục tiêu đồ án:** Giải quyết 3 nỗi đau quản lý vật tư/thiết bị tại phòng ban bằng Trợ lý AI tương tác tự nhiên.
2. **Kiến trúc:** LangGraph Multi-Agent phối hợp nhiều Agent chuyên trách (`Inventory`, `Support`, `Enrich`).
3. **Chống ảo giác số học:** AI chỉ phân tích ngôn ngữ; toàn bộ việc tính toán kho và tiền giao cho Python & SQL đảm nhận 100%.
4. **Bảo mật:** Phân quyền 2 cấp RBAC (`user` vs `admin`) ngăn chặn thao tác trái quyền.
5. **An toàn:** Cơ chế Human-in-the-Loop bắt buộc cán bộ bấm duyệt trước khi thay đổi dữ liệu kho.

---
*Chúc bạn có những giờ phút học tập và khám phá hào hứng với thế giới AI Agent! Hãy tiếp tục mở file `01_GIAI_PHAU_SOURCE_CODE_CHI_TIET.md` để xem từng dòng code được viết như thế nào nhé!*
