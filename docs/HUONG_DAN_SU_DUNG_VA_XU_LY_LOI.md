# SỔ TAY HƯỚNG DẪN SỬ DỤNG VÀ XỬ LÝ SỰ CỐ THIẾT BỊ VĂN PHÒNG
## (Tài liệu Nghiệp vụ & Cẩm nang Tri thức nạp vào Hệ thống AI Agent)

> **Đề tài tốt nghiệp:** Xây dựng Hệ thống Agent Hỗ trợ Tra cứu Thống kê và Tự động hóa Quản lý Vật tư - Thiết bị tại Phòng ban Doanh nghiệp  
> **Sinh viên thực hiện:** Trần Huy Hoàng — MSSV: 20237337  
> **Áp dụng thử nghiệm:** Phòng Hành chính – Quản trị (Ban Quản lý Cơ sở vật chất Doanh nghiệp)

---

## MỤC LỤC TỔNG QUAN
1. **Phần 1: Cẩm Nang Hướng Dẫn Sử Dụng Thiết Bị Dùng Chung (HDSD Thiết bị)**
   - 1.1. Máy in Laser văn phòng (Canon LBP 2900 / HP LaserJet Pro)
   - 1.2. Máy chiếu phòng họp & Hội trường (Epson / Panasonic / Sony)
   - 1.3. Hệ thống Micro & Loa phòng họp (Takstar / Shure không dây)
   - 1.4. Hub chuyển đổi tín hiệu & Dây cáp kết nối (Type-C, HDMI, VGA)
2. **Phần 2: Bảng Chẩn Đoán & Khắc Phục Sự Cố Thiết Bị (Troubleshooting Matrix)**
   - 2.1. Các sự cố thường gặp ở Máy in văn phòng
   - 2.2. Các sự cố thường gặp ở Máy chiếu & Màn chiếu
   - 2.3. Các sự cố thường gặp ở Hệ thống Âm thanh & Micro
3. **Phần 3: Kịch Bản Agent Hỗ Trợ Kỹ Thuật & Tự Động Lập Phiếu Báo Hỏng**
   - 3.1. Sơ đồ tương tác giải quyết sự cố 3 bước của Agent
   - 3.2. Mẫu hội thoại thực tế: Xử lý máy chiếu mất tín hiệu
   - 3.3. Tự động lập Phiếu Yêu Cầu Sửa Chữa (Maintenance Ticket) khi không tự sửa được
4. **Phần 4: Hướng Dẫn Vận Hành Phần Mềm Agent Theo Phân Quyền**
   - 4.1. Nhóm Nhân viên công ty (Tra cứu, xin mượn thiết bị, hỏi sửa lỗi)
   - 4.2. Nhóm Cán bộ quản lý (Nhập kho bằng ảnh, duyệt phiếu, xuất báo cáo & vẽ biểu đồ)

---

# PHẦN 1: CẨM NANG HƯỚNG DẪN SỬ DỤNG THIẾT BỊ DÙNG CHUNG

Tài liệu này được số hóa và nạp trực tiếp vào cơ sở tri thức (RAG) của Agent để Agent có thể hướng dẫn ngay cho bất kỳ nhân viên nào trong công ty khi họ cần sử dụng thiết bị.

---

### 1.1. Máy in Laser Văn Phòng (Canon LBP 2900 / HP LaserJet Pro M404dn)

#### A. Chuẩn bị và bật máy
1. **Kiểm tra nguồn:** Cắm dây nguồn chắc chắn vào ổ điện 220V. Nhấn nút nguồn (Power) ở mặt trước hoặc cạnh bên. Đèn nguồn sáng xanh cố định là máy đã sẵn sàng.
2. **Nạp giấy in:**
   - Mở khay chứa giấy phía trước máy.
   - Dùng tay nới lỏng hai thanh gạt canh lề giấy hai bên sao cho vừa khít với khổ giấy **A4** (210 x 297 mm).
   - Đặt tệp giấy phẳng (khoảng 50–100 tờ), không dùng giấy nhăn hoặc giấy có ghim bấm kim loại. Gạt nhẹ hai thanh canh lề ép sát mép giấy để tránh kéo lệch giấy.
