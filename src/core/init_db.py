"""
Database Initialization and Mock Data Seeding Module.
Đồ án 2: Khởi tạo schema và nạp dữ liệu mẫu ban đầu cho phòng ban.
"""

from src.core.database import engine, Base, SessionLocal
from src.models.user import User
from src.models.asset import Asset, KnowledgeDoc
from src.models.ticket import StockTransaction
from src.core.security import hash_password
from sqlalchemy import text


def init_database():
    """Tạo bảng và nạp dữ liệu mẫu nếu database chưa có dữ liệu."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Tự động cập nhật cột password_hash nếu database cũ chưa có
        try:
            with engine.connect() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(128)"))
                conn.commit()
        except Exception:
            pass

        # 1. Khởi tạo tài khoản mẫu (Users)
        if db.query(User).count() == 0:
            sample_users = [
                User(
                    username="admin",
                    full_name="Trần Huy Hoàng",
                    department="Phòng Hành chính – Quản trị",
                    role="admin",
                    password_hash=hash_password("admin123")
                ),
                User(
                    username="user1",
                    full_name="Nguyễn Hoàng Long",
                    department="Phòng Marketing",
                    role="user",
                    password_hash=hash_password("user123")
                ),
                User(
                    username="user2",
                    full_name="Lê Thị Mai",
                    department="Phòng Kế toán",
                    role="user",
                    password_hash=hash_password("user123")
                ),
            ]
            db.add_all(sample_users)
            db.commit()
        else:
            # Cập nhật mật khẩu băm cho user cũ nếu chưa có
            users = db.query(User).all()
            for u in users:
                if not u.password_hash:
                    u.password_hash = hash_password("admin123" if u.role == "admin" else "user123")
            db.commit()

        # 2. Khởi tạo danh mục Vật tư & Thiết bị mẫu (Assets)
        if db.query(Asset).count() == 0:
            sample_assets = [
                Asset(
                    code="VT-GIAY-A4",
                    name="Giấy in Double A A4 70gsm",
                    category="Vật tư tiêu hao",
                    model="Double A 70gsm",
                    quantity=85,
                    unit="Ram",
                    unit_price=75000,
                    location="Kho Tầng 1",
                    status="Sẵn sàng",
                    aliases="giấy in, giấy a4, double a, ram giấy, giay in",
                    specs="Khổ A4 (210x297mm), định lượng 70gsm, độ trắng 95%"
                ),
                Asset(
                    code="VT-BUT-DA",
                    name="Bút dạ lông bảng Thiên Long xanh",
                    category="Vật tư tiêu hao",
                    model="Thiên Long WB-03",
                    quantity=42,
                    unit="Chiếc",
                    unit_price=8000,
                    location="Kho Tầng 1",
                    status="Sẵn sàng",
                    aliases="bút dạ xanh, bút lông bảng, bút viết bảng, but da, but long",
                    specs="Mực xanh đậm, dễ xóa, ngòi tròn 1.5mm"
                ),
                Asset(
                    code="VT-MUC-2900",
                    name="Hộp mực máy in Cartridge 12A",
                    category="Vật tư tiêu hao",
                    model="Cartridge 12A / FX-9",
                    quantity=6,
                    unit="Hộp",
                    unit_price=180000,
                    location="Kho Tầng 1",
                    status="Sẵn sàng",
                    aliases="mực máy in, mực canon 2900, cartridge 12a, muc in, hop muc",
                    specs="Dùng chung Canon 2900 / HP LaserJet 1020, in khoảng 2.000 trang"
                ),
                Asset(
                    code="VT-PIN-AA",
                    name="Vỉ pin AA Energizer Max (Pin tiểu)",
                    category="Vật tư tiêu hao",
                    model="Energizer AA E91",
                    quantity=24,
                    unit="Viên",
                    unit_price=15000,
                    location="Kho Tầng 1",
                    status="Sẵn sàng",
                    aliases="pin mic, pin micro, pin aa, pin tiểu, pin đũa",
                    specs="Điện thế 1.5V, chống rò rỉ, dùng cho micro và chuột không dây"
                ),
                Asset(
                    code="TB-MAYIN-01",
                    name="Máy in Laser đơn năng Canon LBP 2900",
                    category="Thiết bị dùng chung",
                    model="Canon LBP 2900",
                    quantity=4,
                    unit="Chiếc",
                    unit_price=3650000,
                    location="Phòng Hành chính & Kế toán",
                    status="Sẵn sàng",
                    aliases="máy in canon, máy in 2900, canon 2900, may in canon",
                    specs="Tốc độ in 12 trang/phút, độ phân giải 2400x600 dpi, khay giấy 150 tờ"
                ),
                Asset(
                    code="TB-MAYIN-02",
                    name="Máy in HP LaserJet Pro M404dn (2 mặt)",
                    category="Thiết bị dùng chung",
                    model="HP LaserJet Pro M404dn",
                    quantity=2,
                    unit="Chiếc",
                    unit_price=6800000,
                    location="Phòng Giám đốc",
                    status="Sẵn sàng",
                    aliases="máy in hp, máy in m404dn, máy in 2 mặt, may in hp",
                    specs="In 2 mặt tự động, tốc độ 38 trang/phút, kết nối mạng LAN Gigabit"
                ),
                Asset(
                    code="TB-MAYCHIEU-01",
                    name="Máy chiếu 3LCD Epson EB-X06",
                    category="Thiết bị dùng chung",
                    model="Epson EB-X06",
                    quantity=3,
                    unit="Chiếc",
                    unit_price=12500000,
                    location="Phòng họp số 1 & 2",
                    status="Sẵn sàng",
                    aliases="máy chiếu epson, máy chiếu eb-x06, may chieu epson, may chieu",
                    specs="Độ sáng 3.600 Ansi Lumens, XGA (1024x768), cổng HDMI/VGA/USB"
                ),
                Asset(
                    code="TB-MICRO-01",
                    name="Bộ Micro không dây Takstar WGV-201",
                    category="Thiết bị dùng chung",
                    model="Takstar WGV-201",
                    quantity=4,
                    unit="Bộ",
                    unit_price=1450000,
                    location="Phòng họp số 1",
                    status="Sẵn sàng",
                    aliases="micro takstar, mic không dây, mic phòng họp, micro",
                    specs="Bộ gồm 2 mic cầm tay VHF, khoảng cách bắt sóng 30m, dùng 2 pin AA"
                ),
                Asset(
                    code="TB-CAP-HDMI",
                    name="Cáp tín hiệu HDMI Ugreen 5m",
                    category="Thiết bị dùng chung",
                    model="Ugreen HDMI 5M",
                    quantity=8,
                    unit="Sợi",
                    unit_price=120000,
                    location="Phòng họp số 1, 2, 3",
                    status="Sẵn sàng",
                    aliases="cáp hdmi, dây hdmi, dây máy chiếu, cap hdmi",
                    specs="Chuẩn HDMI 2.0 4K@60Hz, dây bọc dù chống nhiễu, đầu mạ vàng"
                ),
            ]
            db.add_all(sample_assets)
            db.commit()

        # 3. Khởi tạo Cơ sở tri thức Cẩm nang Kỹ thuật (KnowledgeDocs)
        if db.query(KnowledgeDoc).count() == 0:
            sample_docs = [
                KnowledgeDoc(
                    model_name="Canon LBP 2900",
                    device_type="Máy in Laser",
                    title="Cẩm nang vận hành và sửa lỗi máy in Canon LBP 2900",
                    manual_text=(
                        "1. Bật nguồn: Cắm phích 220V, nhấn nút nguồn mặt trước, chờ đèn xanh sáng cố định.\n"
                        "2. Nạp giấy: Mở khay trước, gạt 2 thanh canh lề ép sát mép giấy A4, đặt 50-100 tờ phẳng.\n"
                        "3. In ấn: Trên máy tính chọn đúng máy in \\\\PRINTER-CANON2900, khổ giấy bắt buộc chọn A4."
                    ),
                    troubleshooting_guide=(
                        "- Lỗi IN-01 (Kẹt giấy): Tắt máy, rút điện, nhấc Cartridge 12A ra ngoài. "
                        "Dùng 2 tay nắm đều mép giấy kẹt và kéo từ từ theo chiều thoát giấy. Lắp lại hộp mực và bật máy.\n"
                        "- Lỗi IN-02 (Báo Offline): Kiểm tra cáp USB cắm chặt. Nhấn Windows+R gõ services.msc -> Print Spooler -> Restart. "
                        "Mở danh sách máy in, bỏ tích 'Use Printer Offline'.\n"
                        "- Lỗi IN-03 (Vệt đen / Mờ chữ): Nhấc hộp mực lắc ngang 3-4 lần. Nếu vẫn vệt đen là mòn trống quang (Drum), cần thay hộp mực.\n"
                        "- Lỗi IN-04 (Báo đèn đỏ dù có giấy): Đặt lại khổ giấy file Word về A4 (tránh để Letter). Bấm nút nạp giấy trên máy."
                    ),
                    source_url="Canon Vietnam Official Service Manual"
                ),
                KnowledgeDoc(
                    model_name="Epson EB-X06",
                    device_type="Máy chiếu",
                    title="Cẩm nang sử dụng và khắc phục sự cố máy chiếu Epson EB-X06",
                    manual_text=(
                        "1. Bật máy: Mở nắp trượt thấu kính, nhấn nút Power trên remote hoặc thân máy 1 lần (đèn xanh nháy 15s).\n"
                        "2. Kết nối: Cắm cáp HDMI vào laptop. Nhấn Windows + P chọn 'Duplicate'.\n"
                        "3. Chọn nguồn: Bấm phím Source Search hoặc Input trên remote chọn cổng HDMI 1.\n"
                        "4. Tắt máy an toàn: Bấm nút Power 2 lần. Tuyệt đối không rút điện ngay, phải chờ quạt tản nhiệt quay 2-3 phút đến khi đèn đỏ cố định."
                    ),
                    troubleshooting_guide=(
                        "- Lỗi CH-01 (Màn hình No Signal xanh lè): Nhấn tổ hợp phím Windows + P chọn Duplicate; "
                        "Bấm nút Source trên điều khiển chọn đúng cổng HDMI 1; Rút cáp cắm chặt lại hoặc thử cổng phụ.\n"
                        "- Lỗi CH-02 (Nhòe chữ / Mờ hình): Đứng gần thấu kính, xoay nhẹ vòng nhựa FOCUS cho đến khi chữ nét.\n"
                        "- Lỗi CH-03 (Méo hình thang): Bấm phím Keystone trên điều khiển, chỉnh mũi tên nắn khung hình vuông.\n"
                        "- Lỗi CH-04 (Đèn Temp nháy đỏ / Quạt hú to tự tắt): Máy quá nhiệt. Không bật lại ngay; kiểm tra dọn sạch vật cản cửa gió tản nhiệt."
                    ),
                    source_url="Epson Global Support Manual"
                ),
                KnowledgeDoc(
                    model_name="Takstar WGV-201",
                    device_type="Hệ thống Âm thanh / Micro",
                    title="Hướng dẫn sử dụng và xử lý hú rít Micro Takstar WGV-201",
                    manual_text=(
                        "1. Bật bộ thu (Receiver) ở tủ âm thanh, kiểm tra màn hình hiển thị tần số sáng rõ.\n"
                        "2. Bật mic: Gạt công tắc trên thân mic sang ON (không để nấc MUTE ở giữa).\n"
                        "3. Khoảng cách: Cầm mic cách miệng 3-5cm, góc 45 độ. Đứng cách mặt loa tối thiểu 2 mét."
                    ),
                    troubleshooting_guide=(
                        "- Lỗi AT-01 (Micro mất tiếng): Kiểm tra đèn pin thân mic. Nếu đèn đỏ hoặc tắt -> Thay 2 pin AA mới. "
                        "Đảm bảo công tắc ở nấc ON (không để MUTE). Kiểm tra đèn RF trên bộ thu sáng xanh.\n"
                        "- Lỗi AT-02 (Loa hú rít chói tai / Feedback): Hạ tay cầm mic ngang hông, lùi xa loa tối thiểu 2 mét; "
                        "Vặn giảm núm Volume micro hoặc núm Treble trên amply về hướng 10 giờ.\n"
                        "- Lỗi AT-03 (Âm thanh vấp, rè tiếng): Thay pin mới; Dựng 2 cần ăng-ten phía sau bộ thu theo góc chữ V (90 độ)."
                    ),
                    source_url="Takstar Audio Technical Manual"
                ),
            ]
            db.add_all(sample_docs)
            db.commit()

        # 4. Khởi tạo một số giao dịch mẫu (StockTransaction) cho biểu đồ thống kê
        if db.query(StockTransaction).count() == 0:
            sample_txs = [
                StockTransaction(
                    transaction_code="TX-202610-001",
                    asset_id=1,  # Giấy A4
                    transaction_type="IN",
                    quantity=100,
                    unit_price=75000,
                    total_amount=7500000,
                    provider_or_dept="Công ty CP Giấy Hải Tiến",
                    status="APPROVED",
                    notes="Nhập kho định kỳ Quý 3"
                ),
                StockTransaction(
                    transaction_code="TX-202610-002",
                    asset_id=1,  # Giấy A4
                    transaction_type="OUT",
                    quantity=15,
                    unit_price=75000,
                    total_amount=1125000,
                    provider_or_dept="Phòng Kế toán",
                    status="APPROVED",
                    notes="Cấp phát giấy in tháng 10"
                ),
                StockTransaction(
                    transaction_code="TX-202610-003",
                    asset_id=2,  # Bút dạ
                    transaction_type="OUT",
                    quantity=8,
                    unit_price=8000,
                    total_amount=64000,
                    provider_or_dept="Phòng Marketing",
                    status="APPROVED",
                    notes="Cấp phát bút họp chiến dịch"
                ),
                StockTransaction(
                    transaction_code="TX-202610-004",
                    asset_id=3,  # Hộp mực 12A
                    transaction_type="IN",
                    quantity=10,
                    unit_price=180000,
                    total_amount=1800000,
                    provider_or_dept="Công ty Thiết bị Máy tính Phúc Anh",
                    status="APPROVED",
                    notes="Nhập kho dự phòng mực in"
                ),
            ]
            db.add_all(sample_txs)
            db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    init_database()
    print("[OK] Database initialized and sample seed data loaded successfully!")