3. **Mở khay đỡ giấy ra:** Kéo khay đỡ giấy ở mặt trên của máy ra để khi in xong giấy không bị rơi xuống đất.

#### B. Quy trình in từ máy tính cá nhân
- **In qua mạng LAN/Wifi văn phòng:**
  - Chọn máy in theo tên phòng ban: ví dụ `\\PRINTER-HANHCHINH-CANON2900` hoặc địa chỉ IP cố định được phòng dán trên nắp máy.
  - Nhấn `Ctrl + P` $\rightarrow$ Chọn đúng tên máy in $\rightarrow$ Mục *Paper Size* bắt buộc chọn **A4** (tránh chọn khổ *Letter* vì máy sẽ dừng chờ nhấn nút nạp giấy).
- **In hai mặt thủ công (với máy một mặt như Canon 2900):**
  - Chọn in các trang lẻ (Odd Pages) trước $\rightarrow$ Lấy tệp giấy vừa in ra, giữ nguyên chiều đầu giấy, lật mặt trắng úp xuống khay $\rightarrow$ Chọn in các trang chẵn (Even Pages).

#### C. Quy tắc an toàn & bảo quản
- Không để ly nước, ghim bấm, kẹp bướm gần máy in.
- Không tự ý dùng vật nhọn bằng kim loại (như kéo, compa, dao rọc giấy) thọc vào cụm sấy để gắp giấy kẹt.
- Sau khi in số lượng lớn (>100 trang liên tục), để máy nghỉ 3–5 phút cho cụm sấy tỏa bớt nhiệt.

---

### 1.2. Máy Chiếu Phòng Họp & Hội Trường (Epson / Panasonic / Sony)

#### A. Khởi động và kết nối hình ảnh
1. **Bật máy:**
   - Tháo nắp che ống kính (nếu có nắp trượt cơ học).
   - Bấm nút **Power** trên remote điều khiển hoặc trên thân máy chiếu một lần. Đèn báo hiệu nhấp nháy xanh rồi chuyển sang sáng cố định, bóng đèn chiếu bắt đầu phát sáng sau 10–15 giây.
2. **Hạ màn chiếu điện:**
   - Nhấn nút công tắc gắn tường hoặc remote màn chiếu: Bấm **[Down]** để hạ màn xuống đúng tầm mắt, bấm **[Stop]** khi màn đạt độ cao phù hợp.
3. **Kết nối máy tính với máy chiếu:**
   - Cắm dây **HDMI** vào cổng HDMI của laptop (nếu laptop chỉ có cổng Type-C, dùng kèm Hub chuyển đổi chuyên dụng do phòng quản trị cấp).
   - Trên bàn phím máy tính Windows: Nhấn tổ hợp phím **`Windows + P`** $\rightarrow$ Chọn chế độ:
     * **Duplicate:** Hiển thị màn hình máy tính và màn chiếu hoàn toàn giống nhau (phù hợp khi trình chiếu thông thường).
     * **Extend:** Mở rộng màn hình (phù hợp khi thuyết trình bằng PowerPoint để xem ghi chú Presenter View trên laptop).
   - Trên máy chiếu: Nhấn nút **Source Search** hoặc **Input** trên remote để máy tự nhận cổng cắm (`HDMI 1` hoặc `HDMI 2`).

#### B. Căn chỉnh hình ảnh sắc nét
- **Chỉnh độ nét (Focus Ring):** Xoay nhẹ vòng nhựa Focus nằm sát thấu kính ngoài cùng cho đến khi các dòng chữ nhỏ trên màn chiếu hiện rõ ràng.
- **Chỉnh độ phóng to/nhỏ (Zoom Ring):** Xoay vòng Zoom để khung hình vừa vặn với kích thước màn chiếu vải.
- **Chỉnh méo hình thang (Keystone):** Nếu máy chiếu bị đặt chéo hoặc hơi nghiêng khiến hình chiếu thành hình thang, dùng các phím mũi tên Keystone trên remote để nắn khung hình vuông vức trở lại.

#### C. Quy tắc tắt máy an toàn (CỰC KỲ QUAN TRỌNG)
- Nhấn nút **Power** trên remote **2 lần** để xác nhận tắt máy chiếu.
- **TUYỆT ĐỐI KHÔNG ĐƯỢC RÚT PHÍCH CẮM NGUỒN NGAY:** Quạt tản nhiệt bên trong máy chiếu cần tiếp tục quay 2–3 phút để làm nguội bóng đèn cao áp Halogen/Laser.
- Chỉ ngắt cầu dao hoặc rút dây khi quạt gió đã ngừng kêu hoàn toàn và đèn báo trạng thái chuyển sang màu đỏ ổn định.

---

### 1.3. Hệ Thống Âm Thanh & Micro Phòng Họp (Takstar / Shure Không Dây)

#### A. Khởi động hệ thống âm thanh
1. Bật công tắc nguồn của **Bộ thu sóng micro (Receiver)** tại tủ âm thanh phòng họp. Kiểm tra màn hình LED của bộ thu hiển thị tần số sóng ổn định (ví dụ kênh `CH-A: 645.250 MHz`, `CH-B: 670.500 MHz`).
2. Bật công tắc nguồn của **Amply / Loa kéo phòng họp**. Vặn âm lượng tổng (Master Volume) ở mức vừa phải (khoảng hướng 10 giờ đến 12 giờ).

#### B. Sử dụng Micro không dây
1. **Bật micro:** Gạt công tắc hoặc nhấn giữ nút nguồn trên thân micro 2 giây cho đến khi màn hình hiển thị tần số và vạch pin màu xanh.
2. **Kiểm tra pin:** Nếu màn hình mic nhấp nháy biểu tượng 1 vạch hoặc đèn báo đỏ, thay ngay **2 viên pin AA mới** (lấy tại ngăn kéo vật tư phòng họp).
3. **Khoảng cách và góc nói:**
   - Cầm mic cách miệng từ 3–5 cm, góc nghiêng khoảng 45 độ so với trục miệng.
   - **Tránh hú rít:** Không chĩa đầu micro thẳng vào hướng mặt loa chính; đứng cách loa tối thiểu 2 mét.

#### C. Kết thúc cuộc họp
- Nhấn giữ nút nguồn trên thân micro 2 giây để tắt hẳn nhằm tiết kiệm pin.
- Đặt micro ngay ngắn vào khay đệm chống lăn, cất remote và phụ kiện về đúng vị trí bàn giao.

---

### 1.4. Hub Chuyển Đổi Tín Hiệu & Dây Cáp Kết Nối

- **Cáp HDMI sang HDMI (Dài 1.8m – 5m):** Dùng truyền cả hình ảnh và âm thanh chất lượng cao. Cắm thẳng góc, không bẻ gập đầu cáp.
- **Hub chuyển đổi Type-C sang đa cổng (HDMI + USB + LAN):**
  - Cắm đầu Type-C vào máy tính trước.
  - Chờ máy tính nhận diện thiết bị (khoảng 3 giây), sau đó mới cắm cáp HDMI và dây chuột/bàn phím vào Hub.
- **Cáp chuyển HDMI sang VGA (Kèm jack Audio 3.5mm):** Dùng cho các màn hình/máy chiếu đời cũ chỉ có cổng VGA. Cần cắm thêm jack 3.5mm vào cổng tai nghe máy tính nếu muốn phát âm thanh.

---

# PHẦN 2: BẢNG CHẨN ĐOÁN & KHẮC PHỤC SỰ CỐ THIẾT BỊ (TROUBLESHOOTING MATRIX)

Bảng này liệt kê các lỗi phần cứng thường gặp tại phòng ban, phân tích nguyên nhân và quy trình sửa lỗi từng bước được lập trình vào phản xạ trả lời của AI Agent:

---

### 2.1. Các Sự Cố Thường Gặp Ở Máy In Văn Phòng

| Mã sự cố | Hiện tượng nhận biết | Nguyên nhân kỹ thuật | Hướng dẫn xử lý chi tiết từng bước (Agent hướng dẫn User) |
| :---: | :--- | :--- | :--- |
| **IN-01** | **Kẹt giấy (Paper Jam)**<br>• Đèn Paper nhấp nháy đỏ<br>• Máy in phát tiếng cạch rồi dừng | • Giấy bị ẩm hoặc cong vênh<br>• Nạp giấy quá đầy hoặc lệch lề<br>• Trục kéo cao su bị bám bụi bẩn | **Bước 1:** Tắt công tắc nguồn máy in và rút nhẹ dây cắm.<br>**Bước 2:** Mở nắp trên của máy in, dùng 2 tay cầm quai hộp mực (Cartridge) nhấc thẳng ra ngoài, đặt lên tờ báo phẳng.<br>**Bước 3:** Nhìn vào bên trong cụm sấy: Dùng 2 tay nắm đều 2 mép tờ giấy bị kẹt, kéo **từ từ và đều tay theo chiều thoát giấy ra ngoài** (tránh làm rách giấy lưu lại mảnh vụn bên trong).<br>**Bước 4:** Lắp lại hộp mực vào khớp ray trượt, đóng nắp máy.<br>**Bước 5:** Bật lại công tắc nguồn; máy sẽ tự chạy trơn và in tiếp lệnh còn lại. |
| **IN-02** | **Máy in báo "Offline" / Lệnh in bị treo**<br>• Bấm in nhưng máy im lặng<br>• Máy tính hiện thông báo *Printer Offline* | • Mất kết nối cáp USB hoặc mất IP mạng LAN<br>• Dịch vụ Print Spooler của Windows bị treo do lệnh in hỏng | **Bước 1:** Kiểm tra dây cáp USB/dây mạng cắm sau máy in có bị lỏng không.<br>**Bước 2:** Khởi động lại dịch vụ in trên máy tính:<br>• Nhấn `Windows + R`, gõ `services.msc` rồi bấm Enter.<br>• Tìm dòng **Print Spooler** $\rightarrow$ Bấm chuột phải chọn **Restart**.<br>**Bước 3:** Vào mục *Printers & Scanners* trên Windows $\rightarrow$ Mở hàng đợi lệnh in (*Open Queue*) $\rightarrow$ Bấm menu *Printer* $\rightarrow$ Bỏ tích chọn dòng *Use Printer Offline*. |
| **IN-03** | **Bản in bị vệt đen dọc trang / Mờ chữ toàn trang**<br>• Chữ in ra mờ nhạt khó đọc<br>• Có vệt sọc đen chạy dọc mép giấy | • Trống mực (Drum) bị xước hoặc mòn quang tích điện<br>• Hộp mực gần hết mực hoặc gạt mực bị kênh | **Bước 1:** Nhấc hộp mực ra ngoài, cầm hai đầu hộp mực lắc nhẹ theo phương ngang 3–4 lần để lượng mực bột còn lại phân bổ đều rồi in thử lại.<br>**Bước 2:** Nếu vẫn xuất hiện vệt đen đậm cố định: Đây là hiện tượng hỏng trống từ hoặc tràn mực thải. Người dùng cần báo Agent lập *Phiếu yêu cầu thay thế Cartridge/Bơm mực*. |
| **IN-04** | **Báo đèn đỏ Paper dù khay vẫn có giấy**<br>• Máy in không chịu kéo giấy | • Cỡ giấy đặt trong file Word là *Letter* trong khi máy in đặt *A4*<br>• Giấy bị trượt do thanh gạt lề quá lỏng | **Bước 1:** Mở khay giấy, vuốt phẳng tệp giấy, ép sát thanh căn lề hai bên vào mép giấy.<br>**Bước 2:** Trên màn hình máy tính, kiểm tra lại lệnh in xem khổ giấy đã chọn đúng **A4** chưa. Bấm nút nạp giấy (nút có biểu tượng tờ giấy trên máy in) để máy nạp lại. |

---

### 2.2. Các Sự Cố Thường Gặp Ở Máy Chiếu & Màn Chiếu

| Mã sự cố | Hiện tượng nhận biết | Nguyên nhân kỹ thuật | Hướng dẫn xử lý chi tiết từng bước (Agent hướng dẫn User) |
| :---: | :--- | :--- | :--- |
| **CH-01** | **Màn hình báo "No Signal" (Không có tín hiệu)**<br>• Máy chiếu sáng nhưng hiện màn hình xanh/đen | • Máy tính chưa bật chế độ xuất màn hình ngoài<br>• Chọn sai cổng nguồn vào trên máy chiếu<br>• Lỏng đầu cáp HDMI / đầu chuyển Type-C | **Bước 1:** Trên bàn phím máy tính, nhấn tổ hợp **`Windows + P`** $\rightarrow$ Nhấp chuột chọn chế độ **Duplicate**.<br>**Bước 2:** Cầm remote máy chiếu, bấm phím **Source Search** hoặc **Input** $\rightarrow$ Chọn cổng đúng với vị trí cắm (ví dụ: `HDMI 1`).<br>**Bước 3:** Rút dây cáp HDMI ra cắm chặt lại vào cổng máy tính; nếu dùng cáp nối dài âm tường, kiểm tra jack cắm ở ổ âm sàn dưới chân bàn họp. |
| **CH-02** | **Hình ảnh bị nhòe chữ / Không đọc được nội dung**<br>• Khung hình bị mờ đục | • Vòng xoay lấy nét (Focus) bị xê dịch khi lau chùi hoặc di chuyển máy | **Bước 1:** Đứng gần máy chiếu, tìm cần gạt hoặc vòng xoay nhựa có chữ **FOCUS** nằm ngay phía trên ống kính.<br>**Bước 2:** Xoay chậm vòng Focus qua trái hoặc qua phải trong khi mắt nhìn lên màn chiếu cho đến khi các dòng chữ nhỏ trở nên sắc nét nhất. |
| **CH-03** | **Khung hình bị méo dạng hình thang**<br>• Cạnh trên to hơn cạnh dưới hoặc bị xiên lệch | • Máy chiếu đặt góc nghiêng so với phương vuông góc của màn chiếu | **Bước 1:** Cầm remote máy chiếu, tìm phím có biểu tượng hình thang hoặc chữ **Keystone** (hoặc vào menu `Settings` $\rightarrow$ `Keystone`).<br>**Bước 2:** Bấm mũi tên lên/xuống (Vertical Keystone) hoặc trái/phải (Horizontal Keystone) để nắn các cạnh của khung hình về hình chữ nhật vuông vức. |
| **CH-04** | **Đèn Temp nhấp nháy đỏ / Máy tự tắt sau 5 phút**<br>• Máy chiếu kêu quạt rất to rồi tự tắt | • Khe tản nhiệt bị bám bụi lâu ngày hoặc quạt tản nhiệt bị kẹt khiến máy bị quá nhiệt | **Bước 1:** Không bật lại máy ngay lập tức để tránh nổ bóng đèn chiếu.<br>**Bước 2:** Kiểm tra xem có đồ vật hay rèm cửa nào che chắn cửa gió tản nhiệt của máy chiếu không.<br>**Bước 3:** Báo Agent tạo *Phiếu bảo trì vệ sinh lưới lọc bụi / quạt tản nhiệt* cho cán bộ phòng ban. |

---

### 2.3. Các Sự Cố Thường Gặp Ở Hệ Thống Âm Thanh & Micro

| Mã sự cố | Hiện tượng nhận biết | Nguyên nhân kỹ thuật | Hướng dẫn xử lý chi tiết từng bước (Agent hướng dẫn User) |
| :---: | :--- | :--- | :--- |
| **AT-01** | **Micro không phát ra tiếng**<br>• Nói vào mic nhưng loa không có tiếng | • Micro hết pin<br>• Công tắc trên thân mic đang ở nấc MUTE<br>• Bộ thu (Receiver) bị lệch kênh tần số | **Bước 1:** Nhìn màn hình hiển thị trên thân mic: Nếu tắt ngấm hoặc nhấp nháy đỏ $\rightarrow$ Xoay mở chuôi mic và thay **2 viên pin AA mới**.<br>**Bước 2:** Kiểm tra công tắc: Đảm bảo gạt sang nấc **ON** (không để ở nấc giữa *MUTE*).<br>**Bước 3:** Nhìn vào bộ thu ở tủ máy: Đảm bảo đèn tín hiệu **RF** (Radio Frequency) sáng xanh khi bật mic. Nếu đèn RF tối, nhấn nút **ACT/SYNC** trên bộ thu và chĩa mắt hồng ngoại của thân mic vào để đồng bộ lại tần số. |
| **AT-02** | **Loa phát tiếng rú rít chói tai (Feedback)**<br>• Âm thanh rít lớn đột ngột gây nhức tai | • Người nói cầm mic đứng quá gần mặt loa hoặc chĩa thẳng đầu mic vào loa<br>• Âm lượng ngõ vào (Gain/Treble) chỉnh quá cao | **Bước 1 (Xử lý tức thời):** Lập tức hạ tay cầm micro xuống ngang hông và di chuyển ra xa vị trí đặt loa tối thiểu 2 mét; tránh tuyệt đối đi ngang qua mặt loa.<br>**Bước 2:** Vặn giảm nhẹ núm **Volume micro** hoặc núm **HI / Treble** trên amply phòng họp về hướng 10 giờ. |
| **AT-03** | **Âm thanh bị rè, nghẹt tiếng hoặc đứt quãng**<br>• Tiếng bị vấp từng đoạn | • Pin yếu làm sụt điện áp phát sóng cao tần<br>• Có vật cản kim loại che khuất ăng-ten của bộ thu sóng | **Bước 1:** Thay pin mới cho micro.<br>**Bước 2:** Dựng thẳng hai cần ăng-ten phía sau bộ thu sóng receiver ở góc 90 độ (hình chữ V), đảm bảo không bị dây điện bọc kín che khuất. |

---

# PHẦN 3: KỊCH BẢN AGENT HỖ TRỢ KỸ THUẬT & TỰ ĐỘNG LẬP PHIẾU BÁO HỎNG

### 3.1. Sơ Đồ Xử Lý Sự Cố 3 Bước Của Agent

```
[Người dùng nhắn triệu chứng lỗi]
             │
             ▼
   [Bước 1: Tra cứu Cẩm nang RAG]
   Agent chẩn đoán nguyên nhân & đưa ra 2-3 bước xử lý nhanh
             │
             ▼
   [Bước 2: Người dùng xác nhận kết quả]
    ├── ĐÃ KHẮC PHỤC XONG ──────────► [Ghi nhận nhật ký thành công & Kết thúc]
    │
    └── VẪN KHÔNG ĐƯỢC
             │
             ▼
   [Bước 3: Tự động Lập Phiếu Báo Hỏng Thiết Bị]
   • Agent tự điền thông tin vào mẫu Phiếu Báo Hỏng (Word/PDF)
   • Gửi thông báo khẩn cấp đến Cán bộ Quản trị phòng ban
   • Cán bộ bấm [Duyệt chuyển kỹ thuật / Gọi hãng bảo hành]
```

---

### 3.2. Mẫu Hội Thoại Thực Tế Giữa Nhân Viên Và Agent

> **Nhân viên (Hoàng Long - Marketing):**  
> *"Em ơi, máy chiếu ở phòng họp 3 cắm laptop vào mà nó cứ báo No Signal màn hình xanh lè, 10 phút nữa sếp vào họp rồi!"*

> **Agent:**  
> *"Chào anh Long! Tình trạng máy chiếu báo 'No Signal' thường do máy tính chưa xuất hình hoặc chọn sai cổng vào. Anh thao tác nhanh 3 bước sau giúp em nhé:*  
> 1. **Xuất màn hình:** Trên laptop của anh, nhấn tổ hợp phím **`Windows + P`** rồi nhấp chuột chọn dòng **`Duplicate`**.  
> 2. **Chọn cổng trên máy chiếu:** Cầm remote máy chiếu bấm nút **`Source Search`** hoặc **`Input`** và chọn đúng cổng **`HDMI 1`**.  
> 3. **Kiểm tra cáp:** Rút đầu cắm cáp HDMI trên máy tính ra và cắm chặt lại vào cổng.  
>  
> *Anh thử thao tác xem màn hình đã lên chưa và báo lại em nhé!"*

---

> **Nhân viên (Hoàng Long):**  
> *"Anh thử cả 3 bước rồi, đổi cả sang máy bạn bên cạnh cắm thử cáp HDMI đó cũng không lên, hình như đứt ngầm dây cáp âm bàn rồi em ơi."*

> **Agent:**  
> *"Em hiểu rồi ạ! Trường hợp này nhiều khả năng sợi cáp HDMI âm sàn phòng họp 3 đã bị hỏng chân tiếp xúc hoặc đứt ngầm.*  
>  
> *Để buổi họp không bị gián đoạn, em gợi ý:*  
> *1. Tại hộc tủ phòng họp 3 có sẵn 01 cuộn cáp HDMI dự phòng 5m màu đen, anh có thể cắm tạm từ cổng sau máy chiếu thẳng vào laptop.*  
> *2. Em đã tự động tạo **Phiếu Báo Hỏng & Yêu Cầu Kỹ Thuật** để thay thế dây cáp mới. Anh kiểm tra bản nháp bên dưới nhé:"*

```
══════════════════════════════════════════════════════════════════════
PHIẾU BÁO HỎNG & YÊU CẦU SỬA CHỮA THIẾT BỊ (BẢN NHÁP TỰ ĐỘNG)
Mã phiếu: SC-20261009-003
Thiết bị: Cáp tín hiệu HDMI âm sàn - Máy chiếu Epson EB-X06
Vị trí: Phòng họp số 3 (Tầng 2)
Người báo hỏng: Nguyễn Hoàng Long (Phòng Marketing)
Hiện tượng: Báo No Signal màn hình xanh, đã thử Win+P và đổi 2 laptop không nhận
Đề xuất: Kỹ thuật kiểm tra thay cáp HDMI âm bàn mới
══════════════════════════════════════════════════════════════════════
[Tải file Phieu_Bao_Hong_SC003.docx]  |  [Tải file Phieu_Bao_Hong_SC003.pdf]
```

> **Agent:**  
> *"Phiếu đã được tự động chuyển đến Cán bộ Quản trị cơ sở vật chất (Anh Tuấn). Khi cán bộ duyệt, bộ phận kỹ thuật sẽ qua kiểm tra ngay trong sáng nay."*

---

# PHẦN 4: HƯỚNG DẪN VẬN HÀNH PHẦN MỀM AGENT THEO PHÂN QUYỀN

### 4.1. Hướng Dẫn Dành Cho Nhân Viên Công Ty (Nhóm Quyền User)

Nhân viên sử dụng tài khoản cá nhân đăng nhập trên Web Chat của nội bộ phòng ban.

#### Các chức năng chính:
1. **Hỏi trợ giúp cách dùng:** Gõ `hướng dẫn` hoặc `help` để nhận danh mục gợi ý.
2. **Tra cứu tồn kho vật tư:** Gõ câu hỏi bằng ngôn ngữ tự nhiên:
   - *"Kho phòng mình còn bao nhiêu ram giấy A4 Double A?"*
   - *"Phòng hành chính còn bút lông dầu viết bảng không?"*
3. **Mượn thiết bị phòng họp:**
   - *"Tôi muốn mượn 1 máy chiếu và 2 micro cho phòng họp 2 từ 9h đến 11h sáng mai."*
   - Agent kiểm tra lịch rảnh, tự động xuất file *Phiếu mượn thiết bị* (.docx) gửi người dùng và đẩy thông báo chờ cán bộ phụ trách duyệt.
4. **Hỏi cách dùng thiết bị & khắc phục lỗi:**
   - *"Hướng dẫn cách in hai mặt trên máy in Canon 2900."*
   - *"Máy in tầng 3 bị kẹt giấy thì mở ở đâu?"*
   - *"Micro phòng họp 1 nói không nghe thấy gì thì xử lý thế nào?"*

---

### 4.2. Hướng Dẫn Dành Cho Cán Bộ Quản Trị Cơ Sở Vật Chất (Nhóm Quyền Admin)

Cán bộ quản trị có toàn quyền kiểm soát số liệu kho, duyệt đơn và nhập kho tự động.

#### Các chức năng chuyên sâu:
1. **Nhập kho tự động bằng ảnh chụp chứng từ (Vision AI):**
   - **Thao tác:** Kéo thả ảnh chụp phiếu giao hàng của nhà cung cấp vào khung chat.
   - **Xử lý:** Mô hình *Qwen2.5-VL* và *Docling* tự đọc bảng biểu, tách tên mặt hàng, số lượng thực giao, đơn giá.
2. **Khai báo thiết bị mới & Tự động tìm kiếm tri thức từ mạng (Auto-Enrichment):**
   - **Thao tác của cán bộ:** Cán bộ chỉ cần gõ tên mã máy (ví dụ: *"Thêm thiết bị mới: Máy in Canon LBP 2900"* hoặc *"Máy chiếu Epson EB-X06"*), hoặc gửi ảnh chụp tem thông số kỹ thuật dán sau thân máy.
   - **Cơ chế Agent tự hành (Web Tool):**
     1. Agent trích xuất mã Model chính xác và gọi công cụ tìm kiếm (`duckduckgo_search`) để tìm sách hướng dẫn sử dụng (*User Manual / Service Guide*) chính hãng của nhà sản xuất.
     2. Agent tự động đọc hiểu và bóc tách: (1) Sơ đồ các nút bấm và cổng cắm; (2) Danh mục linh kiện/mực in tương thích; (3) Bảng toàn bộ mã lỗi thường gặp (Error Codes, đèn nháy) và cách khắc phục từng bước.
     3. Agent nạp dữ liệu này vào CSDL tri thức nội bộ (*RAG Vector DB / SQLite*) dưới dạng "Hồ sơ kỹ thuật số" của thiết bị.
   - **Lợi ích thực tiễn:** Cán bộ phòng ban không tốn một phút nào ngồi gõ cẩm nang thủ công; hệ thống tự động hoàn thiện kho dữ liệu sửa lỗi sau 5–10 giây.
3. **Duyệt yêu cầu mượn thiết bị & Đơn báo hỏng:**
   - Khung chat của cán bộ tự động nhận các thông báo:
     * *''Đơn xin mượn Máy chiếu số 02 của bạn Lan (Phòng KD)''* $\rightarrow$ Bấm nút **[Duyệt]** hoặc **[Từ chối]**.
     * *''Phiếu báo hỏng Cáp HDMI phòng họp 3''* $\rightarrow$ Bấm nút **[Duyệt sửa chữa]** để xuất lệnh cho thợ kỹ thuật.
4. **Thống kê & Vẽ biểu đồ tự động:**
   - Gõ yêu cầu: *"Vẽ biểu đồ lượng xuất giấy A4 của các phòng ban trong quý 3."*
   - Agent kích hoạt Python chạy script nội bộ, dùng thư viện `Matplotlib` vẽ biểu đồ cột/biểu đồ tròn trực quan và gửi ảnh trả lại ngay trong tin nhắn chat.

---

### 4.3. Bảng Phân Quyền Vai Trò Hệ Thống (RBAC Matrix)

| Chức năng hệ thống | Nhân viên (User) | Cán bộ Quản trị (Admin) |
| :--- | :---: | :---: |
| Tra cứu tồn kho đồ dùng | ✅ Có quyền | ✅ Có quyền |
| Hỏi HDSD & Khắc phục sự cố thiết bị | ✅ Có quyền | ✅ Có quyền |
| Gửi yêu cầu mượn thiết bị / xin cấp vật tư | ✅ Có quyền | ✅ Có quyền |
| Gửi phiếu báo hỏng thiết bị | ✅ Có quyền | ✅ Có quyền |
| Tải ảnh phiếu giao hàng để nhập kho tự động | ❌ Bị chặn | ✅ Toàn quyền |
| Bấm duyệt đơn mượn / xuất kho / sửa chữa | ❌ Bị chặn | ✅ Toàn quyền |
| Chỉnh sửa số lượng tồn kho trong CSDL | ❌ Bị chặn | ✅ Toàn quyền |
| Xuất báo cáo tổng chi phí & Vẽ biểu đồ quản trị | ❌ Bị chặn | ✅ Toàn quyền |

---
*Tài liệu được biên soạn phục vụ đồ án tốt nghiệp ngành Công nghệ Thông tin, Đại học Bách khoa Hà Nội.*
